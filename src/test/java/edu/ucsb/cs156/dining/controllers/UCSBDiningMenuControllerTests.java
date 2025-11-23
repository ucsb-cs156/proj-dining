package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.config.SecurityConfig;
import edu.ucsb.cs156.dining.services.UCSBDiningMenuService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.client.HttpClientErrorException;

@WebMvcTest(value = UCSBDiningMenuController.class)
@Import(SecurityConfig.class)
@AutoConfigureDataJpa
public class UCSBDiningMenuControllerTests extends ControllerTestCase {

  @Autowired private MockMvc mockMvc;

  @MockBean private UCSBDiningMenuService ucsbDiningMenuService;

  @Test
  public void users_can_see_meal_times() throws Exception {
    String expectedResult = "{expectedJSONResult}";
    String url = "/api/diningcommons/2023-10-10/ortega";

    when(ucsbDiningMenuService.getJSON(any(String.class), any(String.class)))
        .thenReturn(expectedResult);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();

    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedResult, responseString);
  }

  @Test
  public void returns_204_when_no_meals_offered() throws Exception {
    String url = "/api/diningcommons/2025-11-27/carrillo";

    // Throw the specific NotFound subclass
    when(ucsbDiningMenuService.getJSON(any(String.class), any(String.class)))
        .thenThrow(
            HttpClientErrorException.NotFound.create(
                HttpStatus.NOT_FOUND, "Not Found", null, null, null));

    mockMvc.perform(get(url).contentType("application/json")).andExpect(status().isNoContent());
  }
}
