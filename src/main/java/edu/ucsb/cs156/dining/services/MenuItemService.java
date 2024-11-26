package edu.ucsb.cs156.dining.services;

import edu.ucsb.cs156.dining.dto.MenuItemDTO;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for interacting with the Dining Menu API and saving menu items.
 */
@Service
public class MenuItemService {

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  private final RestTemplate restTemplate;
  private final MenuItemRepository menuItemRepository;

  private static final String MENU_ITEM_ENDPOINT = "https://api.ucsb.edu/dining/menu/v1/";
  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

  public MenuItemService(RestTemplateBuilder restTemplateBuilder, MenuItemRepository menuItemRepository) {
    this.restTemplate = restTemplateBuilder.build();
    this.menuItemRepository = menuItemRepository;
  }

  /**
   * Fetches all menu items for a specific dining commons, meal, and date.
   * Saves each unique menu item to the database.
   *
   * @param dateTime          the date as LocalDateTime
   * @param diningCommonsCode the code for the dining commons
   * @param mealCode          the meal code (e.g., "breakfast", "lunch", "dinner")
   * @return a list of MenuItemDTO containing name, station, and id
   */
  public List<MenuItemDTO> getMenuItems(LocalDateTime dateTime, String diningCommonsCode, String mealCode) {
    String formattedDate = dateTime.format(DATE_FORMATTER);
    String url = String.format("%s%s/%s/%s", MENU_ITEM_ENDPOINT, formattedDate, diningCommonsCode, mealCode);

    HttpHeaders headers = new HttpHeaders();
    headers.set("ucsb-api-key", this.apiKey);
    headers.set("accept", "application/json");

    HttpEntity<String> entity = new HttpEntity<>("body", headers);

    try {
      ResponseEntity<MenuItem[]> response = restTemplate.exchange(
          url, HttpMethod.GET, entity, MenuItem[].class);

      MenuItem[] menuItemsArray = response.getBody();

      // Save unique menu items to the database and return DTOs
      List<MenuItemDTO> result = Arrays.stream(menuItemsArray)
            .map(menuItem -> saveOrUpdateMenuItem(menuItem, diningCommonsCode, mealCode))
            .map(menuItem -> new MenuItemDTO(menuItem.getId(), menuItem.getName(), menuItem.getStation()))
            .collect(Collectors.toList());
      return result;
    } catch (HttpClientErrorException.NotFound e) {
        // Handle 404 error from external API
        throw new ResponseStatusException(
            org.springframework.http.HttpStatus.NOT_FOUND,
            String.format("No menu items found for dining commons: %s, meal: %s, date: %s",
                diningCommonsCode, mealCode, formattedDate));
    } catch (Exception e) {
      throw new ResponseStatusException(
          org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
          "Error fetching menu items from the API", e);
    }
  }

  /**
   * Saves the menu item to the database if it does not already exist.
   *
   * @param menuItem          the menu item retrieved from the API
   * @param diningCommonsCode the dining commons code
   * @param mealCode          the meal code
   * @return the saved or existing MenuItem
   */
  public MenuItem saveOrUpdateMenuItem(MenuItem menuItem, String diningCommonsCode, String mealCode) {
    // Check if the menu item already exists
    return menuItemRepository.findByUniqueFields(diningCommonsCode, mealCode, menuItem.getName(), menuItem.getStation())
        .orElseGet(() -> {
          // Log the new menu item to be saved
            menuItem.setDiningCommonsCode(diningCommonsCode);
            menuItem.setMealCode(mealCode);
            MenuItem savedItem = menuItemRepository.save(menuItem);
            return savedItem;
        });
  }
}
