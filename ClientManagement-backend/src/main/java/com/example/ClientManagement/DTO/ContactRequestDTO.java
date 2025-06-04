package com.example.ClientManagement.DTO;

import java.util.List;

public record ContactRequestDTO(
        String name,
        List<String> emails,
        List<String> telephones,
        String clientId
) {}
