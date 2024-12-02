package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import edu.ucsb.cs156.dining.controllers.ReviewsController;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.Reviews;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.repositories.ReviewsRepository;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;

import java.time.LocalDateTime;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = ReviewsController.class)
@Import(TestConfig.class)
public class ReviewsControllerTests extends ControllerTestCase {

        @MockBean
        ReviewsRepository reviewsRepository;

        @MockBean
        MenuItemRepository menuItemRepository;

        @MockBean
        UserRepository userRepository;

        // Authorization tests for /api/reviews/admin/all
        @Test
        public void logged_out_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }


        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().is(403)); // logged
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void logged_in_admin_can_get_all_reviews() throws Exception {

                //arrange
                MenuItem item = MenuItem.builder()
                                .id(1L)
                                .diningCommonsCode("idk")
                                .meal("meal")
                                .name("name")
                                .station("station")
                                .build();

                when(menuItemRepository.save(eq(item))).thenReturn(item);
                Reviews review1 = Reviews.builder()
                                .item_id(1)
                                .rating(1)
                                .comments("none")
                                .date_served(LocalDateTime.of(2024, 8, 24, 11, 11, 11)) 
                                .build();

                Reviews review2 = Reviews.builder()
                                .item_id(1)
                                .rating(1)
                                .comments("not good")
                                .date_served(LocalDateTime.of(2024, 8, 24, 11, 11, 11)) 
                                .build();

                ArrayList<Reviews> expectedReviews = new ArrayList<>();
                expectedReviews.addAll(Arrays.asList(review1, review2));

                when(reviewsRepository.findAll()).thenReturn(expectedReviews);

                // act
                MvcResult response = mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().is(200)).andReturn();

                // assert

                verify(reviewsRepository, times(1)).findAll();
                String expectedJson = mapper.writeValueAsString(expectedReviews);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/reviews/post"))
                                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_regular_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/reviews/post"))
                                .andExpect(status().is(403)); // only admins can post
        }



        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_nonempty_review() throws Exception {
                // arrange
                MenuItem item = MenuItem.builder()
                                .id(1L)
                                .diningCommonsCode("idk")
                                .meal("meal")
                                .name("name")
                                .station("station")
                                .build();
                when(menuItemRepository.findById(1L)).thenReturn(Optional.of(item));

                Reviews review = Reviews.builder()
                        .item_id(1)
                        .rating(5)
                        .comments("test")
                        .status("Awaiting Moderation")
                        .userId(1)
                        .date_served(LocalDateTime.of(2024, 8, 24, 11, 11, 11)) // Use LocalDateTime
                        .build();

                when(reviewsRepository.save(eq(review))).thenReturn(review);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/reviews/post?item_id=1&rating=5&comments=test&date_served=2024-08-24T11:11:11")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(reviewsRepository, times(1)).save(review);
                String expectedJson = mapper.writeValueAsString(review);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_nonempty_review_with_rating_1() throws Exception {
                // arrange
                MenuItem item = MenuItem.builder()
                                .id(1L)
                                .diningCommonsCode("idk")
                                .meal("meal")
                                .name("name")
                                .station("station")
                                .build();
                when(menuItemRepository.findById(1L)).thenReturn(Optional.of(item));

                Reviews review = Reviews.builder()
                        .item_id(1)
                        .rating(1)
                        .comments("test")
                        .status("Awaiting Moderation")
                        .userId(1)
                        .date_served(LocalDateTime.of(2024, 8, 24, 11, 11, 11)) // Use LocalDateTime
                        .build();

                when(reviewsRepository.save(eq(review))).thenReturn(review);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/reviews/post?item_id=1&rating=1&comments=test&date_served=2024-08-24T11:11:11")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(reviewsRepository, times(1)).save(review);
                String expectedJson = mapper.writeValueAsString(review);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_not_post_with_invalid_menuItemId() throws Exception {
                mockMvc.perform(post("/api/reviews/post?item_id=1&rating=5&comments=test&date_served=2024-08-24T11:11:11").with(csrf()))
                                .andExpect(status().is(404)); 
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_not_post_with_too_high_rating() throws Exception {
                mockMvc.perform(post("/api/reviews/post?item_id=1&rating=6&comments=test&date_served=2024-08-24T11:11:11").with(csrf()))
                                .andExpect(status().is(400)); 
        }
        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_not_post_with_too_low_rating() throws Exception {
                mockMvc.perform(post("/api/reviews/post?item_id=1&rating=0&comments=test&date_served=2024-08-24T11:11:11").with(csrf()))
                                .andExpect(status().is(400));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_not_post_with_just_right_low() throws Exception {
                MenuItem item = MenuItem.builder()
                                .id(1L)
                                .diningCommonsCode("idk")
                                .meal("meal")
                                .name("name")
                                .station("station")
                                .build();
                when(menuItemRepository.findById(1L)).thenReturn(Optional.of(item));
                mockMvc.perform(post("/api/reviews/post?item_id=1&rating=1&comments=test&date_served=2024-08-24T11:11:11").with(csrf()))
                                .andExpect(status().is(200)); 
        }
        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_not_post_with_just_right_high() throws Exception {
                MenuItem item = MenuItem.builder()
                                .id(1L)
                                .diningCommonsCode("idk")
                                .meal("meal")
                                .name("name")
                                .station("station")
                                .build();
                when(menuItemRepository.findById(1L)).thenReturn(Optional.of(item));
                mockMvc.perform(post("/api/reviews/post?item_id=1&rating=5&comments=test&date_served=2024-08-24T11:11:11").with(csrf()))
                                .andExpect(status().is(200)); 
        }


  
}
        

