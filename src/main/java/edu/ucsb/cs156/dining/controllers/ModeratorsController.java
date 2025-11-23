package edu.ucsb.cs156.dining.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.entities.Moderator;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * This is a REST controller for getting information about the moderators. These endpoints are only
 * accessible to users with the role "ROLE_ADMIN".
 */
@Tag(name = "Moderators")
@RequestMapping("/api/admin/moderators")
@RestController
@Slf4j
public class ModeratorsController extends ApiController {

  @Autowired private ModeratorRepository moderatorRepository;

  @Autowired private ObjectMapper mapper;

  /**
   * Create a new Moderator, available only to Admins.
   *
   * @param email the email of the moderator
   * @return the created Moderator
   */
  @Operation(summary = "Create a new Moderator")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public Moderator postModerator(@RequestParam String email) {
    String convertedEmail = email.trim().toLowerCase();

    Moderator moderator = Moderator.builder().email(convertedEmail).build();
    moderatorRepository.save(moderator);
    return moderator;
  }

  /**
   * Get a list of all moderators, available only to Admins.
   *
   * @return a list of all moderators
   */
  @Operation(summary = "List all Moderators")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @GetMapping("/get")
  public Iterable<Moderator> allModerators() {
    Iterable<Moderator> moderators = moderatorRepository.findAll();
    return moderators;
  }

  /** Delete a moderator by email, available only to Admins. */
  @Operation(summary = "Delete a Moderator by email")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("/delete")
  public ResponseEntity<String> deleteModerator(@RequestParam String email) {
    Moderator moderator = moderatorRepository.findById(email).orElse(null);

    if (moderator == null) {
      return ResponseEntity.status(404)
          .body(String.format("Moderator with email %s not found.", email));
    }

    moderatorRepository.delete(moderator);
    return ResponseEntity.status(200)
        .body(String.format("Moderator with email %s deleted.", email));
  }
}
