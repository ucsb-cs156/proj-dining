package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.models.DiningCommons;
import edu.ucsb.cs156.dining.services.DiningCommonsService;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
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
public class DiningCommonsControllerTests extends ControllerTestCase {

  @Autowired private MockMvc mockMvc;

  @MockBean DiningCommonsService diningCommonsService;

  @Autowired private ObjectMapper objectMapper;

  @Test
  public void api_DiningCommons_all__logged_out__returns_200() throws Exception {
    mockMvc.perform(get("/api/dining/all")).andExpect(status().isOk());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void api_DiningCommons_all__user_logged_in__returns_200() throws Exception {
    mockMvc.perform(get("/api/dining/all")).andExpect(status().isOk());
  }

  @WithMockUser(roles = {"USER", "ADMIN"})
  @Test
  public void api_DiningCommons_all__admin_logged_in__returns_200() throws Exception {
    mockMvc.perform(get("/api/dining/all")).andExpect(status().isOk());
  }

  @Test
  public void api_DiningCommons_test_get() throws Exception {

    DiningCommons carrillo =
        objectMapper.readValue(DiningCommons.SAMPLE_CARRILLO, DiningCommons.class);

    List<DiningCommons> expectedResult = new ArrayList<DiningCommons>();
    expectedResult.add(carrillo);

    String url = "/api/dining/all";

    when(diningCommonsService.get()).thenReturn(expectedResult);

    MvcResult response =
        mockMvc
            .perform(get(url).contentType("application/json"))
            .andExpect(status().isOk())
            .andReturn();

    assertEquals(
        expectedResult,
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<DiningCommons>>() {}));
  }
}
