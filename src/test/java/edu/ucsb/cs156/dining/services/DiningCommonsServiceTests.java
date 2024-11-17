package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.client.MockRestServiceServer;

@RestClientTest(DiningCommonsService.class)
@AutoConfigureDataJpa
@ContextConfiguration(classes = {})
class DiningCommonsServiceTests {

  @Autowired private MockRestServiceServer mockRestServiceServer;

  @Autowired private DiningCommonsService diningCommonsService;

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  @Test
  void get_returns_all_dining_commons() throws Exception {

    String expectedURL = DiningCommonsService.NAMES_ENDPOINT;

    String expectedResult = """
[
  {
    "name": "Carrillo",
    "code": "carrillo"
  },
  {
    "name": "De La Guerra",
    "code": "de-la-guerra"
  },
  {
    "name": "Ortega",
    "code": "ortega"
  },
  {
    "name": "Portola",
    "code": "portola"
  }
]
            """;

    this.mockRestServiceServer
        .expect(requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-key", apiKey))
        .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));

    String actualResult = diningCommonsService.getJSON();
    assertEquals(expectedResult, actualResult);
  }
}