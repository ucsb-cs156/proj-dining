package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.DiningCommonsService;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = DiningCommonsController.class)
public class DiningCommonsControllerTests extends ControllerTestCase {

  @MockBean
  UserRepository userRepository;

  @MockBean
  private DiningCommonsService diningCommonsService;


  @Test
  public void getAllCommons_userNotLoggedIn() throws Exception {

    // arrange


    String expectedJson = "{expectedResult}";

    when(diningCommonsService.getJSON())
        .thenReturn(expectedJson);

    // act
    MvcResult response = mockMvc.perform(get("/api/diningcommons/all"))
        .andExpect(status().isOk()).andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
}
