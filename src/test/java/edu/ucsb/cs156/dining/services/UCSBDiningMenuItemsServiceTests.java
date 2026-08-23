package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.services.wiremock.WiremockService;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.client.MockRestServiceServer;

@RestClientTest(UCSBDiningMenuItemsService.class)
@AutoConfigureDataJpa
public class UCSBDiningMenuItemsServiceTests {

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  @Value("${app.ucsb.api.host}")
  private String apiHost;

  @Value("${app.name}")
  private String appName;

  @Value("${app.hostname}")
  private String appHostname;

  @Autowired private MockRestServiceServer mockRestServiceServer;

  @MockitoBean private WiremockService wiremockService;

  @Autowired private UCSBDiningMenuItemsService ucsbDiningMenuItemsService;

  @MockitoBean private MenuItemRepository miRepository;

  private static final String NAME = "NAME";
  private static final String STATION = "STATION";

  @Test
  void test_get_success() throws Exception {

    String dateTime = "2023-10-10";
    String diningCommonCode = "ortega";
    String mealCode = "lunch";

    String expectedURL = UCSBDiningMenuItemsService.ALL_MEAL_ITEMS_AT_A_DINING_COMMON_ENDPOINT;
    expectedURL = expectedURL.replace("{apiHost}", apiHost);
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

    this.mockRestServiceServer
        .expect(requestTo(expectedURL))
        .andExpect(header("Accept", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("Content-Type", MediaType.APPLICATION_JSON.toString()))
        .andExpect(header("ucsb-api-key", apiKey))
        .andExpect(header("X-Requesting-App", appName + "." + appHostname))
        .andRespond(withSuccess(expectedResult, MediaType.APPLICATION_JSON));

    List<Entree> actualResult =
        ucsbDiningMenuItemsService.get(dateTime, diningCommonCode, mealCode);
    List<Entree> expectedList = new ArrayList<>();
    expectedList.addAll(Arrays.asList(expectedEntree));
    assertEquals(expectedList, actualResult);
  }

  @Test
  public void getOrCreateTest() {
    Entree exists = Entree.builder().name(NAME).station(STATION).build();
    Entree doesNotExist = Entree.builder().name("doesNotExist").station("doesNotExist").build();
    ArrayList<Entree> returnedEntrees = new ArrayList<>(List.of(exists, doesNotExist));
    MenuItem existsMi =
        MenuItem.builder()
            .id(1L)
            .name(NAME)
            .station(STATION)
            .diningCommonsCode("ortega")
            .mealCode("lunch")
            .build();
    MenuItem createdMi =
        MenuItem.builder()
            .name("doesNotExist")
            .station("doesNotExist")
            .diningCommonsCode("ortega")
            .mealCode("lunch")
            .build();
    when(miRepository.findExistingEntrees("ortega", "lunch", returnedEntrees))
        .thenReturn(new ArrayList<>(List.of(existsMi)));
    when(miRepository.save(createdMi)).thenReturn(createdMi);
    List<MenuItem> actualResult =
        ucsbDiningMenuItemsService.getOrCreateMenuItems("ortega", "lunch", returnedEntrees);
    assertEquals(new ArrayList<>(List.of(existsMi, createdMi)), actualResult);
  }
}
