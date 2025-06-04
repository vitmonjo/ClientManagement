package com.example.ClientManagement.Contact;

import com.example.ClientManagement.DTO.ClientRequestDTO;
import com.example.ClientManagement.DTO.ContactRequestDTO;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @ElementCollection
    @CollectionTable(name = "contact_emails", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "email")
    private List<String> emails = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "contact_telephones", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "telephone")
    private List<String> telephones = new ArrayList<>();

    private LocalDate creationDate;
    private LocalTime creationTime;

    @Column(name = "client_id", nullable = false)
    private String clientId;

    public Contact() {
    }

    public Contact(String name, List<String> emails, List<String> telephones, String clientId) {
        this.name = name;
        this.emails = emails != null ? emails : new ArrayList<>();
        this.telephones = telephones != null ? telephones : new ArrayList<>();
        this.creationDate = LocalDate.now();
        this.creationTime = LocalTime.now();
        this.clientId = clientId;
    }

    // Constructor with DTO
    public Contact(ContactRequestDTO data) {
        this.name = data.name();
        this.emails = data.emails() != null ? new ArrayList<>(data.emails()) : new ArrayList<>();
        this.telephones = data.telephones() != null ? new ArrayList<>(data.telephones()) : new ArrayList<>();
        this.creationDate = LocalDate.now();
        this.creationTime = LocalTime.now();
        this.clientId = data.clientId();
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<String> getEmails() {
        return emails;
    }

    public List<String> getTelephones() {
        return telephones;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    public LocalTime getCreationTime() {
        return creationTime;
    }

    public String getClientId() {
        return clientId;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmails(List<String> emails) {
        this.emails = emails != null ? emails : new ArrayList<>();
    }

    public void setTelephones(List<String> telephones) {
        this.telephones = telephones != null ? telephones : new ArrayList<>();
    }

    public void setCreationDate(LocalDate creationDate) {
        this.creationDate = creationDate;
    }

    public void setCreationTime(LocalTime creationTime) {
        this.creationTime = creationTime;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    // equals, hashCode, and toString

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Contact contact)) return false;
        return Objects.equals(id, contact.id) &&
                Objects.equals(name, contact.name) &&
                Objects.equals(emails, contact.emails) &&
                Objects.equals(telephones, contact.telephones) &&
                Objects.equals(creationDate, contact.creationDate) &&
                Objects.equals(creationTime, contact.creationTime) &&
                Objects.equals(clientId, contact.clientId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, emails, telephones, creationDate, creationTime, clientId);
    }

    @Override
    public String toString() {
        return "Contact{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", emails=" + emails +
                ", telephones=" + telephones +
                ", creationDate=" + creationDate +
                ", creationTime=" + creationTime +
                ", clientId=" + clientId +
                '}';
    }
}
