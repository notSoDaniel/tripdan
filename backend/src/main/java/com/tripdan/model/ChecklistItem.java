package com.tripdan.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "checklist_items")
public class ChecklistItem extends PanacheEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    public Trip trip;

    @NotBlank
    @Column(nullable = false)
    public String description;

    @Column(nullable = false)
    public boolean checked = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ItemCategory category = ItemCategory.OTHER;

    public enum ItemCategory {
        DOCUMENTS, CLOTHING, HYGIENE, ELECTRONICS, MEDICATION, OTHER
    }

    public static java.util.List<ChecklistItem> findByTrip(Long tripId) {
        return list("trip.id", tripId);
    }
}
