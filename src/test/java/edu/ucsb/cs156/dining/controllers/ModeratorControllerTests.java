package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.Moderator;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
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

  // Authorization tests for post

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/admin/moderators/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/admin/moderators/post")).andExpect(status().is(403));
  }

  // Authorization tests for get all

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc.perform(get("/api/admin/moderators/all")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_cannot_get_all() throws Exception {
    mockMvc.perform(get("/api/admin/moderators/all")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admin_can_get_all() throws Exception {
    mockMvc.perform(get("/api/admin/moderators/all")).andExpect(status().is(200));
  }

  // Authorization tests for delete

  @Test
  public void logged_out_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/admin/moderators/delete?email=someone@gmail.com"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/admin/moderators/delete?email=someone@gmail.com"))
        .andExpect(status().is(403));
  }

  // Functionality tests

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void an_admin_user_can_post_a_new_moderator() throws Exception {
    Moderator moderator = Moderator.builder().email("newmod@ucsb.edu").build();
    when(moderatorRepository.save(eq(moderator))).thenReturn(moderator);

    MvcResult response =
        mockMvc
            .perform(post("/api/admin/moderators/post?email=newmod@ucsb.edu").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(moderatorRepository, times(1)).save(moderator);
    String expectedJson = mapper.writeValueAsString(moderator);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void an_admin_user_cannot_post_a_duplicate_moderator() throws Exception {
    Moderator moderator = Moderator.builder().email("newmod@ucsb.edu").build();
    when(moderatorRepository.findByEmail("newmod@ucsb.edu")).thenReturn(Optional.of(moderator));

    MvcResult response =
        mockMvc
            .perform(post("/api/admin/moderators/post?email=newmod@ucsb.edu").with(csrf()))
            .andExpect(status().isBadRequest())
            .andReturn();

    verify(moderatorRepository, times(0)).save(any());
    Map<String, Object> json = responseToJson(response);
    assertEquals("newmod@ucsb.edu is already a moderator", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admin_can_get_all_moderators() throws Exception {
    Moderator moderator1 = Moderator.builder().email("mod1@ucsb.edu").build();
    Moderator moderator2 = Moderator.builder().email("mod2@ucsb.edu").build();

    ArrayList<Moderator> expectedModerators =
        new ArrayList<>(Arrays.asList(moderator1, moderator2));

    when(moderatorRepository.findAll()).thenReturn(expectedModerators);

    MvcResult response =
        mockMvc.perform(get("/api/admin/moderators/all")).andExpect(status().isOk()).andReturn();

    verify(moderatorRepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedModerators);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_delete_a_moderator() throws Exception {
    Moderator moderator = Moderator.builder().email("someone@gmail.com").build();
    when(moderatorRepository.findAllByEmail("someone@gmail.com")).thenReturn(List.of(moderator));

    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/moderators/delete?email=someone@gmail.com").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(moderatorRepository, times(1)).findAllByEmail("someone@gmail.com");
    verify(moderatorRepository, times(1)).deleteByEmail("someone@gmail.com");
    Map<String, Object> json = responseToJson(response);
    assertEquals("Moderator with id someone@gmail.com deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_tries_to_delete_non_existant_moderator_and_gets_right_error_message()
      throws Exception {
    when(moderatorRepository.findAllByEmail("nobody@gmail.com")).thenReturn(List.of());

    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/moderators/delete?email=nobody@gmail.com").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(moderatorRepository, times(1)).findAllByEmail("nobody@gmail.com");
    Map<String, Object> json = responseToJson(response);
    assertEquals("Moderator with id nobody@gmail.com not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_delete_duplicate_moderator_emails() throws Exception {
    Moderator moderator1 = Moderator.builder().email("testmod@ucsb.edu").build();
    Moderator moderator2 = Moderator.builder().email("testmod@ucsb.edu").build();

    when(moderatorRepository.findAllByEmail("testmod@ucsb.edu"))
        .thenReturn(List.of(moderator1, moderator2));

    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/moderators/delete?email=testmod@ucsb.edu").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(moderatorRepository, times(1)).findAllByEmail("testmod@ucsb.edu");
    verify(moderatorRepository, times(1)).deleteByEmail("testmod@ucsb.edu");
    Map<String, Object> json = responseToJson(response);
    assertEquals("Moderator with id testmod@ucsb.edu deleted", json.get("message"));
  }
}
