// package edu.ucsb.cs156.dining.controllers;

// import edu.ucsb.cs156.dining.ControllerTestCase;
// import edu.ucsb.cs156.dining.models.CurrentUser;
// import edu.ucsb.cs156.dining.repositories.UserRepository;
// import edu.ucsb.cs156.dining.entities.User;
// import edu.ucsb.cs156.dining.testconfig.TestConfig;

// import org.junit.jupiter.api.Test;
// import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// import org.springframework.boot.test.mock.mockito.MockBean;
// import org.springframework.context.annotation.Import;
// import org.springframework.security.test.context.support.WithMockUser;
// import org.springframework.test.web.servlet.MvcResult;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
// import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
// import static org.mockito.Mockito.times;
// import static org.mockito.ArgumentMatchers.eq;
// import static org.junit.jupiter.api.Assertions.assertEquals;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.mockito.Mockito.verify;
// import static org.mockito.Mockito.when;

// @WebMvcTest(controllers = UserInfoController.class)
// @Import(TestConfig.class)
// public class UserInfoControllerTests extends ControllerTestCase {

//     @MockBean
//     UserRepository userRepository;

//     @Test
//     public void currentUser__logged_out() throws Exception {
//         mockMvc.perform(get("/api/currentUser"))
//             .andExpect(status().is(403));
//     }

//     @WithMockUser(roles = { "USER" })
//     @Test
//     public void currentUser__logged_in() throws Exception {
//         // arrange
//         CurrentUser currentUser = currentUserService.getCurrentUser();
//         String expectedJson = mapper.writeValueAsString(currentUser);

//         // act
//         MvcResult response = mockMvc.perform(get("/api/currentUser"))
//             .andExpect(status().isOk())
//             .andReturn();

//         // assert
//         String responseString = response.getResponse().getContentAsString();
//         assertEquals(expectedJson, responseString);
//     }

//     @WithMockUser(roles = { "ADMIN", "USER" })
//     @Test
//     public void a_user_can_post_a_new_currentUser() throws Exception {
//         // arrange
//         User currentUser1 = User.builder()
//             .id(1L)  // Set a realistic user ID
//             .email("user@example.org")
//             .googleSub("fake_user")
//             .pictureUrl("https://example.org/user.jpg")
//             .fullName("Fake user")
//             .givenName("Fake")
//             .familyName("user")
//             .emailVerified(true)
//             .locale("")
//             .hostedDomain("example.org")
//             .admin(false)
//             .alias("Chipotle")  // Alias we're updating
//             .moderation(false)
//             .build();

//         // Mock the userRepository to return the same user object when saved
//         when(userRepository.save(eq(currentUser1))).thenReturn(currentUser1);

//         // act
//         MvcResult response = mockMvc.perform(
//             post("/api/currentUser/updateAlias?alias=Chipotle")  // Corrected URL path
//             .with(csrf()))
//             .andExpect(status().isOk())
//             .andReturn();

//         // assert
//         verify(userRepository, times(1)).save(currentUser1);
//         String expectedJson = mapper.writeValueAsString(currentUser1);
//         String responseString = response.getResponse().getContentAsString();
//         assertEquals(expectedJson, responseString);
//     }
// }




package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UserInfoController.class)
@Import(TestConfig.class)
public class UserInfoControllerTests extends ControllerTestCase {

  @MockBean
  UserRepository userRepository;

  @Test
  public void currentUser__logged_out() throws Exception {
    mockMvc.perform(get("/api/currentUser"))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = { "USER" })
  @Test
  public void currentUser__logged_in() throws Exception {

    // arrange

    CurrentUser currentUser = currentUserService.getCurrentUser();
    String expectedJson = mapper.writeValueAsString(currentUser);

    // act

    MvcResult response = mockMvc.perform(get("/api/currentUser"))
        .andExpect(status().isOk()).andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
}