package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.models.CurrentUserDTO;
import edu.ucsb.cs156.dining.models.UserDTO;
import edu.ucsb.cs156.dining.repositories.AdminRepository;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This is a REST controller for getting information about the current user. */
@Tag(name = "Current User Information")
@RequestMapping("/api/currentUser")
@RestController
public class UserInfoController extends ApiController {

  @Value("#{'${app.admin.emails}'.split(',')}")
  private final List<String> adminEmails = new ArrayList<>();

  @Autowired AdminRepository adminRepository;

  @Autowired ModeratorRepository moderatorRepository;

  /**
   * This method returns the current user.
   *
   * @return the current user
   */
  @Operation(summary = "Get information about current user")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public CurrentUserDTO currentUser() {
    CurrentUser currentUser = super.getCurrentUser();
    User user = currentUser.getUser();
    UserDTO userDTO =
        new UserDTO(
            user,
            adminEmails.contains(user.getEmail()) || adminRepository.existsByEmail(user.getEmail()),
            moderatorRepository.existsByEmail(user.getEmail()));
    return new CurrentUserDTO(userDTO, currentUser.getRoles());
  }
}
