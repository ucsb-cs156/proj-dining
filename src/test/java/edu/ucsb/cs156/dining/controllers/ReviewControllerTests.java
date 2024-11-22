package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cglib.core.Local;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.http.Request;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = ReviewController.class)
@Import(TestConfig.class)
public class ReviewControllerTests extends ControllerTestCase {

        @MockBean
        ReviewRepository reviewRepository;

        @Autowired
        private ObjectMapper mapper;

        @MockBean
        UserRepository userRepository;

        // Authorization tests for /api/request

        @Test
        public void logged_out_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void logged_in_admin_can_get_all() throws Exception {
                mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().is(200));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_cant_get_all() throws Exception {
                mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().is(403));
        }

        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/reviews/post"))
                                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void a_user_can_post_a_new_review() throws Exception {

                // Arrange
                LocalDateTime now = LocalDateTime.now();

                Review review = Review.builder()
                                .dateCreated(now)
                                .dateEdited(now)
                                .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
                                .studentId(1L)
                                .status("Awaiting Moderation")
                                .itemId("Bfast1090")
                                .id(0L)
                                .build();
                when(reviewRepository.save(eq(review))).thenReturn(review);

                // Act
                MvcResult response = mockMvc.perform(
                                post("/api/reviews/post?itemId=Bfast1090&dateItemServed=2021-12-12T08:08:08")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andReturn();

                String jsonReview = mapper.writeValueAsString(review);

                // Assert
                verify(reviewRepository).save(any(Review.class));
                JsonNode responseJson = mapper.readTree(response.getResponse().getContentAsString());
                JsonNode expectedJson = mapper.readTree(jsonReview);

                assertEquals(expectedJson.get("studentId").asInt(), responseJson.get("studentId").asInt());
                assertEquals(expectedJson.get("status").asText(), responseJson.get("status").asText());
                assertEquals(expectedJson.get("itemId").asText(), responseJson.get("itemId").asText());

                // Manually compare important date fields with a threshold for acceptable
                // variation
                checkDates(expectedJson, responseJson, "dateItemServed");
                checkDates(expectedJson, responseJson, "dateCreated");
                checkDates(expectedJson, responseJson, "dateEdited");
        }

        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void a_logged_in_admin_can_get_all() throws Exception {
                // Arrange

                LocalDateTime now = LocalDateTime.now();

                Review review1 = Review.builder()
                                .dateCreated(now)
                                .dateEdited(now)
                                .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
                                .studentId(1L)
                                .status("Awaiting Moderation")
                                .itemId("Bfast1090")
                                .id(0L)
                                .build();

                Review review2 = Review.builder()
                                .dateCreated(now.plusDays(4))
                                .dateEdited(now.plusDays(5))
                                .dateItemServed(LocalDateTime.of(2022, 7, 1, 8, 8, 8))
                                .studentId(2L)
                                .status("Awaiting Moderation")
                                .itemId("Bfast1090")
                                .id(0L)
                                .build();

                ArrayList<Review> reviews = new ArrayList<>();
                reviews.addAll(Arrays.asList(review1, review2));

                when(reviewRepository.findAll()).thenReturn(reviews);
                // Act
                MvcResult response = mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().is(200)).andReturn();

                // assert
                verify(reviewRepository, times(1)).findAll();
                String expectedJson = mapper.writeValueAsString(reviews);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }


        @WithMockUser(roles = { "USER" })
        @Test
        public void a_logged_in_user_can_get_own_reviews_list() throws Exception {
                // Arrange

                Review review1 = Review.builder()
                                .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
                                .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
                                .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3 ))
                                .studentId(1L)
                                .status("Awaiting Moderation")
                                .itemId("Bfast1090")
                                .id(1L)
                                .build();

                Review review2 = Review.builder()
                                .dateCreated(LocalDateTime.of(2024, 4, 28, 1, 47))
                                .dateEdited(LocalDateTime.of(2024, 7, 2, 6, 47))
                                .dateItemServed(LocalDateTime.of(2022, 2, 6, 8, 8))
                                .studentId(2L)
                                .status("Awaiting Moderation")
                                .itemId("Bfast1090")
                                .id(2L)
                                .build();
                
                Review review3 = Review.builder()
                                .dateCreated(LocalDateTime.of(2024, 2, 17, 2, 47))
                                .dateEdited(LocalDateTime.of(2024, 12, 15, 04, 26))
                                .dateItemServed(LocalDateTime.of(2023, 1, 7, 3, 8))
                                .studentId(2L)
                                .status("Awaiting Moderation")
                                .itemId("Bfast1090")
                                .id(3L)
                                .build();

                ArrayList<Review> reviews = new ArrayList<>();
                ArrayList<Review> valid_reviews = new ArrayList<>();
                valid_reviews.addAll(Arrays.asList(review1));
                reviews.addAll(Arrays.asList(review1, review2,review3));
                when(reviewRepository.findAllByStudentId(1)).thenReturn(valid_reviews);

                // Act
                MvcResult response = mockMvc.perform(
                                get("/api/reviews/userReviews")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andReturn();

                // assert
                verify(reviewRepository, times(1)).findAllByStudentId(1);
                String expectedJson = mapper.writeValueAsString(valid_reviews);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);

        }




        /**
         * checkDates function is needed for checking and asserting the time of the expected response and the instantiated review
         * Their is a few millisecond delay from the mocked request and the creation of the objects instance,
         * therefore, the time is off. Thus when checking against one another, we allow some tolerance.
         * @param expectedJson
         * @param responseJson
         * @param fieldName
         */
        private void checkDates(JsonNode expectedJson, JsonNode responseJson, String fieldName) {
                if (expectedJson.hasNonNull(fieldName) && responseJson.hasNonNull(fieldName)) {
                        LocalDateTime expectedDate = LocalDateTime.parse(expectedJson.get(fieldName).asText());
                        LocalDateTime actualDate = LocalDateTime.parse(responseJson.get(fieldName).asText());
                        assertTrue(Math.abs(Duration.between(expectedDate, actualDate).toMillis()) < 1000,
                                        fieldName + " times are too far apart");
                } else {
                        throw new IllegalStateException(fieldName + " should not be null");
                }
        }



}
