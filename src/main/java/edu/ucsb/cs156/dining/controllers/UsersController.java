package edu.ucsb.cs156.dining.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.models.UserDataDTO;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.UserDataDTOService;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "User information (admin only)")
@RequestMapping("/api")
@RestController
public class UsersController extends ApiController {

  @Autowired UserRepository userRepository;

  @Autowired UserDataDTOService userDataDTOService;

  @Operation(summary = "Get a list of all users")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @GetMapping("/admin/users")
  public Page<UserDataDTO> users(Pageable pageable) throws JsonProcessingException {
    return userDataDTOService.getUserDataDTOs(pageable);
  }

  @Operation(summary = "Get a list of all users with a proposed alias")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @GetMapping("/admin/usersWithProposedAlias")
  public ResponseEntity<Iterable<User>> getUsersWithProposedAlias() {
    Iterable<User> users = userRepository.findByProposedAliasNotNull();
    return ResponseEntity.ok().body(users);
  }

  @Operation(summary = "Get all aliases needing moderation")
  @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_MODERATOR')")
  @GetMapping("/admin/users/needsmoderation")
  public ResponseEntity<Iterable<User>> getAliasesNeedingModeration() {
    Iterable<User> users =
        userRepository.findByStatusAndProposedAliasNotNull(ModerationStatus.AWAITING_REVIEW);

    return ResponseEntity.ok().body(users);
  }

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

  @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_MODERATOR')")
  @PutMapping("/currentUser/updateAliasModeration")
  public User updateAliasModeration(@RequestParam long id, @RequestParam Boolean approved) {
    User user =
        userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException(User.class, id));

    if (approved) {
      user.setAlias(user.getProposedAlias());
      user.setStatus(ModerationStatus.APPROVED);
      user.setDateApproved(LocalDate.now());
      user.setProposedAlias(null);
    } else {
      user.setStatus(ModerationStatus.REJECTED);
    }

    userRepository.save(user);

    return user;
  }
}
