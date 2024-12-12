package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.dto.MenuItemDTO;
import edu.ucsb.cs156.dining.services.MenuItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for MenuItem
 */
@Tag(name = "MenuItem")
@RestController
@RequestMapping("/api/diningcommons")
@Slf4j
public class MenuItemController {

  @Autowired
  private MenuItemService menuItemService;

  /**
   * Endpoint to fetch all menu items for a specific dining commons, meal, and date.
   * The endpoint saves each menu item in the database and returns their ids, names, and stations.
   *
   * @param dateTime          the date as ISO 8601 string (e.g., "2024-11-24T00:00:00")
   * @param diningCommonsCode the code for the dining commons
   * @param meal              the meal code (e.g., "breakfast", "lunch", "dinner")
   * @return a list of MenuItemDTO containing id, name, and station
   */
  @Operation(summary = "Get menu items for a specific dining commons, meal, and date")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/{dateTime}/{diningCommonsCode}/{meal}")
  public List<MenuItemDTO> getMenuItems(
      @Parameter(description = "ISO date and time (e.g., 2024-11-24T00:00:00)")
      @PathVariable LocalDateTime dateTime,
      @PathVariable String diningCommonsCode,
      @PathVariable String meal) {
    log.info("Fetching menu items for date: {}, dining commons: {}, meal: {}", dateTime, diningCommonsCode, meal);
    return menuItemService.getMenuItems(dateTime, diningCommonsCode, meal);
  }
}
