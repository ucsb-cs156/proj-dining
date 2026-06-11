package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
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

  @MockitoBean MenuItemRepository menuItemRepository;

  @Test
  public void get_menu_items_returns_existing_and_new_items() throws Exception {
    String date = "2026-03-11";
    String commons = "de-la-guerra";
    String mealCode = "breakfast";

    Entree existingEntree = Entree.builder().name("waffles").station("self-serve").build();
    Entree newEntree = Entree.builder().name("omelet").station("grill").build();
    List<Entree> entrees = List.of(existingEntree, newEntree);

    MenuItemDto existingMenuItem =
        new MenuItemDto(1L, commons, mealCode, "waffles", "self-serve", 4.0);

    MenuItem secondMenuItem =
        MenuItem.builder()
            .name("omelet")
            .station("grill")
            .id(2L)
            .reviews(List.of())
            .diningCommonsCode(commons)
            .mealCode(mealCode)
            .build();

    List<MenuItemDto> existingMenuItems = new ArrayList<>(List.of(existingMenuItem));

    when(ucsbDiningMenuItemsService.get(date, commons, mealCode)).thenReturn(entrees);
    when(menuItemRepository.projectExistingEntrees(eq(commons), eq(mealCode), eq(entrees)))
        .thenReturn(existingMenuItems);
    when(menuItemRepository.saveAll(any())).thenReturn(List.of(secondMenuItem));

    MvcResult response =
        mockMvc
            .perform(get("/api/diningcommons/" + date + "/" + commons + "/" + mealCode))
            .andExpect(status().isOk())
            .andReturn();

    ArgumentCaptor<Iterable<MenuItem>> savedItemsCaptor = ArgumentCaptor.forClass(Iterable.class);
    verify(menuItemRepository, times(1)).saveAll(savedItemsCaptor.capture());
    List<MenuItem> savedItems =
        StreamSupport.stream(savedItemsCaptor.getValue().spliterator(), false).toList();
    assertEquals(1, savedItems.size());
    MenuItem savedItem = savedItems.getFirst();
    assertEquals(commons, savedItem.getDiningCommonsCode());
    assertEquals(mealCode, savedItem.getMealCode());
    assertEquals("omelet", savedItem.getName());
    assertEquals("grill", savedItem.getStation());

    List<MenuItemDto> expected =
        List.of(existingMenuItem, new MenuItemDto(2L, commons, mealCode, "omelet", "grill", null));

    String expectedJson = mapper.writeValueAsString(expected);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void get_menu_item_by_id_returns_item_when_present() throws Exception {
    MenuItem menuItem =
        MenuItem.builder()
            .id(5L)
            .diningCommonsCode("carrillo")
            .mealCode("lunch")
            .name("pizza")
            .station("station 1")
            .build();

    when(menuItemRepository.findById(5L)).thenReturn(Optional.of(menuItem));

    MvcResult response =
        mockMvc
            .perform(get("/api/diningcommons/menuitem").param("id", "5"))
            .andExpect(status().isOk())
            .andReturn();

    String expectedJson = mapper.writeValueAsString(menuItem);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void get_menu_item_by_id_returns_404_when_missing() throws Exception {
    when(menuItemRepository.findById(42L)).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(get("/api/diningcommons/menuitem").param("id", "42"))
            .andExpect(status().isNotFound())
            .andReturn();

    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("MenuItem with id 42 not found", json.get("message"));
  }
}
