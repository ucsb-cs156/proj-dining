package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.models.Entree;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.config.SecurityConfig;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.UCSBDiningMenuItemsService;
import org.junit.jupiter.api.Test;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Iterator;

@WebMvcTest(value = UCSBDiningMenuItemsController.class)
@Import(SecurityConfig.class)
@AutoConfigureDataJpa
public class UCSBDiningMenuItemsControllerTests extends ControllerTestCase {

  @Autowired private MockMvc mockMvc;

  @MockBean private UCSBDiningMenuItemsService ucsbDiningMenuItemsService;

  @Autowired private ObjectMapper objectMapper;

  private static final String NAME = "NAME";
  private static final String STATION = "STATION";

  @Test
  public void logged_out_users_cannot_get_meal_items() throws Exception {
        String dateTime = "2023-10-10";
        String diningCommonCode = "ortega";
        String mealCode = "lunch";
        mockMvc.perform(get("/api/diningcommons/{dateTime}/{diningCommonsCode}/{lunch}", dateTime, diningCommonCode, mealCode))
                        .andExpect(status().is(403)); // logged out users can't get meal times
  }

  @WithMockUser(roles = { "USER" })
  @Test
  public void logged_in_users_can_get_meal_items() throws Exception {

    String dateTime = "2023-10-10";
    String diningCommonCode = "ortega";
    String mealCode = "lunch";

    String readat = UCSBDiningMenuItemsService.ALL_MEAL_ITEMS_AT_A_DINING_COMMON_ENDPOINT;
    readat = readat.replace("{date-time}", dateTime);
    readat = readat.replace("{dining-common-code}", diningCommonCode);
    readat = readat.replace("{meal-code}", mealCode);

    String jsonResponse =
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
    
    List<Entree> expectedResult = new ArrayList<Entree>();

    JsonNode rootNode = objectMapper.readTree(jsonResponse);
    Iterator<JsonNode> elements = rootNode.elements();

    while (elements.hasNext()) {
        JsonNode element = elements.next();
  
        Entree meal = Entree.builder()
            .name(element.get("name").asText())
            .station(element.get("station").asText())
            .build();
        expectedResult.add(meal);
    }

    String url = "/api/diningcommons/2023-10-10/ortega/lunch";

    when(ucsbDiningMenuItemsService.get(dateTime, diningCommonCode, mealCode)).thenReturn(expectedResult);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();

    assertEquals(
        expectedResult,
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<Entree>>() {}));
  }
}

