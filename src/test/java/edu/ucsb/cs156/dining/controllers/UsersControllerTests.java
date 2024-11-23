package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import edu.ucsb.cs156.dining.models.CurrentUser;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.Arrays;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.mockito.ArgumentMatchers.eq;


import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.util.Map;


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

  @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void a_user_can_post_a_new_alias() throws Exception {
        // arrange
        User currentUser1 = User.builder()
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
            .admin(false)
            .alias("Chipotle") 
            .moderator(null)
            .build();
        
  
        when(userRepository.save(eq(currentUser1))).thenReturn(currentUser1);

        // act
        MvcResult response = mockMvc.perform(
            post("/api/currentUser/updateAlias?alias=Chipotle") 
                        .with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(userRepository, times(1)).save(currentUser1);
        String expectedJson = mapper.writeValueAsString(currentUser1);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }



    @Test
    @WithMockUser(roles = { "ADMIN" }) 
    public void admin_can_edit_moderation_value() throws Exception {
        //arrange 
        User userOrig = User.builder()
            .id(7L)
            .email("user@example.org")
            .moderator(false) 
            .build();


        User userEdited = User.builder()
            .id(7L)
            .email("user@example.org")
            .moderator(true) 
            .build();

        String requestBody = mapper.writeValueAsString(userEdited);
        when(userRepository.findById(7L)).thenReturn(Optional.of(userOrig));

        // act
        MvcResult response = mockMvc.perform(
            put("/api/currentUser/updateAliasModeration")
                .param("id", String.valueOf(7l))
                .param("moderator", String.valueOf(true))
                .with(csrf()))
            .andExpect(status().isOk()).andReturn();
        
        // assert
        verify(userRepository, times(1)).findById(7L);
                verify(userRepository, times(1)).save(userEdited); 
                String responseString = response.getResponse().getContentAsString();
                assertEquals(requestBody, responseString);
    }

    @Test
    @WithMockUser(roles = { "USER" }) 
    public void regular_users_cannot_update_moderation_value() throws Exception {
        mockMvc.perform(post("/api/currentUser/updateAliasModeration"))
                                .andExpect(status().is(403)); 
    }

    @Test
    @WithMockUser(roles = { "ADMIN" })
    public void admin_cannot_update_nonexistent_id() throws Exception {
        // arrange
    
        User currentUser = User.builder()
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
                .admin(false)
                .alias("Chipotle") 
                .moderator(false)
                .build();
        String requestBody = mapper.writeValueAsString(currentUser);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
    
        // act
        MvcResult response = mockMvc.perform(
            put("/api/currentUser/updateAliasModeration")
                .param("id", String.valueOf(1L))
                .param("moderator", String.valueOf(false)) 
                .with(csrf()))  
            .andExpect(status().isNotFound()).andReturn();
    
        // assert
        verify(userRepository, times(1)).findById(1L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("User with id 1 not found", json.get("message"));
    }


}
