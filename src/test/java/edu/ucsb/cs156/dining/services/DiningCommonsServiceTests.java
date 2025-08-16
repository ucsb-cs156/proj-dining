package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import edu.ucsb.cs156.dining.models.DiningCommons;
import edu.ucsb.cs156.dining.services.wiremock.WiremockService;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.client.MockRestServiceServer;

@RestClientTest(DiningCommonsService.class)
@AutoConfigureDataJpa
@ContextConfiguration(classes = {})
class DiningCommonsServiceTests {

  @MockBean private WiremockService wiremockService;

  @Autowired private MockRestServiceServer mockRestServiceServer;

  @Autowired private DiningCommonsService diningCommonsService;

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  private static final String NAME = "NAME";
  private static final String CODE = "CODE";
  private static final Boolean HASDININGCAM = false;
  private static final Boolean HASSACKMEAL = false;
  private static final Boolean HASTAKEOUTMEAL = false;
  private static final Double LATITUDE = 1.0;
  private static final Double LONGITUDE = 2.0;

  @Test
  void get_returns_a_list_of_commons() throws Exception {

    String expectedURL = DiningCommonsService.ENDPOINT;

    String expectedResult =
        String.format(
            """
            [
            {
              \"name\": \"%s\",
              \"code\":\"%s\",
              \"hasDiningCam\": \"%s\",
              \"hasSackMeal\": \"%s\",
              \"hasTakeOutMeal\": \"%s\",
              \"location\":{
                \"longitude\": %s,
                \"latitude\": %s
              }
            }
            ]
            """,
            NAME, CODE, HASDININGCAM, HASSACKMEAL, HASTAKEOUTMEAL, LONGITUDE, LATITUDE);

    DiningCommons expectedCommons =
        DiningCommons.builder()
            .name(NAME)
            .code(CODE)
            .hasDiningCam(HASDININGCAM)
            .hasSackMeal(HASSACKMEAL)
            .hasTakeOutMeal(HASTAKEOUTMEAL)
            .latitude(LATITUDE)
            .longitude(LONGITUDE)
            .build();

    this.mockRestServiceServer
        .expect(requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-key", apiKey))
        .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));

    List<DiningCommons> actualResult = diningCommonsService.get();
    List<DiningCommons> expectedList = new ArrayList<>();
    expectedList.addAll(Arrays.asList(expectedCommons));
    assertEquals(expectedList, actualResult);
  }
}
