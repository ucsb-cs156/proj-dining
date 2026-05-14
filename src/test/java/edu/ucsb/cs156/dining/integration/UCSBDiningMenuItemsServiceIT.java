package edu.ucsb.cs156.dining.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.services.UCSBDiningMenuItemsService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {"app.ucsb.api.consumer_key=test-key"})
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
public class UCSBDiningMenuItemsServiceIT {

  @Autowired private UCSBDiningMenuItemsService ucsbDiningMenuItemsService;

  private MockRestServiceServer mockRestServiceServer;

  @Autowired private RestTemplate template;

  private static final String NAME = "NAME";
  private static final String STATION = "STATION";

  @BeforeEach
  public void setup() {
    mockRestServiceServer = MockRestServiceServer.bindTo(template).build();
  }

  @Test
  public void caching_works() throws Exception {
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
            NAME, STATION);

    Entree expectedEntree = Entree.builder().name(NAME).station(STATION).build();

    mockRestServiceServer
        .expect(ExpectedCount.once(), requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-key", "test-key"))
        .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));

    List<Entree> actualResult =
        ucsbDiningMenuItemsService.get(dateTime, diningCommonCode, mealCode);

    assertEquals(List.of(expectedEntree), actualResult);

    ucsbDiningMenuItemsService.get(dateTime, diningCommonCode, mealCode);

    mockRestServiceServer.verify();
  }

  @Test
  public void caching_does_not_interfere_with_separate_calls() throws Exception {
    String dateTime = "2023-10-10";
    String diningCommonCode = "ortega";
    String mealCode = "lunch";

    String secondaryDateTime = "2023-10-11";

    String expectedURL = UCSBDiningMenuItemsService.ALL_MEAL_ITEMS_AT_A_DINING_COMMON_ENDPOINT;
    expectedURL = expectedURL.replace("{date-time}", dateTime);
    expectedURL = expectedURL.replace("{dining-common-code}", diningCommonCode);
    expectedURL = expectedURL.replace("{meal-code}", mealCode);

    String secondaryUrl = UCSBDiningMenuItemsService.ALL_MEAL_ITEMS_AT_A_DINING_COMMON_ENDPOINT;
    secondaryUrl = secondaryUrl.replace("{date-time}", secondaryDateTime);
    secondaryUrl = secondaryUrl.replace("{dining-common-code}", diningCommonCode);
    secondaryUrl = secondaryUrl.replace("{meal-code}", mealCode);

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
            NAME, STATION);

    String secondaryResult =
        String.format(
            """
            [
              {
                \"name\": \"%s\",
                \"station\":\"%s\"
              }
            ]
        """,
            "Sugar Cookie", "takeout");

    Entree expectedEntree = Entree.builder().name(NAME).station(STATION).build();
    Entree secondaryEntree = Entree.builder().name("Sugar Cookie").station("takeout").build();

    mockRestServiceServer
        .expect(ExpectedCount.once(), requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-key", "test-key"))
        .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));

    mockRestServiceServer
        .expect(ExpectedCount.once(), requestTo(secondaryUrl))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-key", "test-key"))
        .andRespond(withSuccess(secondaryResult, MediaType.APPLICATION_JSON));

    List<Entree> actualResult =
        ucsbDiningMenuItemsService.get(dateTime, diningCommonCode, mealCode);

    assertEquals(List.of(expectedEntree), actualResult);

    List<Entree> secondaryResultList =
        ucsbDiningMenuItemsService.get(secondaryDateTime, diningCommonCode, mealCode);

    assertEquals(List.of(secondaryEntree), secondaryResultList);

    mockRestServiceServer.verify();
  }
}
