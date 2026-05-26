package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.models.UserDataDTO;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.UserDataDTOService;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(controllers = UsersController.class)
@Import(TestConfig.class)
public class UsersControllerTests extends ControllerTestCase {

  @MockBean UserRepository userRepository;

  @MockBean UserDataDTOService userDataDTOService;

  @Test
  public void users__logged_out() throws Exception {
    mockMvc.perform(get("/api/admin/users")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void users__user_logged_in() throws Exception {
    mockMvc.perform(get("/api/admin/users")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void users__admin_logged_in() throws Exception {
    UserDataDTO u1 = UserDataDTO.builder().id(1L).email("user1@example.org").build();
    UserDataDTO u2 = UserDataDTO.builder().id(2L).email("user2@example.org").build();

    PageImpl<UserDataDTO> expectedPage = new PageImpl<>(Arrays.asList(u1, u2));

    when(userDataDTOService.getUserDataDTOs(any(Pageable.class))).thenReturn(expectedPage);

    MvcResult response =
        mockMvc.perform(get("/api/admin/users")).andExpect(status().isOk()).andReturn();

    verify(userDataDTOService, times(1)).getUserDataDTOs(any(Pageable.class));

    String expectedJson = mapper.writeValueAsString(expectedPage);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void a_user_can_post_a_new_alias() throws Exception {
    User currentUser1 =
        User.builder()
            .id(1L)
            .email("user@example.org")
            .googleSub("fake_user")
            .pictureUrl("https://example.org/user.jpg")
            .fullName("Fake user")
            .givenName("Fake")
            .familyName("user")
            .emailVerified(true)
            .locale("")
            .hostedDomain("example.org")
            .alias("Anonymous User")
            .proposedAlias("Chipotle")
            .status(ModerationStatus.AWAITING_REVIEW)
            .build();

    when(userRepository.save(eq(currentUser1))).thenReturn(currentUser1);

    MvcResult response =
        mockMvc
            .perform(post("/api/currentUser/updateAlias?proposedAlias=Chipotle").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(userRepository, times(1)).save(currentUser1);

    String expectedJson = mapper.writeValueAsString(currentUser1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  @WithMockUser(roles = {"ADMIN"})
  public void admin_can_approve_proposed_alias() throws Exception {
    User userOrig =
        User.builder()
            .id(7L)
            .email("user@example.org")
            .alias("Anonymous User")
            .proposedAlias("Chipotle")
            .status(ModerationStatus.AWAITING_REVIEW)
            .build();

    User userEdited =
        User.builder()
            .id(7L)
            .email("user@example.org")
            .alias("Chipotle")
            .proposedAlias(null)
            .status(ModerationStatus.APPROVED)
            .dateApproved(LocalDate.now())
            .build();

    String requestBody = mapper.writeValueAsString(userEdited);
    when(userRepository.findById(7L)).thenReturn(Optional.of(userOrig));

    MvcResult response =
        mockMvc
            .perform(
                put("/api/currentUser/updateAliasModeration")
                    .param("id", String.valueOf(7L))
                    .param("approved", String.valueOf(true))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(userRepository, times(1)).findById(7L);
    verify(userRepository, times(1)).save(userEdited);

    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @Test
  @WithMockUser(roles = {"ADMIN"})
  public void admin_cannot_approve_nonexistent_user() throws Exception {
    when(userRepository.findById(1L)).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(
                put("/api/currentUser/updateAliasModeration")
                    .param("id", String.valueOf(1L))
                    .param("approved", String.valueOf(true))
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(userRepository, times(1)).findById(1L);

    Map<String, Object> json = responseToJson(response);
    assertEquals("User with id 1 not found", json.get("message"));
  }

  @Test
  @WithMockUser(roles = {"USER"})
  public void regular_users_cannot_update_alias_moderation() throws Exception {
    mockMvc
        .perform(
            put("/api/currentUser/updateAliasModeration")
                .param("id", String.valueOf(1L))
                .param("approved", String.valueOf(true))
                .with(csrf()))
        .andExpect(status().is(403));
  }

  @Test
  @WithMockUser(roles = {"USER"})
  public void user_cannot_post_existing_alias() throws Exception {
    User user = User.builder().alias("Chipotle").build();
    when(userRepository.findByAlias("Chipotle")).thenReturn(Optional.of(user));

    mockMvc
        .perform(post("/api/currentUser/updateAlias?proposedAlias=Chipotle").with(csrf()))
        .andExpect(status().isBadRequest())
        .andExpect(
            result -> {
              assertTrue(result.getResolvedException() instanceof ResponseStatusException);

              ResponseStatusException exception =
                  (ResponseStatusException) result.getResolvedException();
              assertEquals("Alias already in use.", exception.getReason());
            });
  }

  @Test
  @WithMockUser(roles = {"ADMIN", "MODERATOR"})
  public void admin_approves_alias() throws Exception {
    User userOrig =
        User.builder()
            .id(7L)
            .email("user@example.org")
            .alias("Chip")
            .proposedAlias("Chop")
            .status(ModerationStatus.AWAITING_REVIEW)
            .build();

    User userUpdated =
        User.builder()
            .id(7L)
            .email("user@example.org")
            .alias("Chop")
            .proposedAlias(null)
            .status(ModerationStatus.APPROVED)
            .dateApproved(LocalDate.now())
            .build();

    when(userRepository.findById(7L)).thenReturn(Optional.of(userOrig));

    MvcResult response =
        mockMvc
            .perform(
                put("/api/currentUser/updateAliasModeration")
                    .param("id", String.valueOf(7L))
                    .param("approved", "true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(userRepository, times(1)).findById(7L);
    verify(userRepository, times(1)).save(userUpdated);

    String expectedJson = mapper.writeValueAsString(userUpdated);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  @WithMockUser(roles = {"ADMIN", "MODERATOR"})
  public void admin_does_not_approve_alias() throws Exception {
    User userOrig =
        User.builder()
            .id(7L)
            .email("user@example.org")
            .alias("Chipotle")
            .proposedAlias("Taco Bell")
            .status(ModerationStatus.AWAITING_REVIEW)
            .build();

    User userUnchanged =
        User.builder()
            .id(7L)
            .email("user@example.org")
            .alias("Chipotle")
            .proposedAlias("Taco Bell")
            .status(ModerationStatus.REJECTED)
            .build();

    when(userRepository.findById(7L)).thenReturn(Optional.of(userOrig));

    MvcResult response =
        mockMvc
            .perform(
                put("/api/currentUser/updateAliasModeration")
                    .param("id", String.valueOf(7L))
                    .param("approved", "false")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(userRepository, times(1)).findById(7L);
    verify(userRepository, times(1)).save(userUnchanged);

    String expectedJson = mapper.writeValueAsString(userUnchanged);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  @WithMockUser(roles = {"ADMIN"})
  public void admin_can_get_all_users_with_proposed_alias() throws Exception {
    User user1 = User.builder().id(1L).proposedAlias("Chipo").build();
    User user2 = User.builder().id(2L).proposedAlias("Taco").build();

    List<User> users = Arrays.asList(user1, user2);

    when(userRepository.findByProposedAliasNotNull()).thenReturn(users);
    String expectedJson = mapper.writeValueAsString(users);

    MvcResult response =
        mockMvc
            .perform(get("/api/admin/usersWithProposedAlias").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
    verify(userRepository, times(1)).findByProposedAliasNotNull();
  }

  @Test
  @WithMockUser(roles = {"USER"})
  public void can_get_alias() throws Exception {
    User user = User.builder().id(1L).alias("Chipo").build();

    assertEquals("Chipo", user.getAlias());
  }

  @Test
  @WithMockUser(roles = {"ADMIN", "MODERATOR"})
  public void admin_can_get_aliases_needing_moderation() throws Exception {
    User u1 =
        User.builder()
            .id(1L)
            .email("user1@example.org")
            .proposedAlias("NewAlias1")
            .status(ModerationStatus.AWAITING_REVIEW)
            .build();

    User u2 =
        User.builder()
            .id(2L)
            .email("user2@example.org")
            .proposedAlias("NewAlias2")
            .status(ModerationStatus.AWAITING_REVIEW)
            .build();

    List<User> expectedUsers = Arrays.asList(u1, u2);

    when(userRepository.findByStatusAndProposedAliasNotNull(ModerationStatus.AWAITING_REVIEW))
        .thenReturn(expectedUsers);

    String expectedJson = mapper.writeValueAsString(expectedUsers);

    MvcResult response =
        mockMvc
            .perform(get("/api/admin/users/needsmoderation"))
            .andExpect(status().isOk())
            .andReturn();

    verify(userRepository, times(1))
        .findByStatusAndProposedAliasNotNull(ModerationStatus.AWAITING_REVIEW);

    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  @WithMockUser(roles = {"USER"})
  public void non_admin_cannot_get_aliases_needing_moderation() throws Exception {
    mockMvc.perform(get("/api/admin/users/needsmoderation")).andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = {"ADMIN", "MODERATOR"})
  public void admin_gets_empty_list_if_no_aliases_need_moderation() throws Exception {
    when(userRepository.findByStatusAndProposedAliasNotNull(ModerationStatus.AWAITING_REVIEW))
        .thenReturn(List.of());

    String expectedJson = mapper.writeValueAsString(List.of());

    MvcResult response =
        mockMvc
            .perform(get("/api/admin/users/needsmoderation"))
            .andExpect(status().isOk())
            .andReturn();

    verify(userRepository, times(1))
        .findByStatusAndProposedAliasNotNull(ModerationStatus.AWAITING_REVIEW);

    assertEquals(expectedJson, response.getResponse().getContentAsString());
  }
}
