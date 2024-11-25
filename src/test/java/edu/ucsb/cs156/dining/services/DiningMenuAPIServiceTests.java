package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.entities.DiningMenuAPI;
import edu.ucsb.cs156.dining.repositories.DiningMenuAPIRepository;
import edu.ucsb.cs156.dining.services.wiremock.WiremockService;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

@RestClientTest(DiningMenuAPIService.class)
@AutoConfigureDataJpa
@TestPropertySource(
    properties = {
      "app.startDate=2024-01-01T00:00-08:00",
      "app.endDate=2024-12-31T23:59:59-08:00",
    })
public class DiningMenuAPIServiceTests {

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  @Autowired private MockRestServiceServer mockRestServiceServer;

  @Mock private RestTemplate restTemplate;

  @MockBean private DiningMenuAPIRepository diningMenuAPIRepository;

  @MockBean WiremockService wiremockService;

  @Autowired private DiningMenuAPIService diningMenuAPIService;

  @Autowired private ObjectMapper objectMapper;

  @Test
  public void test_getStartDateTime() {
    assertEquals("2024-01-01T00:00-08:00", diningMenuAPIService.getStartDateTime().toString());
  }

  @Test
  public void test_getEndDateTime() {
    assertEquals("2024-12-31T23:59:59-08:00", diningMenuAPIService.getEndDateTime().toString());
  }

  @Test
  void testGetDays_withDataInRepository() throws Exception {
    DiningMenuAPI sampleDay =
        objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_1_JSON, DiningMenuAPI.class);

    List<DiningMenuAPI> expectedResult = new ArrayList<DiningMenuAPI>();
    expectedResult.add(sampleDay);

    when(diningMenuAPIRepository.findAll()).thenReturn(expectedResult);

    List<DiningMenuAPI> actualResult = diningMenuAPIService.getDays();
    verify(diningMenuAPIRepository, times(1)).findAll();

    assertEquals(expectedResult, actualResult);
  }

  @Test
  void testGetDays_whenRepositoryIsEmpty() throws Exception {
    // DiningMenuAPI DAY_1 =
    //     objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_1_JSON, DiningMenuAPI.class);
    DiningMenuAPI DAY_2 =
        objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_2_JSON, DiningMenuAPI.class);
    // DiningMenuAPI DAY_3 =
    //     objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_3_JSON, DiningMenuAPI.class);

    List<DiningMenuAPI> emptyList = new ArrayList<DiningMenuAPI>();
    List<DiningMenuAPI> expectedResult = new ArrayList<DiningMenuAPI>();
    expectedResult.add(DAY_2);

    when(diningMenuAPIRepository.findAll()).thenReturn(emptyList);
    when(diningMenuAPIRepository.save(DAY_2)).thenReturn(DAY_2);

    List<DiningMenuAPI> expectedAPIResult = new ArrayList<DiningMenuAPI>();
    //expectedAPIResult.add(DAY_1); // expected to be ignored
    expectedAPIResult.add(DAY_2); // expected to be saved
    //expectedAPIResult.add(DAY_3); // expected to be saved

    String expectedURL = DiningMenuAPIService.GET_DAYS;

    String expectedJSON = objectMapper.writeValueAsString(expectedAPIResult);

    this.mockRestServiceServer
        .expect(requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-version", "1.0"))
        .andExpect(header("ucsb-api-key", apiKey))
        .andRespond(withSuccess(expectedJSON, MediaType.APPLICATION_JSON));

    List<DiningMenuAPI> actualResult = diningMenuAPIService.getDays();
    verify(diningMenuAPIRepository, times(1)).findAll();
    verify(diningMenuAPIRepository, times(1)).save(eq(DAY_2));

    assertEquals(expectedResult, actualResult);
  }

  @Test
  void testGetCommons() throws Exception {
    OffsetDateTime dateTime = OffsetDateTime.of(2024, 11, 18, 0, 0, 0, 0, ZoneOffset.of("-08:00"));
    DiningMenuAPI sampleCommons =
        objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_1_JSON, DiningMenuAPI.class);

    List<DiningMenuAPI> expectedResult = new ArrayList<DiningMenuAPI>();
    expectedResult.add(sampleCommons);

    DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    String formattedDateTime = dateTime.format(formatter);
    String expectedURL = DiningMenuAPIService.GET_COMMONS.replace("{date-time}", formattedDateTime);

    String expectedJSON = objectMapper.writeValueAsString(expectedResult);

    this.mockRestServiceServer
        .expect(requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-version", "1.0"))
        .andExpect(header("ucsb-api-key", apiKey))
        .andRespond(withSuccess(expectedJSON, MediaType.APPLICATION_JSON));

    List<DiningMenuAPI> actualResult = diningMenuAPIService.getCommons(dateTime);
    
    assertEquals(expectedResult, actualResult);
    this.mockRestServiceServer.verify();
  }

  @Test
  void testGetMeals() throws Exception {
    OffsetDateTime dateTime = OffsetDateTime.of(2024, 11, 20, 0, 0, 0, 0, ZoneOffset.of("-08:00"));
    String commons = "portola";
    DiningMenuAPI sampleMeal =
        objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_3_JSON, DiningMenuAPI.class);

    List<DiningMenuAPI> expectedResult = new ArrayList<DiningMenuAPI>();
    expectedResult.add(sampleMeal);

    DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    String formattedDateTime = dateTime.format(formatter);
    String expectedURL = DiningMenuAPIService.GET_MEALS
          .replace("{date-time}", formattedDateTime)
          .replace("{dining-common-code}", commons);

    String expectedJSON = objectMapper.writeValueAsString(expectedResult);

    this.mockRestServiceServer
        .expect(requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-version", "1.0"))
        .andExpect(header("ucsb-api-key", apiKey))
        .andRespond(withSuccess(expectedJSON, MediaType.APPLICATION_JSON));

    List<DiningMenuAPI> actualResult = diningMenuAPIService.getMeals(dateTime, commons);
    
    assertEquals(expectedResult, actualResult);
    this.mockRestServiceServer.verify();

    // when(diningMenuAPIRepository.findAll()).thenReturn(expectedResult);

    // List<DiningMenuAPI> actualResult = diningMenuAPIService.getMeals(dateTime, commons);
    // verify(diningMenuAPIRepository, times(1)).findAll();

    // assertEquals(expectedResult, actualResult);
  }

  @Test
  void testGetAllDaysFromAPI() throws Exception {
    DiningMenuAPI sampleDay =
        objectMapper.readValue(DiningMenuAPI.SAMPLE_MENU_ITEM_1_JSON, DiningMenuAPI.class);

    List<DiningMenuAPI> expectedResult = new ArrayList<DiningMenuAPI>();
    expectedResult.add(sampleDay);
    String expectedJSON = objectMapper.writeValueAsString(expectedResult);

    String expectedURL = DiningMenuAPIService.GET_DAYS;

    this.mockRestServiceServer
        .expect(requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-version", "1.0"))
        .andExpect(header("ucsb-api-key", apiKey))
        .andRespond(withSuccess(expectedJSON, MediaType.APPLICATION_JSON));

    List<DiningMenuAPI> actualResult = diningMenuAPIService.getAllDaysFromAPI();

    assertEquals(expectedResult, actualResult);
  }

  @Test
  void testDateInRange() {
    OffsetDateTime startDate = OffsetDateTime.of(2024, 11, 15, 0, 0, 0, 0, ZoneOffset.of("-08:00"));
    OffsetDateTime endDate = OffsetDateTime.of(2024, 11, 20, 23, 59, 59, 0, ZoneOffset.of("-08:00"));

    // diningMenuAPIService.setStartDateTime(startDate);
    // diningMenuAPIService.setEndDateTime(endDate);

    // Date in range
    assertTrue(diningMenuAPIService.dateInRange(OffsetDateTime.of(2024, 11, 16, 0, 0, 0, 0, ZoneOffset.of("-08:00")), startDate, endDate));

    // Date out of range
    assertFalse(diningMenuAPIService.dateInRange(OffsetDateTime.of(2024, 11, 21, 0, 0, 0, 0, ZoneOffset.of("-08:00")), startDate, endDate));
  }
}