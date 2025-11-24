package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.Moderator;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = ModeratorsController.class)
@Import(TestConfig.class)
public class ModeratorsControllerTests extends ControllerTestCase {

  @MockBean ModeratorRepository moderatorRepository;

  @Test
  public void logged_out_users_cannot_get_all_moderators() throws Exception {
    mockMvc.perform(get("/api/admin/moderators/get")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_get_all_moderators() throws Exception {
    mockMvc.perform(get("/api/admin/moderators/get")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admin_users_can_get_all_moderators() throws Exception {
    // arrange
    Moderator moderator1 = Moderator.builder().email("moderator1@ucsb.edu").build();
    Moderator moderator2 = Moderator.builder().email("moderator2@ucsb.edu").build();

    ArrayList<Moderator> expectedModerators = new ArrayList<>();
    expectedModerators.addAll(Arrays.asList(moderator1, moderator2));

    when(moderatorRepository.findAll()).thenReturn(expectedModerators);
    String expectedJson = mapper.writeValueAsString(expectedModerators);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/admin/moderators/get")).andExpect(status().isOk()).andReturn();

    // assert
    verify(moderatorRepository, times(1)).findAll();
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_post_moderators() throws Exception {
    mockMvc.perform(post("/api/admin/moderators/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post_moderators() throws Exception {
    mockMvc.perform(post("/api/admin/moderators/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void an_admin_user_can_post_a_new_moderator() throws Exception {
    // arrange
    Moderator moderator1 = Moderator.builder().email("moderator1@ucsb.edu").build();

    when(moderatorRepository.save(any(Moderator.class))).thenReturn(moderator1);

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/admin/moderators/post?email=Moderator1@UCSB.EDU").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(moderatorRepository, times(1)).save(moderator1);
    String expectedJson = mapper.writeValueAsString(moderator1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_delete_moderators() throws Exception {
    mockMvc.perform(delete("/api/admin/moderators/delete")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_delete_moderators() throws Exception {
    mockMvc.perform(delete("/api/admin/moderators/delete")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_delete_a_moderator() throws Exception {
    // arrange
    Moderator moderator1 = Moderator.builder().email("moderator1@ucsb.edu").build();
    when(moderatorRepository.findById("moderator1@ucsb.edu")).thenReturn(Optional.of(moderator1));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/moderators/delete?email=moderator1@ucsb.edu").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(moderatorRepository, times(1)).findById("moderator1@ucsb.edu");
    verify(moderatorRepository, times(1)).delete(moderator1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals("Moderator with email moderator1@ucsb.edu deleted.", responseString);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_tries_to_delete_non_existent_moderator_and_gets_right_error_message()
      throws Exception {
    // arrange
    when(moderatorRepository.findById("nonexistent@ucsb.edu")).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/moderators/delete?email=nonexistent@ucsb.edu").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(moderatorRepository, times(1)).findById("nonexistent@ucsb.edu");
    String responseString = response.getResponse().getContentAsString();
    assertEquals("Moderator with email nonexistent@ucsb.edu not found.", responseString);
  }
}
