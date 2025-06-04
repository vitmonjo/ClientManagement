package com.example.ClientManagement.DTO;

import java.util.List;

public record ClientRequestDTO(
        String name,
        List<String> emails,
        List<String> telephones
) {}
