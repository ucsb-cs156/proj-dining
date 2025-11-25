package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.Moderator;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = ModeratorController.class)
@Import(TestConfig.class)
public class ModeratorControllerTests extends ControllerTestCase {

  @MockitoBean ModeratorRepository moderatorRepository;
  @MockitoBean UserRepository userRepository;

  // Tests for the POST endpoint
  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc
        .perform(post("/api/admin/moderators/post"))
        .andExpect(status().is(403)); // logged out users cannot post
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_cannot_post() throws Exception {
    mockMvc
        .perform(post("/api/admin/moderators/post"))
        .andExpect(status().is(403)); // logged in users cannot post
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admins_can_post() throws Exception {
    // arrage
    Moderator moderator = Moderator.builder().email("ins@ucsb.edu").build();
    when(moderatorRepository.findAll()).thenReturn(new ArrayList<>(Arrays.asList(moderator)));

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/admin/moderators/post?email=ins@ucsb.edu").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(moderatorRepository, times(1)).save(eq(moderator));
    String expectedJson = mapper.writeValueAsString(moderator);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  // Tests for the GET endpoint
  @Test
  public void logged_out_users_cannot_get() throws Exception {
    mockMvc
        .perform(get("/api/admin/moderators/get"))
        .andExpect(status().is(403)); // logged out users cannot get
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_cannot_get() throws Exception {
    mockMvc
        .perform(get("/api/admin/moderators/get"))
        .andExpect(status().is(403)); // logged in users cannot get
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admins_can_get() throws Exception {
    // arrage
    Moderator moderator = Moderator.builder().email("ins@ucsb.edu").build();
    ArrayList<Moderator> expectedModerators = new ArrayList<>();
    expectedModerators.addAll(Arrays.asList(moderator));
    when(moderatorRepository.findAll()).thenReturn(new ArrayList<>(Arrays.asList(moderator)));

    // act
    MvcResult response =
        mockMvc.perform(get("/api/admin/moderators/get")).andExpect(status().isOk()).andReturn();

    // assert
    verify(moderatorRepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedModerators);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  // Tests for the DELETE endpoint
  @Test
  public void logged_out_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/admin/moderators/delete"))
        .andExpect(status().is(403)); // logged out users cannot delete
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/admin/moderators/delete"))
        .andExpect(status().is(403)); // logged in users cannot delete
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admins_can_delete() throws Exception {
    // Arrange
    Moderator moderator = Moderator.builder().email("ins@ucsb.edu").build();
    when(moderatorRepository.findById(eq("ins@ucsb.edu"))).thenReturn(Optional.of(moderator));

    // Act
    MvcResult response =
        mockMvc
            .perform(
                delete("/api/admin/moderators/delete").param("email", "ins@ucsb.edu").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // Assert
    verify(moderatorRepository, times(1)).findById("ins@ucsb.edu");
    verify(moderatorRepository, times(1)).delete(moderator);
    String expectedMessage =
        String.format("Moderator with email %s deleted.", moderator.getEmail());
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedMessage, responseString);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_try_to_delete_a_moderator_not_found() throws Exception {
    // Arrange
    String email = "nonexistent@ucsb.edu";
    when(moderatorRepository.findById(eq(email))).thenReturn(Optional.empty());

    // Act
    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/moderators/delete").param("email", email).with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // Assert
    verify(moderatorRepository, times(1)).findById(email);
    verify(moderatorRepository, times(0)).delete(any());
    String expectedMessage = String.format("Moderator with email %s not found.", email);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedMessage, responseString);
  }
}
