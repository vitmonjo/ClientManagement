package com.example.ClientManagement.controller;

import com.example.ClientManagement.Client.Client;
import com.example.ClientManagement.Client.ClientRepository;
import com.example.ClientManagement.DTO.ClientRequestDTO;
import com.example.ClientManagement.DTO.ClientResponseDTO;
import com.example.ClientManagement.service.KafkaProducerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("client")
public class ClientController {

    private final KafkaProducerService kafkaProducerService; // Change back to this

    public ClientController(KafkaProducerService kafkaProducerService) { // Change back to this
        this.kafkaProducerService = kafkaProducerService;
    }

    @Autowired
    private ClientRepository repository;

    @PostMapping("/insert-dummy-clients")
    public List<ClientResponseDTO> insertDummyClients() {
        List<Client> dummyClients = new ArrayList<>();

        for (int i = 1; i <= 20; i++) {
            Client client = new Client();
            client.setName("Client " + i);

            client.getEmails().add("client" + i + "@example.com");
            client.getEmails().add("client" + i + ".alt@example.com");

            client.getTelephones().add("(555) 123-45" + String.format("%02d", i));
            client.getTelephones().add("(555) 987-65" + String.format("%02d", i));

            client.setCreationDate(LocalDate.now());
            client.setCreationTime(LocalTime.now());

            dummyClients.add(client);
        }

        List<Client> savedClients = repository.saveAll(dummyClients);

        return savedClients.stream()
                .map(ClientResponseDTO::new)
                .toList();
    }

    @PostMapping
    public ClientResponseDTO saveClient(@RequestBody ClientRequestDTO data){
        Client client = new Client(data);
        Client savedClient = repository.save(client);

        String jsonMessage = String.format(
                "{\"action\":\"CLIENT_CREATED\",\"clientId\":\"%s\",\"name\":\"%s\",\"emails\":%s,\"telephones\":%s,\"timestamp\":\"%s\"}",
                savedClient.getId(),
                savedClient.getName(),
                savedClient.getEmails(),
                savedClient.getTelephones(),
                Instant.now()
        );

        kafkaProducerService.sendMessage("client-events", jsonMessage);
        return new ClientResponseDTO(savedClient);
    }

    @GetMapping
    public List<ClientResponseDTO> getAll(){
        return repository.findAll().stream().map(ClientResponseDTO::new).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponseDTO> getById(@PathVariable String id) {
        return repository.findById(id)
                .map(client -> ResponseEntity.ok(new ClientResponseDTO(client)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteClient(@PathVariable String id) {
        if (repository.existsById(id)) {
            // Get client data before deletion for the message
            Optional<Client> clientToDelete = repository.findById(id);

            // Force initialization of lazy collections while session is still active
            String clientName = "Unknown";
            List<String> emails = Collections.emptyList();
            List<String> telephones = Collections.emptyList();

            if (clientToDelete.isPresent()) {
                Client client = clientToDelete.get();
                clientName = client.getName();
                // Force lazy loading while session is active
                emails = client.getEmails() != null ? new ArrayList<>(client.getEmails()) : Collections.emptyList();
                telephones = client.getTelephones() != null ? new ArrayList<>(client.getTelephones()) : Collections.emptyList();
            }

            repository.deleteById(id);

            String jsonMessage = String.format(
                    "{\"action\":\"CLIENT_DELETED\",\"clientId\":\"%s\",\"name\":\"%s\",\"emails\":%s,\"telephones\":%s,\"timestamp\":\"%s\"}",
                    id,
                    clientName,
                    emails,
                    telephones,
                    Instant.now()
            );

            kafkaProducerService.sendMessage("client-events", jsonMessage);

            Map<String, String> response = Map.of(
                    "message", "Client deleted successfully",
                    "id", id,
                    "status", "success"
            );
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = Map.of(
                    "message", "Client not found",
                    "id", id,
                    "status", "error"
            );
            return ResponseEntity.status(404).body(response);
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ClientResponseDTO> patchClient(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return repository.findById(id)
                .map(client -> {
                    // Capture before state
                    String beforeMessage = String.format(
                            "{\"action\":\"CLIENT_UPDATE_BEFORE\",\"clientId\":\"%s\",\"name\":\"%s\",\"emails\":%s,\"telephones\":%s,\"timestamp\":\"%s\"}",
                            id,
                            client.getName(),
                            client.getEmails(),
                            client.getTelephones(),
                            Instant.now()
                    );
                    kafkaProducerService.sendMessage("client-events", beforeMessage);

                    // Apply updates
                    updates.forEach((key, value) -> {
                        switch (key) {
                            case "name" -> client.setName((String) value);
                            case "emails" -> {
                                if (value instanceof List<?> list) {
                                    client.setEmails(list.stream()
                                            .map(Object::toString)
                                            .collect(Collectors.toList()));
                                }
                            }
                            case "telephones" -> {
                                if (value instanceof List<?> list) {
                                    client.setTelephones(list.stream()
                                            .map(Object::toString)
                                            .collect(Collectors.toList()));
                                }
                            }
                        }
                    });

                    Client updatedClient = repository.save(client);

                    // Capture after state
                    String afterMessage = String.format(
                            "{\"action\":\"CLIENT_UPDATE_AFTER\",\"clientId\":\"%s\",\"name\":\"%s\",\"emails\":%s,\"telephones\":%s,\"fieldsUpdated\":%s,\"timestamp\":\"%s\"}",
                            id,
                            updatedClient.getName(),
                            updatedClient.getEmails(),
                            updatedClient.getTelephones(),
                            updates.keySet(),
                            Instant.now()
                    );
                    kafkaProducerService.sendMessage("client-events", afterMessage);

                    return ResponseEntity.ok(new ClientResponseDTO(updatedClient));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}