package com.example.ClientManagement.DTO;

import com.example.ClientManagement.Contact.Contact;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ContactResponseDTO(String id, String name, List<String> emails, List<String> telephones, LocalDate creationDate, LocalTime creationTime, String clientId) {

    // Fixed constructor with correct parameter mapping
    public ContactResponseDTO(Contact contact) {
        this(
                contact.getId(),
                contact.getName(),
                contact.getEmails(),
                contact.getTelephones(),
                contact.getCreationDate(),
                contact.getCreationTime(),
                contact.getClientId()
        );
    }
}