package com.tripdan.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.Optional;

@Entity
@Table(name = "users")
public class User extends PanacheEntity {

    public enum Role { USER, ADMIN }

    @NotBlank
    @Column(unique = true, nullable = false)
    public String email;

    @NotBlank
    @Column(name = "password_hash", nullable = false)
    public String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Role role = Role.USER;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @PrePersist
    void onPersist() {
        createdAt = LocalDateTime.now();
    }

    public static Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }

    public static long countAdmins() {
        return count("role", Role.ADMIN);
    }
}
