package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.controllers.AdminsController.AdminDTO;
import edu.ucsb.cs156.dining.entities.Admin;
import edu.ucsb.cs156.dining.repositories.AdminRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = AdminsController.class)
@Import(TestConfig.class)
@TestPropertySource(properties = {"app.admin.emails=phtcon@ucsb.edu"})
public class AdminsControllerTests extends ControllerTestCase {

  @MockBean AdminRepository adminRepository;

  @Test
  public void logged_out_users_cannot_get_all_admins() throws Exception {
    mockMvc.perform(get("/api/admin/all")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_get_all_admins() throws Exception {
    mockMvc.perform(get("/api/admin/all")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admin_users_can_get_all_admins() throws Exception {
    // arrange
    Admin admin1 = Admin.builder().email("admin1@ucsb.edu").build();
    Admin admin2 = Admin.builder().email("admin2@ucsb.edu").build();

    ArrayList<Admin> expectedAdmins = new ArrayList<>();
    expectedAdmins.addAll(Arrays.asList(admin1, admin2));

    when(adminRepository.findAll()).thenReturn(expectedAdmins);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/admin/all")).andExpect(status().isOk()).andReturn();

    // assert
    verify(adminRepository, times(1)).findAll();
    String responseString = response.getResponse().getContentAsString();

    // Parse the response to check DTOs
    List<AdminDTO> adminDTOs = Arrays.asList(mapper.readValue(responseString, AdminDTO[].class));
    assertEquals(2, adminDTOs.size());
    assertEquals("admin1@ucsb.edu", adminDTOs.get(0).email());
    assertEquals("admin2@ucsb.edu", adminDTOs.get(1).email());
  }

  @Test
  public void logged_out_users_cannot_post_admins() throws Exception {
    mockMvc.perform(post("/api/admin/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post_admins() throws Exception {
    mockMvc.perform(post("/api/admin/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void an_admin_user_can_post_a_new_admin() throws Exception {
    // arrange
    Admin admin1 = Admin.builder().email("admin1@ucsb.edu").build();

    when(adminRepository.save(any(Admin.class))).thenReturn(admin1);

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/admin/post?email=Admin1@UCSB.EDU").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(adminRepository, times(1)).save(admin1);
    String expectedJson = mapper.writeValueAsString(admin1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_delete_admins() throws Exception {
    mockMvc.perform(delete("/api/admin/delete")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_delete_admins() throws Exception {
    mockMvc.perform(delete("/api/admin/delete")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_delete_an_admin() throws Exception {
    // arrange
    Admin admin1 = Admin.builder().email("admin1@ucsb.edu").build();
    when(adminRepository.findByEmail("admin1@ucsb.edu")).thenReturn(Optional.of(admin1));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/delete?email=admin1@ucsb.edu").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(adminRepository, times(1)).findByEmail("admin1@ucsb.edu");
    verify(adminRepository, times(1)).delete(admin1);
    Map<String, Object> json = responseToJson(response);
    assertEquals("Admin with id admin1@ucsb.edu deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_tries_to_delete_non_existent_admin_and_gets_right_error_message()
      throws Exception {
    // arrange
    when(adminRepository.findByEmail("nonexistent@ucsb.edu")).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/delete?email=nonexistent@ucsb.edu").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(adminRepository, times(1)).findByEmail("nonexistent@ucsb.edu");
    Map<String, Object> json = responseToJson(response);
    assertEquals("Admin with id nonexistent@ucsb.edu not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_cannot_delete_admin_from_admin_emails_list() throws Exception {
    // arrange
    Admin admin1 = Admin.builder().email("phtcon@ucsb.edu").build();
    when(adminRepository.findByEmail("phtcon@ucsb.edu")).thenReturn(Optional.of(admin1));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/admin/delete?email=phtcon@ucsb.edu").with(csrf()))
            .andExpect(status().is(403))
            .andReturn();

    // assert
    verify(adminRepository, times(1)).findByEmail("phtcon@ucsb.edu");
    verify(adminRepository, times(0)).delete(admin1);
    Map<String, Object> json = responseToJson(response);
    assertEquals("Forbidden to delete an admin from ADMIN_EMAILS list", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_dto_correctly_identifies_admin_emails() throws Exception {
    // arrange
    Admin admin1 = Admin.builder().email("phtcon@ucsb.edu").build();
    Admin admin2 = Admin.builder().email("other@ucsb.edu").build();

    List<String> adminEmails = Arrays.asList("phtcon@ucsb.edu");

    // Create DTOs
    AdminDTO dto1 = new AdminDTO(admin1, adminEmails);
    AdminDTO dto2 = new AdminDTO(admin2, adminEmails);

    // assert
    assertEquals(true, dto1.isInAdminEmails());
    assertEquals(false, dto2.isInAdminEmails());
  }
}
