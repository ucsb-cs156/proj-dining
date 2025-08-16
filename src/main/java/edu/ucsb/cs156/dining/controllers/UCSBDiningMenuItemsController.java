package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.services.UCSBDiningMenuItemsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "UCSBDiningMenuItems")
@RestController
@RequestMapping("/api/diningcommons")
@Slf4j
public class UCSBDiningMenuItemsController extends ApiController {

  @Autowired UCSBDiningMenuItemsService ucsbDiningMenuItemsService;

  @Autowired MenuItemRepository menuItemRepository;

  @Operation(summary = "Get list of entrees being served at given meal, dining common, and day")
  @GetMapping(
      value = "/{date-time}/{dining-commons-code}/{meal-code}",
      produces = "application/json")
  public ResponseEntity<List<MenuItem>> get_menu_items(
      @Parameter(
              description =
                  "date (in iso format, e.g. YYYY-mm-dd) or date-time (in iso format e.g. YYYY-mm-ddTHH:MM:SS)")
          @PathVariable("date-time")
          String datetime,
      @PathVariable("dining-commons-code") String diningcommoncode,
      @PathVariable("meal-code") String mealcode)
      throws Exception {

    List<Entree> body = ucsbDiningMenuItemsService.get(datetime, diningcommoncode, mealcode);

    List<MenuItem> menuitems = new ArrayList<>();

    for (Entree entree : body) {
      Optional<MenuItem> exists =
          menuItemRepository.findByDiningCommonsCodeAndMealCodeAndNameAndStation(
              diningcommoncode, mealcode, entree.getName(), entree.getStation());

      MenuItem newMenuItem = exists.orElse(new MenuItem());
      // MenuItem newMenuItem = new MenuItem();
      newMenuItem.setDiningCommonsCode(diningcommoncode);
      newMenuItem.setMealCode(mealcode);
      newMenuItem.setName(entree.getName());
      newMenuItem.setStation(entree.getStation());

      menuItemRepository.save(newMenuItem);
      menuitems.add(newMenuItem);
    }

    return ResponseEntity.ok().body(menuitems);
  }

  @Operation(summary = "Get a single menu item by ID")
  @GetMapping(value = "/menuitem", produces = "application/json")
  public ResponseEntity<MenuItem> get_menu_item_by_id(
      @Parameter(description = "ID of the menu item") @RequestParam long id) throws Exception {
    Optional<MenuItem> menuItem = menuItemRepository.findById(id);
    if (menuItem.isEmpty()) {
      throw new EntityNotFoundException(MenuItem.class, id);
    }
    return ResponseEntity.ok().body(menuItem.get());
  }
}
