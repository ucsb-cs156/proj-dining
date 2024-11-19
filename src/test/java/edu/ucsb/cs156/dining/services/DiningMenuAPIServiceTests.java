package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.entities.DiningMenuAPI;
import edu.ucsb.cs156.dining.repositories.DiningMenuAPIRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
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
      "app.startDate:2024-01-01T00:00:001",
      "app.endDate:2024-12-31T23:59:59",
      "app.ucsb.api.consumer_key=fakeApiKey"
    })
public class DiningMenuAPIServiceTests {

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  @Autowired private MockRestServiceServer mockRestServiceServer;

  @Mock private RestTemplate restTemplate;

  @MockBean private DiningMenuAPIRepository diningMenuAPIRepository;

  @Autowired private DiningMenuAPIService diningMenuAPIService;

  @Autowired private ObjectMapper objectMapper;

  @Test
  public void test_getStartDateTime() {
    assertEquals("2024-01-01T00:00:001", diningMenuAPIService.getStartDateTime());
  }

  @Test
  public void test_getEndDateTime() {
    assertEquals("2024-12-31T23:59:59", diningMenuAPIService.getEndDateTime());
  }

  @Test
  void testGetDays_withDataInRepository() throws Exception {
    // Mock repository data
    List<DiningMenuAPI> mockDays = List.of(
        DiningMenuAPI.builder().name("Cream of Wheat").date(LocalDateTime.of(2024, 11, 18, 0, 0)).build(),
        DiningMenuAPI.builder().name("Turkey Noodle Soup").date(LocalDateTime.of(2024, 11, 19, 0, 0)).build()
    );

    when(diningMenuAPIRepository.findAll()).thenReturn(mockDays);

    // Call the method
    List<DiningMenuAPI> result = diningMenuAPIService.getDays();

    // Assertions
    assertNotNull(result);
    assertEquals(2, result.size());
    verify(diningMenuAPIRepository, times(1)).findAll();
    verify(diningMenuAPIService, never()).loadAllDays();
  }

  @Test
  void testGetDays_whenRepositoryIsEmpty() throws Exception {
      // Mock empty repository
      when(diningMenuAPIRepository.findAll()).thenReturn(Collections.emptyList());

      // Mock `loadAllDays` behavior
      List<DiningMenuAPI> loadedDays = List.of(
          DiningMenuAPI.builder().name("Watermelon").date(LocalDateTime.of(2024, 11, 20, 0, 0)).build()
      );
      when(diningMenuAPIService.loadAllDays()).thenReturn(loadedDays);

      // Call the method
      List<DiningMenuAPI> result = diningMenuAPIService.getDays();

      // Assertions
      assertNotNull(result);
      assertEquals(1, result.size());
      verify(diningMenuAPIRepository, times(1)).findAll();
      verify(diningMenuAPIService, times(1)).loadAllDays();
  }

  @Test
  void testGetCommons() throws Exception {
    LocalDateTime dateTime = LocalDateTime.of(2024, 11, 18, 0, 0);
    String apiResponse = "[" + DiningMenuAPI.SAMPLE_MENU_ITEM_1_JSON + "]";

    // Mock RestTemplate response
    ResponseEntity<String> mockResponse = new ResponseEntity<>(apiResponse, HttpStatus.OK);
    when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(), eq(String.class)))
        .thenReturn(mockResponse);

    // Call the method
    List<DiningMenuAPI> result = diningMenuAPIService.getCommons(dateTime);

    // Assertions
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("Cream of Wheat (vgn)", result.get(0).getName());
  }

  @Test
  void testGetMeals() throws Exception {
    LocalDateTime dateTime = LocalDateTime.of(2024, 11, 18, 0, 0);
    String diningCommonCode = "carrillo";
    String apiResponse = "[" + DiningMenuAPI.SAMPLE_MENU_ITEM_1_JSON + "]";

    // Mock RestTemplate response
    ResponseEntity<String> mockResponse = new ResponseEntity<>(apiResponse, HttpStatus.OK);
    when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(), eq(String.class)))
        .thenReturn(mockResponse);

    // Call the method
    List<DiningMenuAPI> result = diningMenuAPIService.getMeals(dateTime, diningCommonCode);

    // Assertions
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("Cream of Wheat (vgn)", result.get(0).getName());
    assertEquals(diningCommonCode, result.get(0).getDiningCommonsCode());
  }

  @Test
  void testGetAllDaysFromAPI() throws Exception {
    String apiResponse = "[" + DiningMenuAPI.SAMPLE_MENU_ITEM_1_JSON + "]";

    // Mock RestTemplate response
    ResponseEntity<String> mockResponse = new ResponseEntity<>(apiResponse, HttpStatus.OK);
    when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(), eq(String.class)))
        .thenReturn(mockResponse);

    // Call the method
    List<DiningMenuAPI> result = diningMenuAPIService.getAllDaysFromAPI();

    // Assertions
    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("Cream of Wheat (vgn)", result.get(0).getName());
  }


  @Test
  void testLoadAllDays() throws Exception {
    List<DiningMenuAPI> mockDays = List.of(
        DiningMenuAPI.builder().date(LocalDateTime.of(2024, 11, 18, 0, 0)).build(),
        DiningMenuAPI.builder().date(LocalDateTime.of(2024, 11, 21, 0, 0)).build()
    );

    // Mock `getAllDaysFromAPI` and `dateInRange`
    when(diningMenuAPIService.getAllDaysFromAPI()).thenReturn(mockDays);
    when(diningMenuAPIService.dateInRange(any())).thenAnswer(
        invocation -> {
            LocalDateTime date = invocation.getArgument(0);
            return !date.isAfter(LocalDateTime.of(2024, 11, 20, 0, 0));
        }
    );

    // Call the method
    List<DiningMenuAPI> result = diningMenuAPIService.loadAllDays();

    // Assertions
    assertNotNull(result);
    assertEquals(1, result.size());
    verify(diningMenuAPIRepository, times(1)).save(any());
  }

  @Test
  void testDateInRange() {
    LocalDateTime startDate = LocalDateTime.of(2024, 11, 15, 0, 0);
    LocalDateTime endDate = LocalDateTime.of(2024, 11, 20, 0, 0);

    diningMenuAPIService.setStartDateTime(startDate);
    diningMenuAPIService.setEndDateTime(endDate);

    // Date in range
    assertTrue(diningMenuAPIService.dateInRange(LocalDateTime.of(2024, 11, 18, 0, 0)));

    // Date out of range
    assertFalse(diningMenuAPIService.dateInRange(LocalDateTime.of(2024, 11, 21, 0, 0)));
  }
}