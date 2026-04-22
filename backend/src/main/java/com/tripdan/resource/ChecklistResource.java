package com.tripdan.resource;

import com.tripdan.model.ChecklistItem;
import com.tripdan.model.Trip;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/trips/{tripId}/checklist")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ChecklistResource {

    @GET
    public List<ChecklistItem> list(@PathParam("tripId") Long tripId) {
        requireTrip(tripId);
        return ChecklistItem.findByTrip(tripId);
    }

    @POST
    @Transactional
    public Response create(@PathParam("tripId") Long tripId, @Valid ChecklistItem item) {
        item.trip = requireTrip(tripId);
        item.id = null;
        item.persist();
        return Response.status(Response.Status.CREATED).entity(item).build();
    }

    @PATCH
    @Path("/{itemId}/toggle")
    @Transactional
    public ChecklistItem toggle(@PathParam("tripId") Long tripId, @PathParam("itemId") Long itemId) {
        ChecklistItem item = ChecklistItem.findById(itemId);
        if (item == null || !item.trip.id.equals(tripId)) throw new NotFoundException();
        item.checked = !item.checked;
        return item;
    }

    @DELETE
    @Path("/{itemId}")
    @Transactional
    public Response delete(@PathParam("tripId") Long tripId, @PathParam("itemId") Long itemId) {
        ChecklistItem item = ChecklistItem.findById(itemId);
        if (item == null || !item.trip.id.equals(tripId)) throw new NotFoundException();
        item.delete();
        return Response.noContent().build();
    }

    private Trip requireTrip(Long tripId) {
        Trip trip = Trip.findById(tripId);
        if (trip == null) throw new NotFoundException("Trip not found: " + tripId);
        return trip;
    }
}
