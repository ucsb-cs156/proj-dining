package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

import edu.ucsb.cs156.dining.dto.MenuItemDTO;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@RestClientTest(MenuItemService.class)
public class MenuItemServiceTest {

    @Autowired
    private MenuItemService menuItemService;

    @Autowired
    private MockRestServiceServer mockServer;

    @MockBean
    private MenuItemRepository menuItemRepository;

    @MockBean
    private edu.ucsb.cs156.dining.services.wiremock.WiremockService wiremockService;

    @Value("${app.ucsb.api.consumer_key}")
    private String apiKey;

    @Test
    public void testGetMenuItems_Success() throws Exception {
        // Arrange
        String mockResponse = """
            [
                { "name": "Scrambled Eggs", "station": "Breakfast Station" },
                { "name": "Pancakes", "station": "Breakfast Station" }
            ]
        """;

        LocalDateTime dateTime = LocalDateTime.parse("2024-11-20T00:00:00");
        String formattedDate = "2024-11-20";
        String diningCommonsCode = "de-la-guerra";
        String mealCode = "breakfast";
        String expectedUrl = String.format("https://api.ucsb.edu/dining/menu/v1/%s/%s/%s", formattedDate, diningCommonsCode, mealCode);

        mockServer.expect(requestTo(expectedUrl))
                .andExpect(header("ucsb-api-key", apiKey))
                .andExpect(header("accept", "application/json"))
                .andRespond(withSuccess(mockResponse, MediaType.APPLICATION_JSON));

        // Mock repository behavior
        MenuItem mockMenuItem1 = new MenuItem(1L, "de-la-guerra", "breakfast", "Scrambled Eggs", "Breakfast Station");
        MenuItem mockMenuItem2 = new MenuItem(2L, "de-la-guerra", "breakfast", "Pancakes", "Breakfast Station");

        when(menuItemRepository.findByUniqueFields("de-la-guerra", "breakfast", "Scrambled Eggs", "Breakfast Station"))
            .thenReturn(Optional.empty());
        when(menuItemRepository.findByUniqueFields("de-la-guerra", "breakfast", "Pancakes", "Breakfast Station"))
            .thenReturn(Optional.empty());
        when(menuItemRepository.save(any(MenuItem.class)))
            .thenReturn(mockMenuItem1)
            .thenReturn(mockMenuItem2);

        // Act
        List<MenuItemDTO> result = menuItemService.getMenuItems(dateTime, diningCommonsCode, mealCode);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());

        MenuItemDTO item1 = result.get(0);
        assertEquals("Scrambled Eggs", item1.getName());
        assertEquals("Breakfast Station", item1.getStation());

        MenuItemDTO item2 = result.get(1);
        assertEquals("Pancakes", item2.getName());
        assertEquals("Breakfast Station", item2.getStation());
    
        
    }

    @Test
    public void testGetMenuItems_NotFound() {
        // Arrange
        LocalDateTime dateTime = LocalDateTime.parse("2024-11-20T00:00:00");
        String formattedDate = "2024-11-20";
        String diningCommonsCode = "invalid-commons";
        String mealCode = "invalid-meal";
        String expectedUrl = String.format("https://api.ucsb.edu/dining/menu/v1/%s/%s/%s", formattedDate, diningCommonsCode, mealCode);

        mockServer.expect(requestTo(expectedUrl))
                .andExpect(header("ucsb-api-key", apiKey))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            menuItemService.getMenuItems(dateTime, diningCommonsCode, mealCode);
        });
        assertEquals(404, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("No menu items found"));
    }

    @Test
    public void testGetMenuItems_ApiError() {
        // Arrange
        LocalDateTime dateTime = LocalDateTime.parse("2024-11-20T00:00:00");
        String formattedDate = "2024-11-20";
        String diningCommonsCode = "de-la-guerra";
        String mealCode = "breakfast";
        String expectedUrl = String.format("https://api.ucsb.edu/dining/menu/v1/%s/%s/%s", formattedDate, diningCommonsCode, mealCode);

        mockServer.expect(requestTo(expectedUrl))
                .andExpect(header("ucsb-api-key", apiKey))
                .andRespond(withServerError());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            menuItemService.getMenuItems(dateTime, diningCommonsCode, mealCode);
        });
        assertEquals(500, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("Error fetching menu items from the API"));
    }

    @Test
    public void testSaveOrUpdateMenuItem_NewItem() {
        // Arrange
        MenuItem menuItem = new MenuItem(0L, null, null, "Scrambled Eggs", "Breakfast Station");
        String diningCommonsCode = "de-la-guerra";
        String mealCode = "breakfast";

        MenuItem savedMenuItem = new MenuItem(1L, "de-la-guerra", "breakfast", "Scrambled Eggs", "Breakfast Station");

        when(menuItemRepository.findByUniqueFields(diningCommonsCode, mealCode, menuItem.getName(), menuItem.getStation()))
            .thenReturn(Optional.empty());
        when(menuItemRepository.save(menuItem)).thenReturn(savedMenuItem);

        // Act
        MenuItem result = menuItemService.saveOrUpdateMenuItem(menuItem, diningCommonsCode, mealCode);

        // Assert
        assertNotNull(result);
        assertEquals(savedMenuItem.getId(), result.getId());
        assertEquals(savedMenuItem.getDiningCommonsCode(), result.getDiningCommonsCode());
        assertEquals(savedMenuItem.getMealCode(), result.getMealCode());
        assertEquals(savedMenuItem.getName(), result.getName());
        assertEquals(savedMenuItem.getStation(), result.getStation());

        verify(menuItemRepository, times(1)).findByUniqueFields(diningCommonsCode, mealCode, menuItem.getName(), menuItem.getStation());
        verify(menuItemRepository, times(1)).save(menuItem);
    }

    @Test
    public void testSaveOrUpdateMenuItem_ExistingItem() {
        // Arrange
        MenuItem menuItem = new MenuItem(0L, null, null, "Scrambled Eggs", "Breakfast Station");
        String diningCommonsCode = "de-la-guerra";
        String mealCode = "breakfast";

        MenuItem existingMenuItem = new MenuItem(1L, "de-la-guerra", "breakfast", "Scrambled Eggs", "Breakfast Station");

        when(menuItemRepository.findByUniqueFields(diningCommonsCode, mealCode, menuItem.getName(), menuItem.getStation()))
            .thenReturn(Optional.of(existingMenuItem));

        // Act
        MenuItem result = menuItemService.saveOrUpdateMenuItem(menuItem, diningCommonsCode, mealCode);

        // Assert
        assertNotNull(result);
        assertEquals(existingMenuItem.getId(), result.getId());
        assertEquals(existingMenuItem.getDiningCommonsCode(), result.getDiningCommonsCode());
        assertEquals(existingMenuItem.getMealCode(), result.getMealCode());
        assertEquals(existingMenuItem.getName(), result.getName());
        assertEquals(existingMenuItem.getStation(), result.getStation());

        verify(menuItemRepository, times(1)).findByUniqueFields(diningCommonsCode, mealCode, menuItem.getName(), menuItem.getStation());
        verify(menuItemRepository, times(0)).save(any(MenuItem.class));
    }

    @Test
public void testSaveOrUpdateMenuItem_NewItem_FieldSetting() {
    // Arrange
    String diningCommonsCode = "de-la-guerra";
    String mealCode = "breakfast";
    String itemName = "Scrambled Eggs";
    String station = "Breakfast Station";

    MenuItem menuItem = new MenuItem(0L, null, null, itemName, station); 
    MenuItem savedMenuItem = new MenuItem(1L, diningCommonsCode, mealCode, itemName, station);

    when(menuItemRepository.findByUniqueFields(diningCommonsCode, mealCode, itemName, station))
        .thenReturn(Optional.empty());
    when(menuItemRepository.save(any(MenuItem.class))).thenReturn(savedMenuItem);

    ArgumentCaptor<MenuItem> menuItemCaptor = ArgumentCaptor.forClass(MenuItem.class);

    // Act
    menuItemService.saveOrUpdateMenuItem(menuItem, diningCommonsCode, mealCode);

    // Assert
    verify(menuItemRepository, times(1)).save(menuItemCaptor.capture());
    MenuItem capturedMenuItem = menuItemCaptor.getValue();
    
    assertEquals(diningCommonsCode, capturedMenuItem.getDiningCommonsCode());
    assertEquals(mealCode, capturedMenuItem.getMealCode());
    assertEquals(itemName, capturedMenuItem.getName());
    assertEquals(station, capturedMenuItem.getStation());
    assertNotNull(capturedMenuItem.getId());
}


}
