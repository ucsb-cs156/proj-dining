package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.controllers.UCSBDiningMenuItemsController;
// import edu.ucsb.cs156.dining.dto.MenuItemDTO;

import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.http.MediaType;
import static org.mockito.Mockito.verify;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.config.SecurityConfig;
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
import static org.mockito.Mockito.times;
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

  @MockBean
  MenuItemRepository menuItemRepository;

  private static final String NAME = "NAME";
  private static final String STATION = "STATION";

  @Test
  public void logged_out_users_cannot_get_meal_items() throws Exception {
        String dateTime = "2023-10-10";
        String diningCommonCode = "ortega";
        String mealCode = "lunch";
        mockMvc.perform(get("/api/diningcommons/{dateTime}/{diningCommonsCode}/{mealCode}", dateTime, diningCommonCode, mealCode))
                        .andExpect(status().is(403)); // logged out users can't get meal items
  }

  // @WithMockUser(roles = { "USER" })
  // @Test
  // public void logged_in_users_can_get_meal_items() throws Exception {

  //   String dateTime = "2023-10-10";
  //   String diningCommonCode = "ortega";
  //   String mealCode = "lunch";

  //   String jsonResponse =
  //     String.format(
  //         """
  //             [
  //               {
  //                 \"name\": \"%s\",
  //                 \"station\":\"%s\"
  //               }
  //             ]
  //         """,
  //         NAME,
  //         STATION);
    
  //   List<Entree> expectedResult = new ArrayList<Entree>();

  //   JsonNode rootNode = objectMapper.readTree(jsonResponse);
  //   Iterator<JsonNode> elements = rootNode.elements();

  //   while (elements.hasNext()) {
  //       JsonNode element = elements.next();
  
  //       Entree meal = Entree.builder()
  //           .name(element.get("name").asText())
  //           .station(element.get("station").asText())
  //           .build();
  //       expectedResult.add(meal);
  //   }

  //   String url = "/api/diningcommons/2023-10-10/ortega/lunch";

  //   when(ucsbDiningMenuItemsService.get(dateTime, diningCommonCode, mealCode)).thenReturn(expectedResult);

  //   MvcResult response =
  //       mockMvc
  //           .perform(get(url).contentType("application/json"))
  //           .andExpect(status().isOk())
  //           .andReturn();

  //   assertEquals(
  //       expectedResult,
  //       objectMapper.readValue(
  //           response.getResponse().getContentAsString(),
  //           new TypeReference<List<Entree>>() {}));
  // }

  @WithMockUser(roles = { "USER" })
  @Test
  public void meal_item_exists() throws Exception {
    String dateTime = "2023-10-11";
    String diningCommonCode = "portola";
    String mealCode = "dinner";
    String name = "Spicy Tuna Roll";
    String station = "International";

    Entree entree = new Entree(name, station);
        List<Entree> entrees = new ArrayList<>();
        entrees.add(entree);

    when(ucsbDiningMenuItemsService.get(dateTime, diningCommonCode, mealCode))
            .thenReturn(entrees);

    when(menuItemRepository.findByDiningCommonsCodeAndMealCodeAndNameAndStation(diningCommonCode, mealCode, name, station))
        .thenReturn(Optional.empty());

    when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(invocation -> {
      MenuItem menuItem = invocation.getArgument(0);
      menuItem.setId(1L);  // Mock the ID after saving
      return menuItem;
    });

    MvcResult result = mockMvc.perform(get("/api/diningcommons/2023-10-11/portola/dinner")
          .contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$[0].name").value(name))
          .andReturn();

    String responseBody = result.getResponse().getContentAsString();

    List<MenuItem> menuItems = objectMapper.readValue(responseBody, new TypeReference<List<MenuItem>>(){});
  
    for(MenuItem item : menuItems){
        menuItemRepository.save(item);

      // assertEquals(item.getDiningCommonsCode(), "portola");
      // assertEquals(item.getMealCode(), "dinner");

      when(menuItemRepository.findByDiningCommonsCodeAndMealCodeAndNameAndStation(diningCommonCode, mealCode, name, station))
            .thenReturn(Optional.of(new MenuItem(1L, diningCommonCode, mealCode, name, station)));

      assertEquals(item.getDiningCommonsCode(), "portola");
      assertEquals(item.getMealCode(), "dinner");
      assertEquals(item.getStation(), "International");
    }

    Optional<MenuItem> found = menuItemRepository.findByDiningCommonsCodeAndMealCodeAndNameAndStation(diningCommonCode, mealCode, name, station);
    assertTrue(found.isPresent());
  }
}