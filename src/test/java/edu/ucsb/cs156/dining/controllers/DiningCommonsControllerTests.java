package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.services.DiningCommonsService;
import edu.ucsb.cs156.dining.models.DiningCommon;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import edu.ucsb.cs156.dining.ControllerTestCase;

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

@WebMvcTest(controllers = DiningCommonsController.class)
@Import(TestConfig.class)
@AutoConfigureDataJpa
public class DiningCommonsControllerTests extends ControllerTestCase{

    @Autowired private MockMvc mockMvc;

    @MockBean private DiningCommonsService diningCommonsService;

    @Autowired private ObjectMapper objectMapper;

    @Test
    public void test_getAllDiningCommons() throws Exception {
        // Mock data
        DiningCommon carrillo = DiningCommon.builder()
            .name("Carrillo")
            .code("carrillo")
            .hasSackMeal(false)
            .hasTakeOutMeal(false)
            .hasDiningCam(true)
            .build();

        List<DiningCommon> expectedResult = new ArrayList<>();
        expectedResult.add(carrillo);

        String url = "/api/public/diningcommons/all";

        // Mock the service
        when(diningCommonsService.getAllDiningCommons()).thenReturn(expectedResult);

        // Perform the test
        MvcResult response =
            mockMvc
                .perform(get(url).contentType("application/json"))
                .andExpect(status().isOk())
                .andReturn();

        // Deserialize and assert
        List<DiningCommon> actualResult = objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<DiningCommon>>() {});
        assertEquals(expectedResult, actualResult);
    }
}