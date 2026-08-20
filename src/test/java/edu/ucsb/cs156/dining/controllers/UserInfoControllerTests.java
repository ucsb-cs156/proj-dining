package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.models.CurrentUserDTO;
import edu.ucsb.cs156.dining.models.UserDTO;
import edu.ucsb.cs156.dining.repositories.AdminRepository;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = UserInfoController.class)
@Import(TestConfig.class)
@TestPropertySource(properties = {"app.admin.emails=admin@example.org"})
public class UserInfoControllerTests extends ControllerTestCase {

  @MockBean UserRepository userRepository;
  @MockBean AdminRepository adminRepository;
  @MockBean ModeratorRepository moderatorRepository;

  @Test
  public void currentUser__logged_out() throws Exception {
    mockMvc.perform(get("/api/currentUser")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void currentUser__logged_in() throws Exception {

    // arrange

    CurrentUser currentUser = currentUserService.getCurrentUser();
    when(adminRepository.existsByEmail("user@example.org")).thenReturn(false);
    when(moderatorRepository.existsByEmail("user@example.org")).thenReturn(true);
    CurrentUserDTO currentUserDTO =
        new CurrentUserDTO(new UserDTO(currentUser.getUser(), false, true), currentUser.getRoles());
    String expectedJson = mapper.writeValueAsString(currentUserDTO);

    // act

    MvcResult response =
        mockMvc.perform(get("/api/currentUser")).andExpect(status().isOk()).andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(
      username = "admin",
      roles = {"USER"})
  @Test
  public void currentUser__admin_from_admin_emails__not_moderator() throws Exception {

    // arrange

    CurrentUser currentUser = currentUserService.getCurrentUser();
    when(moderatorRepository.existsByEmail("admin@example.org")).thenReturn(false);
    CurrentUserDTO currentUserDTO =
        new CurrentUserDTO(new UserDTO(currentUser.getUser(), true, false), currentUser.getRoles());
    String expectedJson = mapper.writeValueAsString(currentUserDTO);

    // act

    MvcResult response =
        mockMvc.perform(get("/api/currentUser")).andExpect(status().isOk()).andReturn();

    // assert
    verify(adminRepository, never()).existsByEmail("admin@example.org");
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(
      username = "repositoryadmin",
      roles = {"USER"})
  @Test
  public void currentUser__admin_from_repository__not_moderator() throws Exception {

    // arrange

    CurrentUser currentUser = currentUserService.getCurrentUser();
    when(adminRepository.existsByEmail("repositoryadmin@example.org")).thenReturn(true);
    when(moderatorRepository.existsByEmail("repositoryadmin@example.org")).thenReturn(false);
    CurrentUserDTO currentUserDTO =
        new CurrentUserDTO(new UserDTO(currentUser.getUser(), true, false), currentUser.getRoles());
    String expectedJson = mapper.writeValueAsString(currentUserDTO);

    // act

    MvcResult response =
        mockMvc.perform(get("/api/currentUser")).andExpect(status().isOk()).andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
}
