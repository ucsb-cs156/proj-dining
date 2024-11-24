package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.MenuItemReview;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.repositories.MenuItemReviewRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.time.LocalDateTime;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = MenuItemReviewController.class)
@Import(TestConfig.class)
public class MenuItemReviewControllerTests extends ControllerTestCase {

        @MockBean
        MenuItemReviewRepository menuItemReviewRepository;

        @MockBean
        MenuItemRepository menuItemRepository;

        @MockBean
        UserRepository userRepository;

       
        // GET

        @Test
        public void logged_out_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/menuitemreviews/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/menuitemreviews/all"))
                                .andExpect(status().is(403)); // logged in non admin users cannot get all
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void admin_can_get_all_() throws Exception {
                MenuItemReview review1 = MenuItemReview.builder()
                        .id(1L)
                        .studentUserId(100L)
                        .status("APPROVED")
                        .moderatorUserId(101L)
                        .moderatorComments("Good item")
                        .build();

                MenuItemReview review2 = MenuItemReview.builder()
                        .id(2L)
                        .studentUserId(101L)
                        .status("REJECTED")
                        .moderatorUserId(102L)
                        .moderatorComments("Needs improvement")
                        .build();

                when(menuItemReviewRepository.findAll()).thenReturn(Arrays.asList(review1, review2));

                MvcResult result = mockMvc.perform(get("/api/menuitemreviews/all"))
                        .andExpect(status().isOk())
                        .andReturn();

                String responseContent = result.getResponse().getContentAsString();
                assertTrue(responseContent.contains("\"id\":1"));
                assertTrue(responseContent.contains("\"id\":2"));
                assertTrue(responseContent.contains("\"status\":\"APPROVED\""));
                assertTrue(responseContent.contains("\"status\":\"REJECTED\""));
                assertTrue(responseContent.contains("\"moderatorComments\":\"Good item\""));
                assertTrue(responseContent.contains("\"moderatorComments\":\"Needs improvement\""));

                verify(menuItemReviewRepository, times(1)).findAll();
        }


        // POST
        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/menuitemreviews/post"))
                                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_can_post_valid_menu_item_review() throws Exception {
                MenuItem mockMenuItem = new MenuItem();
                when(menuItemRepository.findById(1L)).thenReturn(Optional.of(mockMenuItem));

                MenuItemReview mockReview = MenuItemReview.builder()
                        .id(1L)
                        .studentUserId(100L)
                        .menuItem(mockMenuItem)
                        .itemServedDate(LocalDateTime.parse("2024-11-24T09:00:00"))
                        .status("APPROVED")
                        .moderatorUserId(101L)
                        .moderatorComments("Looks good")
                        .createdDate(LocalDateTime.parse("2024-11-24T09:00:00"))
                        .lastEditedDate(LocalDateTime.parse("2024-11-24T09:30:00"))
                        .build();

                when(menuItemReviewRepository.save(any(MenuItemReview.class))).thenReturn(mockReview);

                MvcResult result = mockMvc.perform(post("/api/menuitemreviews/post")
                        .with(csrf())
                        .param("studentUserId", "100")
                        .param("itemId", "1")
                        .param("itemServedDate", "2024-11-24T09:00:00")
                        .param("status", "APPROVED")
                        .param("moderatorUserId", "101")
                        .param("moderatorComments", "Looks good")
                        .param("createdDate", "2024-11-24T09:00:00")
                        .param("lastEditedDate", "2024-11-24T09:30:00"))
                        .andExpect(status().isOk())
                        .andReturn();

                String responseContent = result.getResponse().getContentAsString();
                assertTrue(responseContent.contains("\"id\":1"));
                assertTrue(responseContent.contains("\"studentUserId\":100"));
                assertTrue(responseContent.contains("\"status\":\"APPROVED\""));
                assertTrue(responseContent.contains("\"moderatorComments\":\"Looks good\""));

                verify(menuItemRepository, times(1)).findById(1L);
                verify(menuItemReviewRepository, times(1)).save(any(MenuItemReview.class));
        }



        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_verify_setters() throws Exception {
                MenuItem mockMenuItem = new MenuItem(); 
                when(menuItemRepository.findById(1L)).thenReturn(Optional.of(mockMenuItem));

                when(menuItemReviewRepository.save(any(MenuItemReview.class))).thenAnswer(invocation -> {
                        MenuItemReview savedReview = invocation.getArgument(0);
                        assertEquals(100L, savedReview.getStudentUserId());
                        assertEquals(LocalDateTime.parse("2024-11-24T09:00:00"), savedReview.getItemServedDate());
                        assertEquals(mockMenuItem, savedReview.getMenuItem());
                        assertEquals("APPROVED", savedReview.getStatus());
                        assertEquals(101L, savedReview.getModeratorUserId());
                        assertEquals("Looks good", savedReview.getModeratorComments());
                        assertEquals(LocalDateTime.parse("2024-11-24T09:00:00"), savedReview.getCreatedDate());
                        assertEquals(LocalDateTime.parse("2024-11-24T09:30:00"), savedReview.getLastEditedDate());
                        return savedReview; 
                });

                mockMvc.perform(post("/api/menuitemreviews/post")
                        .with(csrf())
                        .param("studentUserId", "100")
                        .param("itemId", "1")
                        .param("itemServedDate", "2024-11-24T09:00:00")
                        .param("status", "APPROVED")
                        .param("moderatorUserId", "101")
                        .param("moderatorComments", "Looks good")
                        .param("createdDate", "2024-11-24T09:00:00")
                        .param("lastEditedDate", "2024-11-24T09:30:00"))
                        .andExpect(status().isOk());
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_cannot_post_if_menu_item_does_not_exist() throws Exception {
                when(menuItemRepository.findById(1L)).thenReturn(Optional.empty()); 

                mockMvc.perform(post("/api/menuitemreviews/post")
                        .with(csrf()) 
                        .param("studentUserId", "100")
                        .param("itemId", "1")
                        .param("itemServedDate", "2024-11-24T09:00:00")
                        .param("status", "APPROVED")
                        .param("moderatorUserId", "101")
                        .param("moderatorComments", "Looks good")
                        .param("createdDate", "2024-11-24T09:00:00")
                        .param("lastEditedDate", "2024-11-24T09:30:00"))
                        .andExpect(status().isNotFound());
                }
}