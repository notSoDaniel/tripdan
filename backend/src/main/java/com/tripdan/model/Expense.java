package com.tripdan.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense extends PanacheEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    public Trip trip;

    @NotBlank
    @Column(nullable = false)
    public String description;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 10, scale = 2)
    public BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ExpenseCategory category = ExpenseCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ExpenseType type = ExpenseType.PLANNED;

    @Column(name = "expense_date")
    public LocalDate expenseDate;

    public static java.util.List<Expense> findByTrip(Long tripId) {
        return list("trip.id", tripId);
    }

    public enum ExpenseCategory {
        TRANSPORT, ACCOMMODATION, FOOD, LEISURE, SHOPPING, OTHER
    }

    public enum ExpenseType {
        PLANNED, ACTUAL
    }
}
