package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

@RestClientTest(UCSBDiningMenuService.class)
@AutoConfigureDataJpa
public class UCSBDiningMenuServiceTests {

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  @Autowired private MockRestServiceServer mockRestServiceServer;

  @MockBean
  private edu.ucsb.cs156.dining.services.wiremock.WiremockService wiremockService;

  @Mock private RestTemplate restTemplate;

  @Autowired private UCSBDiningMenuService ucs;

  @Test
  public void test_getJSON_success() throws Exception {
    String expectedResult = "{expectedResult}";

    String dateTime = "2023-10-10";
    String diningCommonCode = "ortega";

    String expectedURL = UCSBDiningMenuService.ALL_MEAL_TIMES_AT_A_DINING_COMMON_ENDPOINT;
    expectedURL = expectedURL.replace("{date-time}", dateTime);
    expectedURL = expectedURL.replace("{dining-common-code}", diningCommonCode);

    this.mockRestServiceServer
        .expect(requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-version", "1.0"))
        .andExpect(header("ucsb-api-key", apiKey))
        .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));

    String result = ucs.getJSON(dateTime, diningCommonCode);

    assertEquals(expectedResult, result);
  }
}