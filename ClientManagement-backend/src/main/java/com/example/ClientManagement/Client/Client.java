package com.example.ClientManagement.Client;

import com.example.ClientManagement.DTO.ClientRequestDTO;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @ElementCollection
    @CollectionTable(name = "client_emails", joinColumns = @JoinColumn(name = "client_id"))
    @Column(name = "email")
    private List<String> emails = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "client_telephones", joinColumns = @JoinColumn(name = "client_id"))
    @Column(name = "telephone")
    private List<String> telephones = new ArrayList<>();

    private LocalDate creationDate;
    private LocalTime creationTime;

    // Default constructor (required by JPA)
    public Client() {
    }

    // Constructor with DTO
    public Client(ClientRequestDTO data) {
        this.name = data.name();
        this.emails = data.emails() != null ? new ArrayList<>(data.emails()) : new ArrayList<>();
        this.telephones = data.telephones() != null ? new ArrayList<>(data.telephones()) : new ArrayList<>();
        this.creationDate = LocalDate.now();
        this.creationTime = LocalTime.now();
    }

    // All args constructor
    public Client(String id, String name, List<String> emails, List<String> telephones, LocalDate creationDate, LocalTime creationTime) {
        this.id = id;
        this.name = name;
        this.emails = emails != null ? emails : new ArrayList<>();
        this.telephones = telephones != null ? telephones : new ArrayList<>();
        this.creationDate = creationDate;
        this.creationTime = creationTime;
    }

    // Getters
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

    // Setters
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

    // equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Client client = (Client) o;
        return Objects.equals(id, client.id) &&
                Objects.equals(name, client.name) &&
                Objects.equals(emails, client.emails) &&
                Objects.equals(telephones, client.telephones) &&
                Objects.equals(creationDate, client.creationDate) &&
                Objects.equals(creationTime, client.creationTime);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, emails, telephones, creationDate, creationTime);
    }

    // toString
    @Override
    public String toString() {
        return "Client{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", emails=" + emails +
                ", telephones=" + telephones +
                ", creationDate=" + creationDate +
                ", creationTime=" + creationTime +
                '}';
    }
}