// package edu.ucsb.cs156.dining.controllers;

// import edu.ucsb.cs156.dining.repositories.UserRepository;
// import edu.ucsb.cs156.dining.testconfig.TestConfig;
// import edu.ucsb.cs156.dining.ControllerTestCase;
// import edu.ucsb.cs156.dining.entities.CurrentUser;
// import edu.ucsb.cs156.dining.repositories.CurrentUserRepository;

// import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.Map;
// import org.junit.jupiter.api.Test;
// import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// import org.springframework.boot.test.mock.mockito.MockBean;
// import org.springframework.context.annotation.Import;
// import org.springframework.http.MediaType;
// import org.springframework.security.test.context.support.WithMockUser;
// import org.springframework.test.web.servlet.MvcResult;

// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
// import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

// import java.util.Optional;

// import static org.junit.jupiter.api.Assertions.assertEquals;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.eq;
// import static org.mockito.Mockito.times;
// import static org.mockito.Mockito.verify;
// import static org.mockito.Mockito.when;

// @WebMvcTest(controllers = CurrentUserController.class)
// @Import(TestConfig.class)
// public class CurrentUserControllerTests extends ControllerTestCase {

//         @MockBean
//         CurrentUserRepository currentUserRepository;

//         @MockBean
//         UserRepository userRepository;

//         // Authorization tests for /api/phones/post
//         // (Perhaps should also have these for put and delete)

//         @Test
//         public void logged_out_users_cannot_post() throws Exception {
//                 mockMvc.perform(post("/api/currentuser/updateAlias"))
//                                 .andExpect(status().is(403));
//         }

   

//         @WithMockUser(roles = { "ADMIN", "USER" })
//         @Test
//         public void a_user_can_post_a_new_currentUser() throws Exception {
//                 // arrange

//                 CurrentUser currentUser1 = CurrentUser.builder()
//                                 .alias("Chipotle")
//                                 .modValue(2)
//                                 .build();

//                 when(currentUserRepository.save(eq(currentUser1))).thenReturn(currentUser1);

//                 // act
//                 MvcResult response = mockMvc.perform(
//                                 post("/api/currentuser/updateAlias?alias=Chipotle&modValue=2")
//                                                 .with(csrf()))
//                                 .andExpect(status().isOk()).andReturn();

//                 // assert
//                 verify(currentUserRepository, times(1)).save(currentUser1);
//                 String expectedJson = mapper.writeValueAsString(currentUser1);
//                 String responseString = response.getResponse().getContentAsString();
//                 assertEquals(expectedJson, responseString);
//         }


//         @WithMockUser(roles = { "ADMIN", "USER" })
//         @Test
//         public void admin_can_edit_an_existing_aliasModValue() throws Exception {
//                 // arrange

//                 CurrentUser currentUserOrig = CurrentUser.builder().id(67L)
//                                 .alias("Chipotle")
//                                 .modValue(3)
//                                 .build();

//                 CurrentUser currentUserEdited = CurrentUser.builder().id(67L)
//                                 .alias("Chipotle")
//                                 .modValue(4)
//                                 .build();

//                 String requestBody = mapper.writeValueAsString(currentUserEdited);

//                 when(currentUserRepository.findById(eq("Chipotle"))).thenReturn(Optional.of(currentUserOrig));

//                 // act
//                 MvcResult response = mockMvc.perform(
//                                 put("/api/currentuser/updateModValue?alias=Chipotle")
//                                                 .contentType(MediaType.APPLICATION_JSON)
//                                                 .characterEncoding("utf-8")
//                                                 .content(requestBody)
//                                                 .with(csrf()))
//                                 .andExpect(status().isOk()).andReturn();

//                 // assert
//                 verify(currentUserRepository, times(1)).findById("Chipotle");
//                 verify(currentUserRepository, times(1)).save(currentUserEdited); // should be saved with correct user
//                 String responseString = response.getResponse().getContentAsString();
//                 assertEquals(requestBody, responseString);
//         }

//         @WithMockUser(roles = { "ADMIN" })
//         @Test
//         public void admin_cannot_edit_aliasModValue_that_does_not_exist() throws Exception {
//                 // arrange

//                 CurrentUser editedCurrentUser = CurrentUser.builder()
//                                 .alias("Chipotle")
//                                 .modValue(4)
//                                 .build();


//                 String requestBody = mapper.writeValueAsString(editedCurrentUser);

//                 when(currentUserRepository.findById(eq("Chipotle"))).thenReturn(Optional.empty());

//                 // act
//                 MvcResult response = mockMvc.perform(
//                                 put("/api/currentuser/updateModValue?alias=Chipotle")
//                                                 .contentType(MediaType.APPLICATION_JSON)
//                                                 .characterEncoding("utf-8")
//                                                 .content(requestBody)
//                                                 .with(csrf()))
//                                 .andExpect(status().isNotFound()).andReturn();

//                 // assert
//                 verify(currentUserRepository, times(1)).findById("Chipotle");
//                 Map<String, Object> json = responseToJson(response);
//                 assertEquals("CurrentUser with id Chipotle not found", json.get("message"));

//         }
// }
