package com.tripdan.resource;

import com.tripdan.model.Trip;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/trips")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TripResource {

    @GET
    public List<Trip> list() {
        return Trip.listAll();
    }

    @GET
    @Path("/{id}")
    public Trip get(@PathParam("id") Long id) {
        Trip trip = Trip.findById(id);
        if (trip == null) throw new NotFoundException("Trip not found: " + id);
        return trip;
    }

    @POST
    @Transactional
    public Response create(@Valid Trip trip) {
        trip.id = null;
        trip.persist();
        return Response.status(Response.Status.CREATED).entity(trip).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Trip update(@PathParam("id") Long id, @Valid Trip data) {
        Trip trip = Trip.findById(id);
        if (trip == null) throw new NotFoundException("Trip not found: " + id);
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
        boolean deleted = Trip.deleteById(id);
        if (!deleted) throw new NotFoundException("Trip not found: " + id);
        return Response.noContent().build();
    }
}
