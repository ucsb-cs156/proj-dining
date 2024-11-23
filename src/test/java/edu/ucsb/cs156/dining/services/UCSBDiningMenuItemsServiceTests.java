package edu.ucsb.cs156.dining.services;

import edu.ucsb.cs156.dining.services.wiremock.WiremockService;
import edu.ucsb.cs156.dining.models.Entree;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.core.type.TypeReference;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;
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

@RestClientTest(UCSBDiningMenuItemsService.class)
@AutoConfigureDataJpa
public class UCSBDiningMenuItemsServiceTests {

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  @Autowired private MockRestServiceServer mockRestServiceServer;

  @MockBean
  private WiremockService wiremockService;

  @Mock private RestTemplate restTemplate;

  @Autowired private UCSBDiningMenuItemsService ucsbDiningMenuItemsService;

  private static final String NAME = "NAME";
  private static final String STATION = "STATION";

  @Test
  void test_get_success() throws Exception {

    String dateTime = "2023-10-10";
    String diningCommonCode = "ortega";
    String mealCode = "lunch";

    String expectedURL = UCSBDiningMenuItemsService.ALL_MEAL_ITEMS_AT_A_DINING_COMMON_ENDPOINT;
    expectedURL = expectedURL.replace("{date-time}", dateTime);
    expectedURL = expectedURL.replace("{dining-common-code}", diningCommonCode);
    expectedURL = expectedURL.replace("{meal-code}", mealCode);

    String expectedResult =
        String.format(
            """
                [
                  {
                    \"name\": \"%s\",
                    \"station\":\"%s\"
                  }
                ]
            """,
            NAME,
            STATION);

    Entree expectedEntree = Entree.builder()
        .name(NAME)
        .station(STATION)
        .build();

    this.mockRestServiceServer
        .expect(requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-key", apiKey))
        .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));

    List<Entree> actualResult = ucsbDiningMenuItemsService.get(dateTime, diningCommonCode, mealCode);
    List<Entree> expectedList = new ArrayList<>();
    expectedList.addAll(Arrays.asList(expectedEntree));
    assertEquals(expectedList, actualResult);
  }
}
