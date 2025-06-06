package com.example.ClientManagement.controller;

import com.example.ClientManagement.Contact.Contact;
import com.example.ClientManagement.Contact.ContactRepository;
import com.example.ClientManagement.DTO.ContactRequestDTO;
import com.example.ClientManagement.DTO.ContactResponseDTO;
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
@RequestMapping("contact")
public class ContactController {

    @Autowired
    private ContactRepository repository;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @PostMapping
    public ContactResponseDTO saveContact(@RequestBody ContactRequestDTO data) {
        Contact contact = new Contact(data);
        Contact saved = repository.save(contact);

        String jsonMessage = String.format(
                "{\"action\":\"CONTACT_CREATED\",\"contactId\":\"%s\",\"name\":\"%s\",\"emails\":%s,\"telephones\":%s,\"clientId\":\"%s\",\"timestamp\":\"%s\"}",
                saved.getId(),
                saved.getName(),
                saved.getEmails(),
                saved.getTelephones(),
                saved.getClientId(),
                Instant.now()
        );

        kafkaProducerService.sendMessage("contact-events", jsonMessage);
        return new ContactResponseDTO(saved);
    }

    @PostMapping("/insert-dummy-contacts")
    public List<ContactResponseDTO> insertDummyContacts() {
        List<Contact> dummyContacts = new ArrayList<>();

        for (int i = 1; i <= 20; i++) {
            Contact contact = new Contact();
            contact.setName("Contact " + i);
            contact.setEmails(Collections.singletonList("contact" + i + "@example.com"));
            contact.setTelephones(Collections.singletonList("(555) 000-00" + String.format("%02d", i)));
            contact.setClientId("dummy-client-id-" + i);
            contact.setCreationDate(LocalDate.now());
            contact.setCreationTime(LocalTime.now());
            dummyContacts.add(contact);
        }

        List<Contact> savedContacts = repository.saveAll(dummyContacts);

        // Send bulk creation message
        String bulkMessage = String.format(
                "{\"action\":\"CONTACTS_BULK_CREATED\",\"count\":%d,\"timestamp\":\"%s\"}",
                savedContacts.size(),
                Instant.now()
        );
        kafkaProducerService.sendMessage("contact-events", bulkMessage);

        return savedContacts.stream().map(ContactResponseDTO::new).toList();
    }

    @GetMapping
    public List<ContactResponseDTO> getAll() {
        return repository.findAll().stream().map(ContactResponseDTO::new).toList();
    }

    @GetMapping("/{clientId}")
    public ResponseEntity<List<ContactResponseDTO>> getByClientId(@PathVariable String clientId) {
        List<Contact> contacts = repository.findByClientId(clientId);
        if (contacts.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<ContactResponseDTO> result = contacts.stream()
                .map(ContactResponseDTO::new)
                .toList();

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteContact(@PathVariable String id) {
        if (repository.existsById(id)) {
            // Get contact data before deletion for the message
            Optional<Contact> contactToDelete = repository.findById(id);

            // Force initialization of lazy collections while session is still active
            String contactName = "Unknown";
            List<String> emails = Collections.emptyList();
            List<String> telephones = Collections.emptyList();
            String clientId = "Unknown";

            if (contactToDelete.isPresent()) {
                Contact contact = contactToDelete.get();
                contactName = contact.getName();
                clientId = contact.getClientId();
                // Force lazy loading while session is active
                emails = contact.getEmails() != null ? new ArrayList<>(contact.getEmails()) : Collections.emptyList();
                telephones = contact.getTelephones() != null ? new ArrayList<>(contact.getTelephones()) : Collections.emptyList();
            }

            repository.deleteById(id);

            String enrichedMessage = String.format(
                    "{\"action\":\"CONTACT_DELETED\",\"contactId\":\"%s\",\"name\":\"%s\",\"emails\":%s,\"telephones\":%s,\"clientId\":\"%s\",\"timestamp\":\"%s\"}",
                    id,
                    contactName,
                    emails,
                    telephones,
                    clientId,
                    Instant.now()
            );

            kafkaProducerService.sendMessage("contact-events", enrichedMessage);

            return ResponseEntity.ok(Map.of(
                    "message", "Contact deleted successfully",
                    "id", id,
                    "status", "success"
            ));
        } else {
            return ResponseEntity.status(404).body(Map.of(
                    "message", "Contact not found",
                    "id", id,
                    "status", "error"
            ));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ContactResponseDTO> patchContact(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return repository.findById(id)
                .map(contact -> {
                    // Capture before state
                    String beforeMessage = String.format(
                            "{\"action\":\"CONTACT_UPDATE_BEFORE\",\"contactId\":\"%s\",\"name\":\"%s\",\"emails\":%s,\"telephones\":%s,\"clientId\":\"%s\",\"timestamp\":\"%s\"}",
                            id,
                            contact.getName(),
                            contact.getEmails(),
                            contact.getTelephones(),
                            contact.getClientId(),
                            Instant.now()
                    );
                    kafkaProducerService.sendMessage("contact-events", beforeMessage);

                    // Apply updates
                    updates.forEach((key, value) -> {
                        switch (key) {
                            case "name" -> contact.setName((String) value);
                            case "clientId" -> contact.setClientId((String) value);
                            case "emails" -> {
                                if (value instanceof List<?> list) {
                                    contact.setEmails(list.stream()
                                            .map(Object::toString)
                                            .collect(Collectors.toList()));
                                }
                            }
                            case "telephones" -> {
                                if (value instanceof List<?> list) {
                                    contact.setTelephones(list.stream()
                                            .map(Object::toString)
                                            .collect(Collectors.toList()));
                                }
                            }
                        }
                    });

                    Contact updated = repository.save(contact);

                    // Capture after state
                    String afterMessage = String.format(
                            "{\"action\":\"CONTACT_UPDATE_AFTER\",\"contactId\":\"%s\",\"name\":\"%s\",\"emails\":%s,\"telephones\":%s,\"clientId\":\"%s\",\"fieldsUpdated\":%s,\"timestamp\":\"%s\"}",
                            id,
                            updated.getName(),
                            updated.getEmails(),
                            updated.getTelephones(),
                            updated.getClientId(),
                            updates.keySet(),
                            Instant.now()
                    );
                    kafkaProducerService.sendMessage("contact-events", afterMessage);

                    return ResponseEntity.ok(new ContactResponseDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
