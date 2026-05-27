package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.config.SecurityConfig;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.models.MenuItemDto;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.services.UCSBDiningMenuItemsService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(value = UCSBDiningMenuItemsController.class)
@Import(SecurityConfig.class)
@AutoConfigureDataJpa
public class UCSBDiningMenuItemsControllerTests extends ControllerTestCase {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private UCSBDiningMenuItemsService ucsbDiningMenuItemsService;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean MenuItemRepository menuItemRepository;

  @Test
  public void menu_items_endpoint_returns_menu_items() throws Exception {

    Entree incoming = Entree.builder().name("waffles").station("self-serve").build();

    String date = "2026-03-11";
    String commons = "de-la-guerra";
    String mealCode = "breakfast";

    MenuItemDto existingItem = new MenuItemDto(1L, commons, mealCode, "waffles", "self-serve", 4.5);

    when(ucsbDiningMenuItemsService.get(date, commons, mealCode)).thenReturn(List.of(incoming));
    when(menuItemRepository.projectExistingEntrees(commons, mealCode, List.of(incoming)))
        .thenReturn(new ArrayList<>(List.of(existingItem)));
    when(menuItemRepository.saveAll(anyList())).thenReturn(List.of());

    String url = String.format("/api/diningcommons/%s/%s/%s", date, commons, mealCode);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();

    String responseString = response.getResponse().getContentAsString();
    List<Map<String, Object>> jsonList = objectMapper.readValue(responseString, List.class);

    assertEquals(1, jsonList.size());
    assertEquals("waffles", jsonList.get(0).get("name"));
    assertEquals("self-serve", jsonList.get(0).get("station"));
    assertEquals(4.5, jsonList.get(0).get("reviewScore"));
  }

  @Test
  public void menu_items_endpoint_adds_new_items() throws Exception {

    Entree incoming = Entree.builder().name("pancakes").station("station-1").build();

    String date = "2026-03-12";
    String commons = "carrillo";
    String mealCode = "lunch";

    // Existing item in the database
    MenuItemDto existingItem = new MenuItemDto(1L, commons, mealCode, "pizza", "main", 3.0);

    when(ucsbDiningMenuItemsService.get(date, commons, mealCode)).thenReturn(List.of(incoming));
    when(menuItemRepository.projectExistingEntrees(commons, mealCode, List.of(incoming)))
        .thenReturn(new ArrayList<>(List.of(existingItem)));

    // Mock the save to return a new MenuItem
    MenuItem newMenuItem =
        MenuItem.builder()
            .id(2L)
            .diningCommonsCode(commons)
            .mealCode(mealCode)
            .name("pancakes")
            .station("station-1")
            .build();
    when(menuItemRepository.saveAll(anyList())).thenReturn(List.of(newMenuItem));

    String url = String.format("/api/diningcommons/%s/%s/%s", date, commons, mealCode);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();

    String responseString = response.getResponse().getContentAsString();
    List<Map<String, Object>> jsonList = objectMapper.readValue(responseString, List.class);

    // Should contain both existing and new items
    assertEquals(2, jsonList.size());

    // Verify the items are present (order may vary)
    boolean hasPizza = false;
    boolean hasPancakes = false;
    for (Map<String, Object> item : jsonList) {
      if ("pizza".equals(item.get("name"))) {
        hasPizza = true;
        assertEquals("main", item.get("station"));
        assertEquals(3.0, item.get("reviewScore"));
      }
      if ("pancakes".equals(item.get("name"))) {
        hasPancakes = true;
        assertEquals("station-1", item.get("station"));
      }
    }
    assertEquals(true, hasPizza, "Pizza item should be in response");
    assertEquals(true, hasPancakes, "Pancakes item should be in response");
  }

  @Test
  public void get_menu_item_by_id_returns_item() throws Exception {

    MenuItem item =
        MenuItem.builder()
            .id(1L)
            .diningCommonsCode("de-la-guerra")
            .mealCode("breakfast")
            .name("waffles")
            .station("self-serve")
            .build();

    when(menuItemRepository.findById(1L)).thenReturn(Optional.of(item));

    MvcResult response =
        mockMvc
            .perform(get("/api/diningcommons/menuitem?id=1").contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();

    String responseString = response.getResponse().getContentAsString();
    MenuItem responseItem = objectMapper.readValue(responseString, MenuItem.class);

    assertEquals("waffles", responseItem.getName());
    assertEquals("self-serve", responseItem.getStation());
  }

  @Test
  public void get_menu_item_by_id_returns_404_when_not_found() throws Exception {

    when(menuItemRepository.findById(999L)).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(get("/api/diningcommons/menuitem?id=999").contentType("application/json"))
            .andExpect(status().isNotFound())
            .andReturn();

    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
  }

  @Test
  public void menu_items_endpoint_with_multiple_new_items() throws Exception {

    Entree entree1 = Entree.builder().name("pizza").station("main").build();
    Entree entree2 = Entree.builder().name("pasta").station("main").build();

    String date = "2026-03-13";
    String commons = "ortega";
    String mealCode = "dinner";

    when(ucsbDiningMenuItemsService.get(date, commons, mealCode))
        .thenReturn(List.of(entree1, entree2));
    when(menuItemRepository.projectExistingEntrees(commons, mealCode, List.of(entree1, entree2)))
        .thenReturn(new ArrayList<>());

    MenuItem newItem1 =
        MenuItem.builder()
            .id(1L)
            .diningCommonsCode(commons)
            .mealCode(mealCode)
            .name("pizza")
            .station("main")
            .build();
    MenuItem newItem2 =
        MenuItem.builder()
            .id(2L)
            .diningCommonsCode(commons)
            .mealCode(mealCode)
            .name("pasta")
            .station("main")
            .build();
    when(menuItemRepository.saveAll(anyList())).thenReturn(List.of(newItem1, newItem2));

    String url = String.format("/api/diningcommons/%s/%s/%s", date, commons, mealCode);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();

    String responseString = response.getResponse().getContentAsString();
    List<Map<String, Object>> jsonList = objectMapper.readValue(responseString, List.class);

    assertEquals(2, jsonList.size());
  }
}
