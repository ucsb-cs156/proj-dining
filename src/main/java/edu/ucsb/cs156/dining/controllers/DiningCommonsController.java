package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.services.DiningCommonsService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Parameter;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;

import org.springframework.web.bind.annotation.PathVariable;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/diningcommons")
public class DiningCommonsController {

  @Autowired DiningCommonsService diningCommonsService;
  @Autowired MenuItemRepository menuItemRepository;

  @GetMapping(value = "/all", produces = "application/json")
  public ResponseEntity<String> getAllDiningCommons() throws Exception {

    String body = diningCommonsService.getDiningCommonsJSON();

    return ResponseEntity.ok().body(body);
  }

  @GetMapping(value = "/{date-time}/{dining-commons-code}", produces = "application/json")
  public ResponseEntity<String> getMealsByDateTimeAndDiningCommonsCode(
    @Parameter(name = "date-time", required = true) @PathVariable("date-time") LocalDateTime date_time,
    @Parameter(name = "dining-commons-code", required = true) @PathVariable("dining-commons-code") String dining_commons_code) throws Exception {
        
        String body = diningCommonsService.getMealsByDateJSON(date_time, dining_commons_code);

        return ResponseEntity.ok().body(body);
  }


  public static class MenuItemDTO {
    private Long id;
    private MenuItem menuItem;

    // Constructor
    public MenuItemDTO(Long id, MenuItem menuItem) {
        this.id = id;
        this.menuItem = menuItem;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public MenuItem getMenuItem() {
        return menuItem;
    }
}


  @GetMapping(value = "/{date-time}/{dining-commons-code}/{meal}", produces = "application/json")
  //@PostMapping(value = "/{date-time}/{dining-commons-code}/{meal}", produces = "application/json")
  public ResponseEntity<List<MenuItemDTO>> getMenuItemsByMealDateTimeAndDiningCommonsCode(
    @Parameter(name = "date-time", required = true) @PathVariable("date-time") LocalDateTime dateTime,
    @Parameter(name = "dining-commons-code", required = true) @PathVariable("dining-commons-code") String diningCommonsCode,
    @Parameter(name = "meal", required = true) @PathVariable("meal") String meal) throws Exception {

    String body = diningCommonsService.getMenuItemsByMealAndDateJSON(dateTime, diningCommonsCode, meal);
    JSONArray retrievedMenuItems = new JSONArray(body);

    List<MenuItemDTO> menuItemDTOs = new ArrayList<>();

    Optional<MenuItem> existingMenuItem;
    MenuItem returnedMenuItem = new MenuItem();

    for (int i = 0; i < retrievedMenuItems.length(); i++) {
        JSONObject retrievedMenuItem = retrievedMenuItems.getJSONObject(i);
        String name = retrievedMenuItem.getString("name");
        String station = retrievedMenuItem.getString("station");

        // Check if record already exists
        existingMenuItem = menuItemRepository.findFirstByDiningCommonsCodeAndMealAndNameAndStation(
            diningCommonsCode, meal, name, station);

        
        MenuItem newMenuItem = new MenuItem();
        newMenuItem.setDiningCommonsCode(diningCommonsCode);
        newMenuItem.setMeal(meal);
        newMenuItem.setName(name);
        newMenuItem.setStation(station);

        returnedMenuItem = existingMenuItem.orElseGet(() -> menuItemRepository.save(newMenuItem));
        // We must use orElseGet (and not orElse) to ensure lazy evaluation of the Optional<MenuItem>, that is,
        // we only want to save a new MenuItem if NO existing menu item is returned.

        // Add to DTO list
        menuItemDTOs.add(new MenuItemDTO(returnedMenuItem.getId(), returnedMenuItem));
    }

    return ResponseEntity.ok(menuItemDTOs);
  }
}