package com.example.ClientManagement.DTO;

import com.example.ClientManagement.Client.Client;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ClientResponseDTO(String id, String name, List<String> emails, List<String> telephones, LocalDate creationDate, LocalTime creationTime) {

    // Fixed constructor with correct parameter mapping
    public ClientResponseDTO(Client client) {
        this(
                client.getId(),
                client.getName(),
                client.getEmails(),
                client.getTelephones(),
                client.getCreationDate(),
                client.getCreationTime()
        );
    }
}