package edu.ucsb.cs156.dining.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.config.SecurityConfig;
import edu.ucsb.cs156.dining.dto.MenuItemDTO;
import edu.ucsb.cs156.dining.services.MenuItemService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.server.ResponseStatusException;
import java.util.Collections;


import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;


@Import(SecurityConfig.class)
@AutoConfigureDataJpa
@WebMvcTest(MenuItemController.class) // Ensure only controller is loaded
public class MenuItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MenuItemService menuItemService; // Mock service dependency

    @MockBean
    private edu.ucsb.cs156.dining.services.wiremock.WiremockService wiremockService; // Ensure WiremockService is mocked

    @Autowired
    private ObjectMapper objectMapper;

    @WithMockUser(roles = { "USER" })
    @Test
    public void testGetMenuItems_Success() throws Exception {
        // Arrange
        LocalDateTime dateTime = LocalDateTime.parse("2024-11-24T00:00:00");
        String diningCommonsCode = "ortega";
        String mealCode = "lunch";

        List<MenuItemDTO> mockResponse = List.of(
                new MenuItemDTO(1L, "Tofu Banh Mi Sandwich (v)", "Entree Specials"),
                new MenuItemDTO(2L, "Chicken Caesar Salad", "Entrees")
        );

        when(menuItemService.getMenuItems(dateTime, diningCommonsCode, mealCode))
                .thenReturn(mockResponse);

        // Convert mockResponse to JSON string for comparison
        ObjectMapper objectMapper = new ObjectMapper();
        String expectedResponse = objectMapper.writeValueAsString(mockResponse);

        // Act & Assert
        mockMvc.perform(get(String.format("/api/diningcommons/%s/%s/%s", dateTime, diningCommonsCode, mealCode)))
            .andExpect(status().isOk())
            .andExpect(content().json(expectedResponse)); // Assert response body matches mockResponse
        }
    

    @WithMockUser(roles = { "USER" })
    @Test
    public void testGetMenuItems_NotFound() throws Exception {
        // Arrange
        LocalDateTime dateTime = LocalDateTime.parse("2024-11-24T00:00:00");
        String diningCommonsCode = "invalid-commons";
        String mealCode = "lunch";

        when(menuItemService.getMenuItems(dateTime, diningCommonsCode, mealCode))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "No menu items found"));

        // Act & Assert
        mockMvc.perform(get(String.format("/api/diningcommons/%s/%s/%s", dateTime, diningCommonsCode, mealCode)))
                .andExpect(status().isNotFound());
    }

   @WithMockUser(roles = { "USER" })
   @Test
   public void testGetMenuItems_EmptyList() throws Exception {
        // Arrange
   LocalDateTime dateTime = LocalDateTime.parse("2024-11-24T00:00:00");
        String diningCommonsCode = "ortega";
        String mealCode = "lunch";

        // Simulate the service returning an empty list
        when(menuItemService.getMenuItems(dateTime, diningCommonsCode, mealCode))
                .thenReturn(Collections.emptyList());

        // Act
        MvcResult result = mockMvc.perform(get(String.format("/api/diningcommons/%s/%s/%s", dateTime, diningCommonsCode, mealCode)))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        String responseBody = result.getResponse().getContentAsString();
        List<MenuItemDTO> actualResponse = objectMapper.readValue(responseBody, new TypeReference<List<MenuItemDTO>>() {});
        assertEquals(0, actualResponse.size(), "Expected an empty list but got some items");
        }


}
