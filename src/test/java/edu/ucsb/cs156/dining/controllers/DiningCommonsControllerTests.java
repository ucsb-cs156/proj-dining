package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.models.DiningCommons;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.DiningCommonsService;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = DiningCommonsController.class)
@Import(TestConfig.class)
@AutoConfigureDataJpa
public class DiningCommonsControllerTests extends ControllerTestCase {

  @Autowired private MockMvc mockMvc;

  @MockBean DiningCommonsService diningCommonsService;

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
  
}