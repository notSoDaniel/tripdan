package com.tripdan.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
public class Trip extends PanacheEntity {

    @NotBlank
    @Column(nullable = false)
    public String name;

    @NotBlank
    @Column(nullable = false)
    public String destination;

    @NotNull
    @Column(name = "start_date", nullable = false)
    public LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    public LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public TripStatus status = TripStatus.PLANNED;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<ChecklistItem> checklistItems = new ArrayList<>();

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<Expense> expenses = new ArrayList<>();

    @PrePersist
    void onPersist() {
        createdAt = LocalDateTime.now();
    }

    public enum TripStatus {
        PLANNED, IN_PROGRESS, COMPLETED
    }
}
