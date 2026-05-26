package edu.ucsb.cs156.dining.models;

import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;

/** Response model for the current user endpoint. */
public record CurrentUserDTO(UserDTO user, Collection<? extends GrantedAuthority> roles) {}
