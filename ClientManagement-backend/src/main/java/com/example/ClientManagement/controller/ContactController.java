package com.example.ClientManagement.controller;

import com.example.ClientManagement.Contact.Contact;
import com.example.ClientManagement.Contact.ContactRepository;
import com.example.ClientManagement.DTO.ContactRequestDTO;
import com.example.ClientManagement.DTO.ContactResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("contact")
public class ContactController {

    @Autowired
    private ContactRepository repository;

    @PostMapping
    public ContactResponseDTO saveContact(@RequestBody ContactRequestDTO data) {
        Contact contact = new Contact(data);
        Contact saved = repository.save(contact);
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
        return savedContacts.stream().map(ContactResponseDTO::new).toList();
    }

    @GetMapping
    public List<ContactResponseDTO> getAll() {
        return repository.findAll().stream().map(ContactResponseDTO::new).toList();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteContact(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
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
                    return ResponseEntity.ok(new ContactResponseDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
