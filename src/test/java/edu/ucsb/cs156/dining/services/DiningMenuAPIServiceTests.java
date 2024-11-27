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
public class DiningMenuAPIServiceTests {

  @Value("${app.ucsb.api.key}")
  private String apiKey;

  @Autowired private MockRestServiceServer mockRestServiceServer;

  @Mock private RestTemplate restTemplate;

  @MockBean WiremockService wiremockService;

  @Autowired private DiningMenuAPIService diningMenuAPIService;

  //@Autowired private ObjectMapper objectMapper;

  // @Test
  // public void test_getStartDateTime() {
  //   assertEquals("2024-01-01T00:00-08:00", diningMenuAPIService.getStartDateTime().toString());
  // }

  // @Test
  // public void test_getEndDateTime() {
  //   assertEquals("2024-12-31T23:59:59-08:00", diningMenuAPIService.getEndDateTime().toString());
  // }

  @Test
  void testGetDays() throws Exception {
      String expectedResult = "{expectedResult}";
      String expectedURL = DiningMenuAPIService.GET_DAYS;

      this.mockRestServiceServer
          .expect(requestTo(expectedURL))
          .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
          .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
          .andExpect(header("ucsb-api-version", "1.0"))
          .andExpect(header("ucsb-api-key", apiKey))
          .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));

      String actualResult = diningMenuAPIService.getDays();

      assertEquals(expectedResult, actualResult);
    }

    @Test
    public void testGetCommons_success() throws Exception {
      OffsetDateTime dateTime = OffsetDateTime.of(2024, 12, 01, 12, 0, 0, 0, ZoneOffset.of("-08:00"));
      DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
      String formattedDateTime = dateTime.format(formatter);

      String expectedResult = "{expectedResult}";
      String expectedURL = DiningMenuAPIService.GET_COMMONS
                          .replace("{date-time}", formattedDateTime);

      this.mockRestServiceServer
          .expect(requestTo(expectedURL))
          .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
          .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
          .andExpect(header("ucsb-api-version", "1.0"))
          .andExpect(header("ucsb-api-key", apiKey))
          .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));
  
      String actualResult = diningMenuAPIService.getCommons(dateTime);
  
      assertEquals(expectedResult, actualResult);
    }

    @Test
    public void testGetCommons_failure() throws Exception {
      OffsetDateTime dateTime = OffsetDateTime.of(2025, 01, 01, 12, 0, 0, 0, ZoneOffset.of("-08:00"));
      DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
      String formattedDateTime = dateTime.format(formatter);

      String expectedResult = "{\"error\": \"Commons doesn't serve meals on given day.\"}";
      String expectedURL = DiningMenuAPIService.GET_COMMONS
                          .replace("{date-time}", formattedDateTime);

      this.mockRestServiceServer
          .expect(requestTo(expectedURL))
          .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
          .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
          .andExpect(header("ucsb-api-version", "1.0"))
          .andExpect(header("ucsb-api-key", apiKey))
          .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));
  
      String actualResult = diningMenuAPIService.getCommons(dateTime);
  
      assertEquals(expectedResult, actualResult);
    }

    @Test
    public void testGetMeals_success() throws Exception {
      OffsetDateTime dateTime = OffsetDateTime.of(2024, 12, 01, 12, 0, 0, 0, ZoneOffset.of("-08:00"));
      DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
      String formattedDateTime = dateTime.format(formatter);
      String commons = "del-playa";

      String expectedResult = "{expectedResult}";
      String expectedURL = DiningMenuAPIService.GET_MEALS
                          .replace("{date-time}", formattedDateTime)
                          .replace("{dining-common-code}", commons);

      this.mockRestServiceServer
          .expect(requestTo(expectedURL))
          .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
          .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
          .andExpect(header("ucsb-api-version", "1.0"))
          .andExpect(header("ucsb-api-key", apiKey))
          .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));
  
      String actualResult = diningMenuAPIService.getMeals(dateTime, commons);
  
      assertEquals(expectedResult, actualResult);
    }

    @Test
    public void testGetMeals_failure() throws Exception {
      OffsetDateTime dateTime = OffsetDateTime.of(2024, 12, 01, 12, 0, 0, 0, ZoneOffset.of("-08:00"));
      DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
      String formattedDateTime = dateTime.format(formatter);
      String commons = "ortega";

      String expectedResult = "{\"error\": \"Meals are not served at given commons on given day.\"}";
      String expectedURL = DiningMenuAPIService.GET_MEALS
                          .replace("{date-time}", formattedDateTime)
                          .replace("{dining-common-code}", commons);

      this.mockRestServiceServer
          .expect(requestTo(expectedURL))
          .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
          .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
          .andExpect(header("ucsb-api-version", "1.0"))
          .andExpect(header("ucsb-api-key", apiKey))
          .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));
  
      String actualResult = diningMenuAPIService.getMeals(dateTime, commons);
  
      assertEquals(expectedResult, actualResult);
    }
}