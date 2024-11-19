package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


/**
 * This is a REST controller for getting information about the current user and modifying user details.
 */

@Tag(name="Current User Information")
@RequestMapping("/api/currentUser")
@RestController
public class UserInfoController extends ApiController {

    @Autowired
    private UserRepository userRepository;

    /**
     * This method returns the current user.
     * @return the current user
     */
    @Operation(summary= "Get information about current user")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public CurrentUser getCurrentUser() {
        return super.getCurrentUser();
    }

    // /**
    //  * This method allows the user to update their alias.
    //  * @param alias the new alias
    //  * @return the updated user
    //  */
    // @Operation(summary = "Update alias of the current user")
    // @PreAuthorize("hasRole('ROLE_USER')")
    // @PostMapping("/updateAlias")
    // public User updateAlias(@RequestParam String alias) {
    //     CurrentUser currentUser = super.getCurrentUser();
    //     User user = currentUser.getUser();
        
    //     user.setAlias(alias);  
    //     userRepository.save(user);  
        
    //     return user;
    // }

    // /**
    //  * This method allows an admin to update the moderation status of a user.
    //  * @param id the id of the user to update
    //  * @param moderation the new moderation status
    //  * @return the updated user
    //  */
    // @Operation(summary = "Update moderation status of a user (admin only)")
    // @PreAuthorize("hasRole('ROLE_ADMIN')")
    // @PutMapping("/updateAliasModeration")
    // public User updateAliasModeration(
    //         @RequestParam long id, 
    //         @RequestParam boolean moderation) {
        
    //     User user = userRepository.findById(id)
    //         .orElseThrow(() -> new EntityNotFoundException(User.class, id));
        
    //     user.setModeration(moderation);  
    //     userRepository.save(user);  
        
    //     return user;
    // }
}