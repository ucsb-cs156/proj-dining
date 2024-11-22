package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.config.SecurityConfig;
import edu.ucsb.cs156.dining.entities.UCSBAPIDiningCommons;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.UCSBAPIDiningCommonsService;
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

@WebMvcTest(UCSBAPIDiningCommonsController.class)
@Import(SecurityConfig.class)
@AutoConfigureDataJpa
public class UCSBAPIDiningCommonsControllerTest extends ControllerTestCase {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UCSBAPIDiningCommonsService diningCommonsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/diningcommons/all"))
            .andExpect(status().is(403)); // Expect 403 Forbidden for logged-out users
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_users_can_get_all() throws Exception {
        // Arrange: Create a sample list of dining commons
        UCSBAPIDiningCommons carrillo = new UCSBAPIDiningCommons(
            "Carrillo", "carrillo", false, false, true, 
            new UCSBAPIDiningCommons.Location(34.409953, -119.85277)
        );

        List<UCSBAPIDiningCommons> expectedResult = new ArrayList<>();
        expectedResult.add(carrillo);

        when(diningCommonsService.getAllDiningCommons()).thenReturn(expectedResult);

        // Act
        MvcResult response = mockMvc
            .perform(get("/api/diningcommons/all")
            .contentType("application/json"))
            .andExpect(status().isOk())  // Expect HTTP 200
            .andReturn();

        // Assert
        List<UCSBAPIDiningCommons> actualResult = objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<UCSBAPIDiningCommons>>() {}
        );
        assertEquals(expectedResult, actualResult);
    }
}
