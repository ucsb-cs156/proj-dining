package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.DiningCommonsService;

import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
import java.util.Optional;

@WebMvcTest(controllers = DiningCommonsController.class)
public class DiningCommonsControllerTests extends ControllerTestCase {

  @MockBean
  UserRepository userRepository;

  @MockBean
  MenuItemRepository menuItemRepository;

  @MockBean
  private DiningCommonsService diningCommonsService;


  @Test
  public void getAllCommons_userNotLoggedIn() throws Exception {

    // arrange


    String expectedJson = "{expectedResult}";

    when(diningCommonsService.getDiningCommonsJSON())
        .thenReturn(expectedJson);

    // act
    MvcResult response = mockMvc.perform(get("/api/diningcommons/all"))
        .andExpect(status().isOk()).andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void getMealsByDate() throws Exception
  {
    String expectedJson = "{expectedResult}";
    LocalDateTime dateTime = LocalDateTime.now();

    when(diningCommonsService.getMealsByDateJSON(dateTime, "DLG"))
        .thenReturn(expectedJson);

    MvcResult response = mockMvc.perform(get("/api/diningcommons/" + dateTime + "/DLG"))
        .andExpect(status().isOk()).andReturn();

    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  
  @Test
  public void getMenuItemsByMealDateTimeAndDiningCommonsCode() throws Exception {
    // Mocked expected JSON response
    String serviceResponseJson = "[{\"name\": \"Pizza\", \"station\": \"Main Line\"}]";
    LocalDateTime dateTime = LocalDateTime.now();

    // Mock service call
    when(diningCommonsService.getMenuItemsByMealAndDateJSON(dateTime, "DLG", "lunch"))
        .thenReturn(serviceResponseJson);

    // Mock repository behavior for existing records
    when(menuItemRepository.findFirstByDiningCommonsCodeAndMealAndNameAndStation("DLG", "lunch", "Pizza", "Main Line"))
        .thenReturn(Optional.empty());

    // Mock repository save
    MenuItem savedMenuItem = new MenuItem();
    savedMenuItem.setId(1L);
    savedMenuItem.setDiningCommonsCode("DLG");
    savedMenuItem.setMeal("lunch");
    savedMenuItem.setName("Pizza");
    savedMenuItem.setStation("Main Line");

    when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(invocation -> {
      MenuItem argument = invocation.getArgument(0);
      argument.setId(1L); // Simulate the database assigning an ID
      return argument;
    });


    // Expected response
    String expectedResponseJson = "[{\"id\":1,\"menuItem\":{\"id\":1,\"diningCommonsCode\":\"DLG\",\"meal\":\"lunch\",\"name\":\"Pizza\",\"station\":\"Main Line\"}}]";

    // Perform the GET request
    MvcResult response = mockMvc.perform(get("/api/diningcommons/" + dateTime + "/DLG/lunch")
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn();

    // Validate response
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedResponseJson, responseString);
  }
}
