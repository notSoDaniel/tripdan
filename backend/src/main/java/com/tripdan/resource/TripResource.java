package com.tripdan.resource;

import com.tripdan.model.Trip;
import io.quarkus.panache.common.Sort;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@Path("/api/trips")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class TripResource {

    @Inject
    JsonWebToken jwt;

    @GET
    @Transactional
    public List<Trip> list() {
        List<Trip> trips = Trip.list("userId = ?1", Sort.by("startDate"), currentUserId());
        trips.forEach(t -> { t.checklistItems.size(); t.expenses.size(); });
        return trips;
    }

    @GET
    @Path("/{id}")
    @Transactional
    public Trip get(@PathParam("id") Long id) {
        Trip trip = Trip.findById(id);
        if (trip == null || !currentUserId().equals(trip.userId)) throw new NotFoundException("Trip not found: " + id);
        trip.checklistItems.size();
        trip.expenses.size();
        return trip;
    }

    @POST
    @Transactional
    public Response create(@Valid Trip trip) {
        trip.id = null;
        trip.userId = currentUserId();
        trip.persist();
        return Response.status(Response.Status.CREATED).entity(trip).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Trip update(@PathParam("id") Long id, @Valid Trip data) {
        Trip trip = Trip.findById(id);
        if (trip == null || !currentUserId().equals(trip.userId)) throw new NotFoundException("Trip not found: " + id);
        trip.name = data.name;
        trip.destination = data.destination;
        trip.startDate = data.startDate;
        trip.endDate = data.endDate;
        trip.status = data.status;
        return trip;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        Trip trip = Trip.findById(id);
        if (trip == null || !currentUserId().equals(trip.userId)) throw new NotFoundException("Trip not found: " + id);
        trip.delete();
        return Response.noContent().build();
    }

    private Long currentUserId() {
        return Long.valueOf(jwt.getSubject());
    }
}
