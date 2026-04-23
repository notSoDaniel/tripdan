package com.tripdan.resource;

import com.tripdan.model.User;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.build.Jwt;
import jakarta.annotation.security.PermitAll;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.Duration;
import java.util.Set;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
public class AuthResource {

    record RegisterRequest(String email, String password) {}
    record LoginRequest(String email, String password) {}
    record AuthResponse(String token, String email, String role) {}

    @POST
    @Path("/register")
    @Transactional
    public Response register(RegisterRequest req) {
        if (req.email() == null || req.email().isBlank() || req.password() == null || req.password().isBlank()) {
            throw new BadRequestException("Email and password are required");
        }
        if (User.findByEmail(req.email()).isPresent()) {
            throw new ClientErrorException("Email already in use", Response.Status.CONFLICT);
        }
        User user = new User();
        user.email = req.email().toLowerCase().trim();
        user.passwordHash = BcryptUtil.bcryptHash(req.password());
        user.persist();
        return Response.status(Response.Status.CREATED)
                .entity(new AuthResponse(generateToken(user), user.email, user.role.name()))
                .build();
    }

    @POST
    @Path("/login")
    @Transactional
    public AuthResponse login(LoginRequest req) {
        if (req.email() == null || req.password() == null) {
            throw new BadRequestException("Email and password are required");
        }
        User user = User.findByEmail(req.email().toLowerCase().trim())
                .orElseThrow(() -> new WebApplicationException("Invalid credentials", 401));
        if (!BcryptUtil.matches(req.password(), user.passwordHash)) {
            throw new WebApplicationException("Invalid credentials", 401);
        }
        return new AuthResponse(generateToken(user), user.email, user.role.name());
    }

    @POST
    @Path("/bootstrap")
    @Transactional
    public Response bootstrap(RegisterRequest req) {
        if (User.countAdmins() > 0) {
            throw new ClientErrorException("Admin already exists", Response.Status.CONFLICT);
        }
        if (req.email() == null || req.email().isBlank() || req.password() == null || req.password().isBlank()) {
            throw new BadRequestException("Email and password are required");
        }
        User user = new User();
        user.email = req.email().toLowerCase().trim();
        user.passwordHash = BcryptUtil.bcryptHash(req.password());
        user.role = User.Role.ADMIN;
        user.persist();
        return Response.status(Response.Status.CREATED)
                .entity(new AuthResponse(generateToken(user), user.email, user.role.name()))
                .build();
    }

    private String generateToken(User user) {
        return Jwt.issuer("tripdan")
                .subject(user.id.toString())
                .claim("email", user.email)
                .groups(Set.of(user.role.name()))
                .expiresIn(Duration.ofDays(30))
                .sign();
    }
}
