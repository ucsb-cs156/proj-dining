package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.config.SecurityConfig;
import edu.ucsb.cs156.dining.entities.DiningMenuAPI;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.DiningMenuAPIService;
import edu.ucsb.cs156.dining.testconfig.TestConfig;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(value = DiningMenuAPIController.class)
@Import(SecurityConfig.class)
@AutoConfigureDataJpa
public class DiningMenuAPIControllerTests extends ControllerTestCase {

  @MockBean UserRepository userRepository;

  @Autowired private MockMvc mockMvc;

  @MockBean private DiningMenuAPIService diningMenuAPIService;

  @Autowired private ObjectMapper objectMapper;

  @Test
  public void test_getDays() throws Exception {

    DiningMenuAPI Today =
        objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_1_JSON, DiningMenuAPI.class);

    List<DiningMenuAPI> expectedResult = new ArrayList<DiningMenuAPI>();
    expectedResult.add(Today);

    String url = "/api/dining/getDays";

    when(diningMenuAPIService.getDays()).thenReturn(expectedResult);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();

    assertEquals(
        expectedResult,
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<DiningMenuAPI>>() {}));

    verify(diningMenuAPIService, times(1)).getDays();
  }

  @Test
  public void test_getCommons() throws Exception {

    OffsetDateTime testDateTime = OffsetDateTime.of(2024, 11, 19, 12, 0, 0, 0, ZoneOffset.of("-08:00"));
    DiningMenuAPI Tomorrow =
        objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_2_JSON, DiningMenuAPI.class);

    List<DiningMenuAPI> expectedResult = new ArrayList<DiningMenuAPI>();
    expectedResult.add(Tomorrow);

    String url = "/api/dining/getCommons?dateTime=" + testDateTime.toString();

    when(diningMenuAPIService.getCommons(testDateTime)).thenReturn(expectedResult);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();

    assertEquals(
        expectedResult,
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<DiningMenuAPI>>() {}));

    verify(diningMenuAPIService, times(1)).getCommons(testDateTime);
  }

  @Test
  public void test_getMeals() throws Exception {

    OffsetDateTime testDateTime = OffsetDateTime.of(2024, 11, 20, 12, 0, 0, 0, ZoneOffset.of("-08:00"));
    String testCommonsCode = "portola";
    DiningMenuAPI Wednesday =
        objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_3_JSON, DiningMenuAPI.class);

    List<DiningMenuAPI> expectedResult = new ArrayList<DiningMenuAPI>();
    expectedResult.add(Wednesday);

   // String formattedDateTime = testDateTime.toLocalDateTime().toString();
    String url = "/api/dining/getMeals?dateTime=" + testDateTime + "&diningCommonsCode=" + testCommonsCode;

    when(diningMenuAPIService.getMeals(testDateTime, testCommonsCode)).thenReturn(expectedResult);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();

    assertEquals(
        expectedResult,
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<DiningMenuAPI>>() {}));

    verify(diningMenuAPIService, times(1)).getMeals(testDateTime, testCommonsCode);
  }

  @Test
  @WithMockUser(roles = {"ADMIN"})
  public void test_loadDays() throws Exception {

    DiningMenuAPI Today =
        objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_1_JSON, DiningMenuAPI.class);

    List<DiningMenuAPI> expectedResult = new ArrayList<DiningMenuAPI>();
    expectedResult.add(Today);

    String url = "/api/dining/loadDays";

    when(diningMenuAPIService.loadAllDays()).thenReturn(expectedResult);

    MvcResult response =
        mockMvc
            .perform(post(url).contentType("application/json").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    assertEquals(
        expectedResult,
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<DiningMenuAPI>>() {}));

    verify(diningMenuAPIService, times(1)).loadAllDays();
  }
}