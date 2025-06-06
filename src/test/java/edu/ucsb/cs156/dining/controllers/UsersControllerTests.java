package edu.ucsb.cs156.dining.controllers;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import java.util.Optional;
import java.util.Map;

import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;

@WebMvcTest(controllers = UsersController.class)
@Import(TestConfig.class)
public class UsersControllerTests extends ControllerTestCase {

  @MockBean
  UserRepository userRepository;

  @Test
  public void users__logged_out() throws Exception {
    mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = { "USER" })
  @Test
  public void users__user_logged_in() throws Exception {
    mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = { "ADMIN", "USER" })
  @Test
  public void users__admin_logged_in() throws Exception {
    // arrange
    User u1 = User.builder().id(1L).build();
    User u2 = User.builder().id(2L).build();
    User u = currentUserService.getCurrentUser().getUser();

    ArrayList<User> expectedUsers = new ArrayList<>();
    expectedUsers.addAll(Arrays.asList(u1, u2, u));

    when(userRepository.findAll()).thenReturn(expectedUsers);
    String expectedJson = mapper.writeValueAsString(expectedUsers);

    // act
    MvcResult response = mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().isOk()).andReturn();

    // assert
    verify(userRepository, times(1)).findAll();
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = { "MODERATOR", "USER" })
  @Test
  public void users__moderator_logged_in() throws Exception {
    // arrange
    User u1 = User.builder().id(1L).build();
    User u2 = User.builder().id(2L).build();
    User u = currentUserService.getCurrentUser().getUser();

    ArrayList<User> expectedUsers = new ArrayList<>();
    expectedUsers.addAll(Arrays.asList(u1, u2, u));

    when(userRepository.findAll()).thenReturn(expectedUsers);
    String expectedJson = mapper.writeValueAsString(expectedUsers);

    // act
    MvcResult response = mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().isOk()).andReturn();

    // assert
    verify(userRepository, times(1)).findAll();
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = { "ADMIN", "MODERATOR", "USER" })
  @Test
  public void a_user_can_post_a_new_alias() throws Exception {
    // arrange
    // Stub findByAlias(...) → empty
    when(userRepository.findByAlias("Chipotle")).thenReturn(Optional.empty());
    // Stub save(...) → echo back whatever User instance is passed in
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // act
    MvcResult response = mockMvc.perform(
        post("/api/currentUser/updateAlias?proposedAlias=Chipotle")
            .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();

    // assert: repository interactions
    verify(userRepository, times(1)).findByAlias("Chipotle");
    verify(userRepository, times(1)).save(any(User.class));

    // Check response JSON contains the new proposedAlias and status
    String json = response.getResponse().getContentAsString();
    assertTrue(json.contains("\"proposedAlias\":\"Chipotle\""));
    assertTrue(json.contains("\"status\":\"AWAITING_REVIEW\""));
  }


  @Test
  @WithMockUser(roles = { "ADMIN" })
  public void admin_can_approve_proposed_alias() throws Exception {
    // arrange
    User userOrig = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Anonymous User")
        .proposedAlias("Chipotle")
        .status(ModerationStatus.AWAITING_REVIEW)
        .build();

    User userEdited = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Chipotle")
        .proposedAlias(null)
        .status(ModerationStatus.APPROVED)
        .dateApproved(LocalDate.now())
        .build();

    String requestBody = mapper.writeValueAsString(userEdited);
    when(userRepository.findById(7L)).thenReturn(Optional.of(userOrig));
    when(userRepository.save(any(User.class))).thenReturn(userEdited);

    // act
    MvcResult response = mockMvc.perform(
        put("/api/currentUser/updateAliasModeration")
            .param("id", "7")
            .param("approved", "true")
            .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();

    // assert
    verify(userRepository, times(1)).findById(7L);
    verify(userRepository, times(1)).save(any(User.class));
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @Test
  @WithMockUser(roles = { "MODERATOR" })
  public void moderator_can_approve_proposed_alias() throws Exception {
    // arrange
    User userOrig = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Anonymous User")
        .proposedAlias("Chipotle")
        .status(ModerationStatus.AWAITING_REVIEW)
        .build();

    User userEdited = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Chipotle")
        .proposedAlias(null)
        .status(ModerationStatus.APPROVED)
        .dateApproved(LocalDate.now())
        .build();

    String requestBody = mapper.writeValueAsString(userEdited);
    when(userRepository.findById(7L)).thenReturn(Optional.of(userOrig));
    when(userRepository.save(any(User.class))).thenReturn(userEdited);

    // act
    MvcResult response = mockMvc.perform(
        put("/api/currentUser/updateAliasModeration")
            .param("id", "7")
            .param("approved", "true")
            .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();

    // assert
    verify(userRepository, times(1)).findById(7L);
    verify(userRepository, times(1)).save(any(User.class));
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @Test
  @WithMockUser(roles = { "ADMIN" })
  public void admin_cannot_approve_nonexistent_user() throws Exception {
    // arrange
    when(userRepository.findById(1L)).thenReturn(Optional.empty());

    // act
    MvcResult response = mockMvc.perform(
        put("/api/currentUser/updateAliasModeration")
            .param("id", "1")
            .param("approved", "true")
            .with(csrf()))
        .andExpect(status().isNotFound())
        .andReturn();

    // assert
    verify(userRepository, times(1)).findById(1L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 1 not found", json.get("message"));
  }

  @Test
  @WithMockUser(roles = { "MODERATOR" })
  public void moderator_cannot_approve_nonexistent_user() throws Exception {
    // arrange
    when(userRepository.findById(1L)).thenReturn(Optional.empty());

    // act
    MvcResult response = mockMvc.perform(
        put("/api/currentUser/updateAliasModeration")
            .param("id", "1")
            .param("approved", "true")
            .with(csrf()))
        .andExpect(status().isNotFound())
        .andReturn();

    // assert
    verify(userRepository, times(1)).findById(1L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 1 not found", json.get("message"));
  }

  @Test
  @WithMockUser(roles = { "USER" })
  public void regular_users_cannot_update_alias_moderation() throws Exception {
    mockMvc.perform(post("/api/currentUser/updateAliasModeration"))
        .andExpect(status().is(403));
  }

  @Test
  @WithMockUser(roles = { "ADMIN" })
  public void user_cannot_post_existing_alias() throws Exception {
    User existing = User.builder().alias("Chipotle").build();
    when(userRepository.findByAlias("Chipotle")).thenReturn(Optional.of(existing));

    mockMvc.perform(post("/api/currentUser/updateAlias?proposedAlias=Chipotle")
        .with(csrf()))
        .andExpect(status().isBadRequest())
        .andExpect(result -> {
          assertTrue(result.getResolvedException() instanceof ResponseStatusException);
          ResponseStatusException exception =
            (ResponseStatusException) result.getResolvedException();
          assertEquals("Alias already in use.", exception.getReason());
        });

    verify(userRepository, times(1)).findByAlias("Chipotle");
  }

  @Test
  @WithMockUser(roles = { "ADMIN" })
  public void admin_approves_alias() throws Exception {
    // arrange
    User userOrig = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Chip")
        .proposedAlias("Chop")
        .status(ModerationStatus.AWAITING_REVIEW)
        .build();

    User userUpdated = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Chop")
        .proposedAlias(null)
        .status(ModerationStatus.APPROVED)
        .dateApproved(LocalDate.now())
        .build();

    when(userRepository.findById(7L)).thenReturn(Optional.of(userOrig));
    when(userRepository.save(any(User.class))).thenReturn(userUpdated);

    // act
    MvcResult response = mockMvc.perform(
        put("/api/currentUser/updateAliasModeration")
            .param("id", "7")
            .param("approved", "true")
            .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();

    // assert
    verify(userRepository, times(1)).findById(7L);
    verify(userRepository, times(1)).save(any(User.class));
    String responseString = response.getResponse().getContentAsString();
    String expectedJson = mapper.writeValueAsString(userUpdated);
    assertEquals(expectedJson, responseString);
  }

  @Test
  @WithMockUser(roles = { "MODERATOR" })
  public void moderator_approves_alias() throws Exception {
    // arrange
    User userOrig = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Chip")
        .proposedAlias("Chop")
        .status(ModerationStatus.AWAITING_REVIEW)
        .build();

    User userUpdated = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Chop")
        .proposedAlias(null)
        .status(ModerationStatus.APPROVED)
        .dateApproved(LocalDate.now())
        .build();

    when(userRepository.findById(7L)).thenReturn(Optional.of(userOrig));
    when(userRepository.save(any(User.class))).thenReturn(userUpdated);

    // act
    MvcResult response = mockMvc.perform(
        put("/api/currentUser/updateAliasModeration")
            .param("id", "7")
            .param("approved", "true")
            .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();

    // assert
    verify(userRepository, times(1)).findById(7L);
    verify(userRepository, times(1)).save(any(User.class));
    String responseString = response.getResponse().getContentAsString();
    String expectedJson = mapper.writeValueAsString(userUpdated);
    assertEquals(expectedJson, responseString);
  }

  @Test
  @WithMockUser(roles = { "ADMIN" })
  public void admin_does_not_approve_alias() throws Exception {
    // arrange
    User userOrig = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Chipotle")
        .proposedAlias("Taco Bell")
        .status(ModerationStatus.AWAITING_REVIEW)
        .build();

    User userUnchanged = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Chipotle")
        .proposedAlias(null)
        .status(ModerationStatus.REJECTED)
        .build();

    when(userRepository.findById(7L)).thenReturn(Optional.of(userOrig));
    when(userRepository.save(any(User.class))).thenReturn(userUnchanged);

    // act
    MvcResult response = mockMvc.perform(
        put("/api/currentUser/updateAliasModeration")
            .param("id", "7")
            .param("approved", "false")
            .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();

    // assert
    verify(userRepository, times(1)).findById(7L);
    verify(userRepository, times(1)).save(any(User.class));
    String responseString = response.getResponse().getContentAsString();
    String expectedJson = mapper.writeValueAsString(userUnchanged);
    assertEquals(expectedJson, responseString);
  }

  @Test
  @WithMockUser(roles = { "MODERATOR" })
  public void moderator_does_not_approve_alias() throws Exception {
    // arrange
    User userOrig = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Chipotle")
        .proposedAlias("Taco Bell")
        .status(ModerationStatus.AWAITING_REVIEW)
        .build();

    User userUnchanged = User.builder()
        .id(7L)
        .email("user@example.org")
        .alias("Chipotle")
        .proposedAlias(null)
        .status(ModerationStatus.REJECTED)
        .build();

    when(userRepository.findById(7L)).thenReturn(Optional.of(userOrig));
    when(userRepository.save(any(User.class))).thenReturn(userUnchanged);

    // act
    MvcResult response = mockMvc.perform(
        put("/api/currentUser/updateAliasModeration")
            .param("id", "7")
            .param("approved", "false")
            .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();

    // assert
    verify(userRepository, times(1)).findById(7L);
    verify(userRepository, times(1)).save(any(User.class));
    String responseString = response.getResponse().getContentAsString();
    String expectedJson = mapper.writeValueAsString(userUnchanged);
    assertEquals(expectedJson, responseString);
  }

  @Test
  @WithMockUser(roles = { "ADMIN" })
  public void admin_can_get_all_users_with_proposed_alias() throws Exception {
    // arrange
    User user1 = User.builder()
        .id(1L)
        .proposedAlias("Chipo")
        .build();
    User user2 = User.builder()
        .id(2L)
        .proposedAlias("Taco")
        .build();

    List<User> users = Arrays.asList(user1, user2);

    when(userRepository.findByProposedAliasNotNull()).thenReturn(users);
    String expectedJson = mapper.writeValueAsString(users);

    // act
    MvcResult response = mockMvc.perform(get("/api/admin/usersWithProposedAlias")
            .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
    verify(userRepository, times(1)).findByProposedAliasNotNull();
  }

  @Test
  @WithMockUser(roles = { "MODERATOR" })
  public void moderator_can_get_all_users_with_proposed_alias() throws Exception {
    // arrange
    User user1 = User.builder()
        .id(1L)
        .proposedAlias("Chipo")
        .build();
    User user2 = User.builder()
        .id(2L)
        .proposedAlias("Taco")
        .build();

    List<User> users = Arrays.asList(user1, user2);

    when(userRepository.findByProposedAliasNotNull()).thenReturn(users);
    String expectedJson = mapper.writeValueAsString(users);

    // act
    MvcResult response = mockMvc.perform(get("/api/admin/usersWithProposedAlias")
            .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
    verify(userRepository, times(1)).findByProposedAliasNotNull();
  }

  @Test
  @WithMockUser(roles = { "USER" })
  public void can_get_alias() throws Exception {
    // arrange
    User user = User.builder()
        .id(1L)
        .alias("Chipo")
        .build();

    // assert
    assertEquals("Chipo", user.getAlias());
  }
}
