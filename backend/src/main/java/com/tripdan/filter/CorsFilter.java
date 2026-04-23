package com.tripdan.filter;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.container.PreMatching;
import jakarta.ws.rs.ext.Provider;

@Provider
@PreMatching
public class CorsFilter implements ContainerRequestFilter, ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext req) {
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            String origin = req.getHeaderString("Origin");
            jakarta.ws.rs.core.Response.ResponseBuilder rb = jakarta.ws.rs.core.Response.ok();
            if (origin != null) {
                rb.header("Access-Control-Allow-Origin", origin)
                  .header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS")
                  .header("Access-Control-Allow-Headers", "Content-Type,Authorization")
                  .header("Access-Control-Allow-Credentials", "true")
                  .header("Access-Control-Max-Age", "86400");
            }
            req.abortWith(rb.build());
        }
    }

    @Override
    public void filter(ContainerRequestContext req, ContainerResponseContext res) {
        String origin = req.getHeaderString("Origin");
        if (origin != null) {
            res.getHeaders().putSingle("Access-Control-Allow-Origin", origin);
            res.getHeaders().putSingle("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
            res.getHeaders().putSingle("Access-Control-Allow-Headers", "Content-Type,Authorization");
            res.getHeaders().putSingle("Access-Control-Allow-Credentials", "true");
        }
    }
}
