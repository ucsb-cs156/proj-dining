package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import edu.ucsb.cs156.dining.services.wiremock.WiremockService;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
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
    public void testGetCommons() throws Exception {
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
    public void testGetMeals() throws Exception {
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
}