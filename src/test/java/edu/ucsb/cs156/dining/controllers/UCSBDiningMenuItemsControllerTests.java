package edu.ucsb.cs156.dining.controllers;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.config.SecurityConfig;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.services.UCSBDiningMenuItemsService;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(value = UCSBDiningMenuItemsController.class)
@Import(SecurityConfig.class)
@AutoConfigureDataJpa
public class UCSBDiningMenuItemsControllerTests extends ControllerTestCase {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private UCSBDiningMenuItemsService miService;

  @Autowired private ObjectMapper objectMapper;

  @MockitoBean MenuItemRepository menuItemRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void approved_reviews_only_are_included_in_menu_items_response() throws Exception {
    String dateTime = "2023-10-11";
    String diningCommonCode = "portola";
    String mealCode = "dinner";
    String name = "Spicy Tuna Roll";
    String station = "International";

    Entree entree = new Entree(name, station);
    List<Entree> entrees = new ArrayList<>();
    entrees.add(entree);

    Review approvedReview =
        Review.builder()
            .id(10L)
            .itemsStars(4L)
            .reviewerComments("Great!")
            .status(ModerationStatus.APPROVED)
            .build();

    Review rejectedReview =
        Review.builder()
            .id(11L)
            .itemsStars(2L)
            .reviewerComments("six seven")
            .status(ModerationStatus.REJECTED)
            .build();

    MenuItem item =
        MenuItem.builder()
            .diningCommonsCode(diningCommonCode)
            .mealCode(mealCode)
            .name(name)
            .station(station)
            .reviews(List.of(approvedReview, rejectedReview))
            .build();

    when(miService.get(dateTime, diningCommonCode, mealCode)).thenReturn(entrees);
    when(miService.getOrCreateMenuItems(diningCommonCode, mealCode, entrees))
        .thenReturn(List.of(item));

    mockMvc
        .perform(
            get("/api/diningcommons/2023-10-11/portola/dinner")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].name").value(name))
        .andExpect(jsonPath("$[0].reviews").isArray())
        .andExpect(jsonPath("$[0].reviews.length()").value(1))
        .andExpect(jsonPath("$[0].reviews[0].itemsStars").value(4))
        .andExpect(jsonPath("$[0].reviews[0].reviewerComments").value("Great!"));
  }

  @Test
  public void get_menu_item_by_id_success() throws Exception {
    // arrange
    MenuItem menuItem =
        new MenuItem(1L, "portola", "dinner", "Spicy Tuna Roll", "International", null);
    when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));

    // act and assert
    mockMvc
        .perform(get("/api/diningcommons/menuitem?id=1").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.name").value("Spicy Tuna Roll"))
        .andExpect(jsonPath("$.station").value("International"))
        .andExpect(jsonPath("$.diningCommonsCode").value("portola"))
        .andExpect(jsonPath("$.mealCode").value("dinner"));
  }

  @Test
  public void get_menu_item_by_id_not_found() throws Exception {
    // arrange
    when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

    // act and assert
    mockMvc
        .perform(get("/api/diningcommons/menuitem?id=1").contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }
}
