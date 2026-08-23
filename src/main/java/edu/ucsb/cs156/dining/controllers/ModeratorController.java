package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.Moderator;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import edu.ucsb.cs156.dining.utilities.CanonicalFormConverter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** This is a REST controller for Moderator */
@Tag(name = "Moderator")
@RequestMapping("/api/admin/moderators")
@RestController
@Slf4j
public class ModeratorController extends ApiController {
  @Autowired ModeratorRepository moderatorRepository;

  /**
   * Create a new moderator
   *
   * @param email the email in typical email format
   * @return the saved moderator
   */
  @Operation(summary = "Create a new moderator")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public Moderator postModerator(@Parameter(name = "email") @RequestParam String email) {
    String convertedEmail = CanonicalFormConverter.convertToValidEmail(email);
    if (moderatorRepository.findByEmail(convertedEmail).isPresent()) {
      throw new IllegalArgumentException("%s is already a moderator".formatted(convertedEmail));
    }
    Moderator moderator = new Moderator(convertedEmail);
    Moderator savedModerator = moderatorRepository.save(moderator);
    return savedModerator;
  }

  /**
   * List all moderators
   *
   * @return an iterable of Moderator
   */
  @Operation(summary = "List all moderators")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @GetMapping("/all")
  public Iterable<Moderator> allModerators() {
    return moderatorRepository.findAll();
  }

  /**
   * Delete a Moderator
   *
   * @param email the email of the moderator to delete
   * @return a message indicating the moderator was deleted
   */
  @Operation(summary = "Delete a Moderator")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("/delete")
  public Object deleteModerator(@Parameter(name = "email") @RequestParam String email) {
    List<Moderator> moderators = moderatorRepository.findAllByEmail(email);
    if (moderators.isEmpty()) {
      throw new EntityNotFoundException(Moderator.class, email);
    }
    moderatorRepository.deleteByEmail(email);
    return genericMessage("Moderator with id %s deleted".formatted(email));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> handleIllegalArgumentException(
      IllegalArgumentException ex) {
    return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
  }
}
