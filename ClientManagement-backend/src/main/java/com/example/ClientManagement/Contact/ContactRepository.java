package com.example.ClientManagement.Contact;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, String> {
    List<Contact> findByClientId(String clientId);
}
