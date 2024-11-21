package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.config.SecurityConfig;
import edu.ucsb.cs156.dining.models.Meal;
import edu.ucsb.cs156.dining.services.UCSBAPIMenuService;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(UCSBAPIMenuController.class)
@Import(SecurityConfig.class)
@AutoConfigureDataJpa
public class UCSBAPIMenuControllerTest extends ControllerTestCase {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UCSBAPIMenuService menuService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void logged_out_users_cannot_access_getMeals() throws Exception {
        mockMvc.perform(get("/api/diningcommons/2024-11-20/de-la-guerra"))
            .andExpect(status().is(403)); // Expect 403 Forbidden for logged-out users
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_users_can_access_getMeals() throws Exception {
        // Arrange: Create a sample list of meals
        Meal breakfast = new Meal();
        breakfast.setName("Breakfast");
        breakfast.setCode("breakfast");

        Meal lunch = new Meal();
        lunch.setName("Lunch");
        lunch.setCode("lunch");
        
        Meal dinner = new Meal();
        dinner.setName("Dinner");
        dinner.setCode("dinner");

        List<Meal> expectedMeals = new ArrayList<>();
        expectedMeals.add(breakfast);
        expectedMeals.add(lunch);
        expectedMeals.add(dinner);

        when(menuService.getMeals("2024-11-20", "de-la-guerra")).thenReturn(expectedMeals);

        // Act
        MvcResult response = mockMvc
            .perform(get("/api/diningcommons/2024-11-20/de-la-guerra")
            .contentType("application/json"))
            .andExpect(status().isOk()) // Expect HTTP 200
            .andReturn();

        // Assert
        List<Meal> actualMeals = objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<Meal>>() {}
        );
        assertEquals(expectedMeals, actualMeals);
    }
}