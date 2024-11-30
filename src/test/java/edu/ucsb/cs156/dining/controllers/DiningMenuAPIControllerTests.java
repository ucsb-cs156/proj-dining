package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.config.SecurityConfig;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.DiningMenuAPIService;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(value = DiningMenuAPIController.class)
@Import(SecurityConfig.class)
@AutoConfigureDataJpa
public class DiningMenuAPIControllerTests extends ControllerTestCase {

  @MockBean UserRepository userRepository;

  @Autowired private MockMvc mockMvc;

  @MockBean private DiningMenuAPIService diningMenuAPIService;

  @Test
  public void test_getDays() throws Exception {

    String expectedResult = "{expectedJSONResult}";
    String url = "/api/dining/getDays";

    when(diningMenuAPIService.getDays()).thenReturn(expectedResult);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();
    String responseString = response.getResponse().getContentAsString();

    assertEquals(expectedResult, responseString);
  }

  @Test
  public void test_getCommons() throws Exception {
    OffsetDateTime testDateTime = OffsetDateTime.of(2024, 11, 19, 12, 0, 0, 0, ZoneOffset.of("-08:00"));

    String expectedResult = "{expectedJSONResult}";
    String url = "/api/dining/getCommons?dateTime=" + testDateTime.toString();

    when(diningMenuAPIService.getCommons(testDateTime)).thenReturn(expectedResult);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();
    String responseString = response.getResponse().getContentAsString();

    assertEquals(expectedResult, responseString);
  }

  @Test
  public void test_getMeals() throws Exception {
    OffsetDateTime testDateTime = OffsetDateTime.of(2024, 11, 20, 12, 0, 0, 0, ZoneOffset.of("-08:00"));
    String testCommonsCode = "portola";
    
    String expectedResult = "{expectedJSONResult}";
    String url = "/api/dining/getMeals?dateTime=" + testDateTime + "&diningCommonsCode=" + testCommonsCode;

    when(diningMenuAPIService.getMeals(testDateTime, testCommonsCode)).thenReturn(expectedResult);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();
    String responseString = response.getResponse().getContentAsString();

    assertEquals(expectedResult, responseString);
  }
}