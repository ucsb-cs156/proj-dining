package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.CurrentUser;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.CurrentUserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * This is a REST controller for CurrentUser
 */

@Tag(name = "CurrentUser")
@RequestMapping("/api/currentUser")
@RestController
@Slf4j
public class CurrentUserController extends ApiController {

    @Autowired
    CurrentUserRepository currentUserRepository;

    /**
     * This method creates a new user. Accessible only to user with the role "ROLE_USER".
     * @param alias alias of the user
     * @return the save user
     */
    @Operation(summary= "Modify alias")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/updateAlias")
    public CurrentUser postUser(
        @Parameter(name="alias") @RequestParam String alias
        )
        {   

        CurrentUser users = new CurrentUser();
        users.setAlias(alias);

        CurrentUser savedCurrentUsers = currentUserRepository.save(users);

        return savedCurrentUsers;
    }

    /**
     * Update a single users. Accessible only to users with the role "ROLE_ADMIN".
     * @param modValue alias moderation value of the users
     * @param incoming the new users contents
     * @return the updated users object
     */
    @Operation(summary= "Update alias moderation value")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/updateModValue")
    public CurrentUser updateModValue(
            @Parameter(name="modValue") @RequestParam long modValue,
            @RequestBody @Valid CurrentUser incoming) {

        CurrentUser users = currentUserRepository.findById(modValue)
                .orElseThrow(() -> new EntityNotFoundException(CurrentUser.class, modValue));


        users.setModValue(incoming.getModValue());  

        currentUserRepository.save(users);

        return users;
    }
}
