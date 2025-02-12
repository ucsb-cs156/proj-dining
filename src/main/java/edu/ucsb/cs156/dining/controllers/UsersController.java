package edu.ucsb.cs156.dining.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

import java.time.LocalDate;

/**
 * This is a REST controller for getting information about the users.
 * 
 * These endpoints are only accessible to users with the role "ROLE_ADMIN".
 */

@Tag(name="User information (admin only)")
@RequestMapping("/api")
@RestController
public class UsersController extends ApiController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    ObjectMapper mapper;

    /**
     * This method returns a list of all users.  Accessible only to users with the role "ROLE_ADMIN".
     * @return a list of all users
     * @throws JsonProcessingException if there is an error processing the JSON
     */
    @Operation(summary= "Get a list of all users")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/admin/users")
    public ResponseEntity<String> users()
            throws JsonProcessingException {


        Iterable<User> users = userRepository.findAll();
        String body = mapper.writeValueAsString(users);
        return ResponseEntity.ok().body(body);
    }

    /**
     * This method returns list of all users with a proposed alias.
     * @return a list of users with a proposed alias
     * @throws JsonProcessingException if there is an error processing the JSON
     */
    @Operation(summary = "Get a list of all users with a proposed alias")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/admin/usersWithProposedAlias")
    public ResponseEntity<String> getUsersWithProposedAlias()
            throws JsonProcessingException {
        Iterable<User> users = userRepository.findByProposedAliasNotNull();
        String body = mapper.writeValueAsString(users);
        return ResponseEntity.ok().body(body);
    }

    /**
     * This method allows the user to update their alias.
     * @param proposedAlias the new alias
     * @return the updated user
     */
    @Operation(summary = "Update proposed alias of the current user")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/currentUser/updateAlias")
    public ResponseEntity<User> updateProposedAlias(@RequestParam String proposedAlias) {
        CurrentUser currentUser = super.getCurrentUser();
        User user = currentUser.getUser();

        if (userRepository.findByAlias(proposedAlias).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alias already in use.");
        }
    
        user.setProposedAlias(proposedAlias);
        user.setStatus(ModerationStatus.AWAITING_REVIEW);
        User savedUser = userRepository.save(user);
    
        return ResponseEntity.ok(savedUser);
    }
    
    /**
     * This method allows an admin to update the moderation status of a user's alias.
     * @param id the id of the user to update
     * @param approved the new moderation status 
     * @return the updated user
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/currentUser/updateAliasModeration")
    public User updateAliasModeration(
            @RequestParam long id, 
            @RequestParam Boolean approved) {
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException(User.class, id));
        

        if (approved) {
            user.setAlias(user.getProposedAlias());  
            user.setStatus(ModerationStatus.APPROVED);
            user.setDateApproved(LocalDate.now());
            user.setProposedAlias(null);
        } else {
            user.setStatus(ModerationStatus.REJECTED);
            user.setProposedAlias(null);
        }
        
        userRepository.save(user);

        return user;
    }
}