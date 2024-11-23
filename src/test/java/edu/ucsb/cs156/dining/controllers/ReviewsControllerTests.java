package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;

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
import java.time.temporal.ChronoUnit;
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
        ReviewRepository reviewsRepository;

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
                                .andExpect(status().is(403)); // logged in users can't get all
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void an_admin_user_can_get_all() throws Exception {
                mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().is(200)); // admin users can get all
        }

        // Authorization tests for /api/reviews/post

        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/reviews/post"))
                                .andExpect(status().is(403));
        }

        // Authorization tests for /api/reviews?userId=x
        @Test
        public void logged_out_users_cannot_get_reviews_by_user_id() throws Exception {
                mockMvc.perform(get("/api/reviews?userId=1"))
                                .andExpect(status().is(403)); 
        }

        // Authorization tests for /api/reviews/needsmoderation
        @Test
        public void logged_out_users_cannot_get_reviews_needing_moderation() throws Exception {
                mockMvc.perform(get("/api/reviews/needsmoderation"))
                                .andExpect(status().is(403)); 
        }

        @Test
        public void logged_in_users_cannot_get_reviews_needing_moderation() throws Exception {
                mockMvc.perform(get("/api/reviews/needsmoderation"))
                                .andExpect(status().is(403)); 
        }


        // // Tests with mocks for database actions

        @WithMockUser(roles = { "USER", "ADMIN" })
        @Test
        public void admin_user_can_get_all_reviews() throws Exception {

                // arrange
                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

                Review reviews1 = Review.builder()
                                .reviewerId(1)
                                .itemId(1)
                                .dateServed(ldt1)
                                .stars(5)
                                .reviewText("very good")
                                .status("Awaiting Moderation")
                                .createdDate(ldt1)
                                .lastEditedDate(ldt1)
                                .build();

                LocalDateTime ldt2 = LocalDateTime.parse("2022-03-11T00:00:00");

                Review reviews2 = Review.builder()
                                .reviewerId(3)
                                .itemId(3)
                                .dateServed(ldt2)
                                .stars(1)
                                .reviewText("very bad")
                                .status("Rejected")
                                .modId(2L)
                                .modComments("inaccurate")
                                .createdDate(ldt2)
                                .lastEditedDate(ldt2)
                                .build();

                ArrayList<Review> expectedReviews = new ArrayList<>();
                expectedReviews.addAll(Arrays.asList(reviews1, reviews2));

                when(reviewsRepository.findAll()).thenReturn(expectedReviews);

                // act
                MvcResult response = mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(reviewsRepository, times(1)).findAll();
                String expectedJson = mapper.writeValueAsString(expectedReviews);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_can_post_a_new_review() throws Exception {
                // arrange

                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
                LocalDateTime cdt = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);

                Review reviews1 = Review.builder()
                                .reviewerId(1)
                                .itemId(1)
                                .dateServed(ldt1)
                                .stars(5)
                                .reviewText("very good")
                                .status("Awaiting Moderation")
                                .createdDate(cdt)
                                .lastEditedDate(cdt)
                                .build();

                when(reviewsRepository.save(eq(reviews1))).thenReturn(reviews1);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/reviews/post?reviewerId=1&itemId=1&dateServed=2022-01-03T00:00:00&stars=5&reviewText=very good")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(reviewsRepository, times(1)).save(reviews1);
                String expectedJson = mapper.writeValueAsString(reviews1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER", "ADMIN" })
        @Test
        public void an_admin_user_can_post_a_new_review() throws Exception {
                // arrange

                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");
                LocalDateTime cdt = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);

                Review reviews1 = Review.builder()
                                .reviewerId(1)
                                .itemId(1)
                                .dateServed(ldt1)
                                .stars(5)
                                .reviewText("very good")
                                .status("Awaiting Moderation")
                                .createdDate(cdt)
                                .lastEditedDate(cdt)
                                .build();

                when(reviewsRepository.save(eq(reviews1))).thenReturn(reviews1);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/reviews/post?reviewerId=1&itemId=1&dateServed=2022-01-03T00:00:00&stars=5&reviewText=very good")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(reviewsRepository, times(1)).save(reviews1);
                String expectedJson = mapper.writeValueAsString(reviews1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_can_get_reviews_by_user_id() throws Exception {

                // arrange
                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

                Review reviews1 = Review.builder()
                                .reviewerId(1)
                                .itemId(1)
                                .dateServed(ldt1)
                                .stars(5)
                                .reviewText("very good")
                                .status("Awaiting Moderation")
                                .createdDate(ldt1)
                                .lastEditedDate(ldt1)
                                .build();

                ArrayList<Review> expectedReviews = new ArrayList<>();
                expectedReviews.add(reviews1);

                when(reviewsRepository.findAllByReviewerId(1)).thenReturn(expectedReviews);

                // act
                MvcResult response = mockMvc.perform(get("/api/reviews?userId=1"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(reviewsRepository, times(1)).findAllByReviewerId(1);
                String expectedJson = mapper.writeValueAsString(expectedReviews);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        
        @WithMockUser(roles = { "USER", "ADMIN" })
        @Test
        public void an_admin_user_can_get_reviews_needing_moderation() throws Exception {

                // arrange
                LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

                Review reviews1 = Review.builder()
                                .reviewerId(1)
                                .itemId(1)
                                .dateServed(ldt1)
                                .stars(5)
                                .reviewText("very good")
                                .status("Awaiting Moderation")
                                .createdDate(ldt1)
                                .lastEditedDate(ldt1)
                                .build();

                ArrayList<Review> expectedReviews = new ArrayList<>();
                expectedReviews.add(reviews1);

                when(reviewsRepository.findAllByStatus("Awaiting Moderation")).thenReturn(expectedReviews);

                // act
                MvcResult response = mockMvc.perform(get("/api/reviews/needsmoderation"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(reviewsRepository, times(1)).findAllByStatus("Awaiting Moderation");
                String expectedJson = mapper.writeValueAsString(expectedReviews);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

}
