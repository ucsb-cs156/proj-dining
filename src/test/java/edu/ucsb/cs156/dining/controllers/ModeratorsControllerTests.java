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

@WebMvcTest(controllers = ModeratorsController.class)
@Import(TestConfig.class)
public class ModeratorsControllerTests extends ControllerTestCase {

  @MockitoBean ModeratorRepository moderatorRepository;

  @MockitoBean UserRepository userRepository;

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/admin/moderators/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/admin/moderators/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admins_can_post() throws Exception {

    Moderator moderator = Moderator.builder().email("mod@ucsb.edu").build();
    when(moderatorRepository.save(eq(moderator))).thenReturn(moderator);

    MvcResult response =
        mockMvc
            .perform(post("/api/admin/moderators/post?email=mod@ucsb.edu").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(moderatorRepository, times(1)).save(eq(moderator));
    String expectedJson = mapper.writeValueAsString(moderator);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_get() throws Exception {
    mockMvc.perform(get("/api/admin/moderators/get")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_cannot_get() throws Exception {
    mockMvc.perform(get("/api/admin/moderators/get")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admins_can_get() throws Exception {

    Moderator moderator = Moderator.builder().email("mod@ucsb.edu").build();
    ArrayList<Moderator> expectedModerators = new ArrayList<>();
    expectedModerators.addAll(Arrays.asList(moderator));

    when(moderatorRepository.findAll()).thenReturn(expectedModerators);

    MvcResult response =
        mockMvc.perform(get("/api/admin/moderators/get")).andExpect(status().isOk()).andReturn();

    verify(moderatorRepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedModerators);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/admin/moderators/delete").param("email", "mod@ucsb.edu"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/admin/moderators/delete").param("email", "mod@ucsb.edu"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admins_can_delete_existing_moderator() throws Exception {

    String email = "mod@ucsb.edu";
    Moderator moderator = Moderator.builder().email(email).build();

    when(moderatorRepository.findById(eq(email))).thenReturn(Optional.of(moderator));

    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/moderators/delete").param("email", email).with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(moderatorRepository, times(1)).findById(email);
    verify(moderatorRepository, times(1)).delete(moderator);

    String expectedMessage =
        String.format("Moderator with email %s deleted.", moderator.getEmail());
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedMessage, responseString);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admins_get_not_found_when_deleting_nonexistent_moderator()
      throws Exception {

    String email = "nonexistent@ucsb.edu";
    when(moderatorRepository.findById(eq(email))).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/moderators/delete").param("email", email).with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(moderatorRepository, times(1)).findById(email);
    verify(moderatorRepository, times(0)).delete(any());

    String expectedMessage = String.format("Moderator with email %s not found.", email);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedMessage, responseString);
  }
}
