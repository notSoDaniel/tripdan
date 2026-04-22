package com.tripdan.resource;

import com.tripdan.model.Expense;
import com.tripdan.model.Trip;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Path("/api/trips/{tripId}/expenses")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ExpenseResource {

    @GET
    public List<Expense> list(@PathParam("tripId") Long tripId) {
        requireTrip(tripId);
        return Expense.findByTrip(tripId);
    }

    @GET
    @Path("/summary")
    public Map<String, BigDecimal> summary(@PathParam("tripId") Long tripId) {
        requireTrip(tripId);
        List<Expense> all = Expense.findByTrip(tripId);
        BigDecimal planned = all.stream()
                .filter(e -> e.type == Expense.ExpenseType.PLANNED)
                .map(e -> e.amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal actual = all.stream()
                .filter(e -> e.type == Expense.ExpenseType.ACTUAL)
                .map(e -> e.amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return Map.of("planned", planned, "actual", actual, "balance", planned.subtract(actual));
    }

    @POST
    @Transactional
    public Response create(@PathParam("tripId") Long tripId, @Valid Expense expense) {
        expense.trip = requireTrip(tripId);
        expense.id = null;
        expense.persist();
        return Response.status(Response.Status.CREATED).entity(expense).build();
    }

    @PUT
    @Path("/{expenseId}")
    @Transactional
    public Expense update(@PathParam("tripId") Long tripId, @PathParam("expenseId") Long expenseId, @Valid Expense data) {
        Expense expense = findOrThrow(tripId, expenseId);
        expense.description = data.description;
        expense.amount = data.amount;
        expense.category = data.category;
        expense.type = data.type;
        expense.expenseDate = data.expenseDate;
        return expense;
    }

    @DELETE
    @Path("/{expenseId}")
    @Transactional
    public Response delete(@PathParam("tripId") Long tripId, @PathParam("expenseId") Long expenseId) {
        findOrThrow(tripId, expenseId).delete();
        return Response.noContent().build();
    }

    private Trip requireTrip(Long tripId) {
        Trip trip = Trip.findById(tripId);
        if (trip == null) throw new NotFoundException("Trip not found: " + tripId);
        return trip;
    }

    private Expense findOrThrow(Long tripId, Long expenseId) {
        Expense e = Expense.findById(expenseId);
        if (e == null || !e.trip.id.equals(tripId)) throw new NotFoundException();
        return e;
    }
}
