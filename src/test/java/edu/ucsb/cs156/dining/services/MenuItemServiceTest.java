package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

import edu.ucsb.cs156.dining.dto.MenuItemDTO;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import org.junit.jupiter.api.Test;
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
}
