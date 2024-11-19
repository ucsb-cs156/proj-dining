// package edu.ucsb.cs156.dining.controllers;

// import edu.ucsb.cs156.dining.models.CurrentUser;

// import io.swagger.v3.oas.annotations.Operation;
// import io.swagger.v3.oas.annotations.tags.Tag;

// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// /**
//  * This is a REST controller for getting information about the current user.
//  */

// @Tag(name="Current User Information")
// @RequestMapping("/api/currentUser")
// @RestController
// public class UserInfoController extends ApiController {
 
//   /**
//    * This method returns the current user.
//    * @return the current user
//    */

//   @Operation(summary= "Get information about current user")
//   @PreAuthorize("hasRole('ROLE_USER')")
//   @GetMapping("")
//   public CurrentUser getCurrentUser() {
//     return super.getCurrentUser();
//   }
// }

package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.repositories.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

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

    /**
     * This method allows the user to update their alias.
     * @param alias the new alias
     * @return the updated user
     */
    @Operation(summary = "Update alias of the current user")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/updateAlias")
    public User updateAlias(@RequestParam String alias) {
        CurrentUser currentUser = super.getCurrentUser();
        User user = currentUser.getUser();
        
        user.setAlias(alias);  // Update alias
        userRepository.save(user);  // Save updated user
        
        return user;
    }

    /**
     * This method allows an admin to update the moderation status of a user.
     * @param userId the id of the user to update
     * @param moderation the new moderation status
     * @return the updated user
     */
    @Operation(summary = "Update moderation status of a user (admin only)")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/updateAliasModeration")
    public ResponseEntity<?> updateAliasModeration(
            @RequestParam long userId, 
            @RequestParam boolean moderation) {
        
        Optional<User> optionalUser = userRepository.findById(userId);
        
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("User not found.");
        }
        
        User user = optionalUser.get();
        user.setModeration(moderation);  // Update moderation status
        userRepository.save(user);  // Save updated user
        
        return ResponseEntity.ok(user);
    }
}
