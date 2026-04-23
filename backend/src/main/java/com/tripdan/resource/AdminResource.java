package com.tripdan.resource;

import com.tripdan.model.Trip;
import com.tripdan.model.User;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.List;

@Path("/api/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN")
public class AdminResource {

    record UserInfo(Long id, String email, String role, LocalDateTime createdAt) {}
    record RoleRequest(String role) {}
    record TripInfo(Long id, Long userId, String userEmail, String name, String destination,
                    String startDate, String endDate, String status) {}

    @GET
    @Path("/users")
    public List<UserInfo> listUsers() {
        return User.<User>listAll().stream()
                .map(u -> new UserInfo(u.id, u.email, u.role.name(), u.createdAt))
                .toList();
    }

    @PUT
    @Path("/users/{id}/role")
    @Transactional
    public UserInfo setRole(@PathParam("id") Long id, RoleRequest req) {
        User user = User.findById(id);
        if (user == null) throw new NotFoundException("User not found: " + id);
        try {
            user.role = User.Role.valueOf(req.role());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + req.role());
        }
        return new UserInfo(user.id, user.email, user.role.name(), user.createdAt);
    }

    @DELETE
    @Path("/users/{id}")
    @Transactional
    public Response deleteUser(@PathParam("id") Long id) {
        User user = User.findById(id);
        if (user == null) throw new NotFoundException("User not found: " + id);
        Trip.delete("userId", user.id);
        user.delete();
        return Response.noContent().build();
    }

    @GET
    @Path("/trips")
    @Transactional
    public List<TripInfo> listAllTrips() {
        return Trip.<Trip>listAll().stream().map(t -> {
            User owner = User.findById(t.userId);
            String email = owner != null ? owner.email : null;
            return new TripInfo(t.id, t.userId, email, t.name, t.destination,
                    t.startDate != null ? t.startDate.toString() : null,
                    t.endDate != null ? t.endDate.toString() : null,
                    t.status != null ? t.status.name() : null);
        }).toList();
    }
}
