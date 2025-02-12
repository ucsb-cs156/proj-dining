package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.CurrentUserService;
import edu.ucsb.cs156.dining.testconfig.MockCurrentUserServiceImpl;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Answers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cglib.core.Local;
import org.springframework.context.annotation.Import;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;

import static org.mockito.Mockito.*;
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

@WebMvcTest(controllers = ReviewController.class)
@Import(TestConfig.class)
public class ReviewControllerTests extends ControllerTestCase {

    @MockBean
    ReviewRepository reviewRepository;

    @Autowired
    private ObjectMapper mapper;

    @MockBean
    UserRepository userRepository;

    @MockBean
    private MenuItemRepository menuItemRepository;
    @Autowired
    private CurrentUserService currentUserService;

    @MockBean
    DateTimeProvider dateTimeProvider;

    @BeforeEach
    void setup() {
        // Assume an item exists with ID 1
        when(menuItemRepository.existsById(1L)).thenReturn(true);
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(MenuItem.builder().id(1L).build()));
        when(menuItemRepository.existsById(5L)).thenReturn(false);
        when(menuItemRepository.existsById(313L)).thenReturn(true);
        when(dateTimeProvider.getNow()).thenReturn(Optional.of(LocalDateTime.of(2025,3,11,0,0,0)));
        // Assume no item exists with ID 999
        when(menuItemRepository.existsById(999L)).thenReturn(false);
    }

    // Authorization tests for /api/request

    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/reviews/all"))
                .andExpect(status().is(403)); // logged out users can't get all
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void logged_in_admin_can_get_all() throws Exception {
        mockMvc.perform(get("/api/reviews/all"))
                .andExpect(status().is(200));
    }

    @WithMockUser(roles = {"USER"})
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

    @WithMockUser(roles = {"USER"})
    @Test
    public void a_user_can_post_a_new_review() throws Exception {

        // Arrange
        LocalDateTime now = LocalDateTime.now();

        User user = currentUserService.getUser();
        MenuItem menuItem = MenuItem.builder().id(1L).build();

        Review review = Review.builder()
                .dateCreated(now)
                .dateEdited(now)
                .itemsStars(1l)
                .reviewerComments("Worst flavor ever.")
                .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
                .reviewer(user)
                .status("Awaiting Moderation")
                .item(menuItem)
                .id(0L)
                .build();
        when(reviewRepository.save(eq(review))).thenReturn(review);

        // Act
        MvcResult response = mockMvc.perform(
                        post("/api/reviews/post?itemId=1&reviewerComments=Worst flavor ever.&itemsStars=1&dateItemServed=2021-12-12T08:08:08")
                                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String jsonReview = mapper.writeValueAsString(review);

        // Assert
        verify(reviewRepository).save(any(Review.class));
        JsonNode responseJson = mapper.readTree(response.getResponse().getContentAsString());
        JsonNode expectedJson = mapper.readTree(jsonReview);

        assertEquals(expectedJson.get("itemsStars").asInt(), responseJson.get("itemsStars").asInt());
        assertEquals(expectedJson.get("status").asText(), responseJson.get("status").asText());
        assertEquals(expectedJson.get("reviewerComments").asText(),
                responseJson.get("reviewerComments").asText());
        assertEquals(expectedJson.get("reviewer").asText(),
                responseJson.get("reviewer").asText());
        assertEquals(expectedJson.get("item").asText(), responseJson.get("item").asText());

        // Manually compare important date fields with a threshold for acceptable
        // variation
        checkDates(expectedJson, responseJson, "dateItemServed");
        checkDates(expectedJson, responseJson, "dateCreated");
        checkDates(expectedJson, responseJson, "dateEdited");
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_rating_below_1_throws_exception() throws Exception {
        mockMvc.perform(
                        post("/api/reviews/post?itemId=1&reviewerComments=Worst flavor ever.&itemsStars=0&dateItemServed=2021-12-12T08:08:08")
                                .with(csrf()))
                .andDo(print()) // This helps you see the full response for debugging
                .andExpect(status().isBadRequest());
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_rating_above_5_throws_exception() throws Exception {
        mockMvc.perform(
                        post("/api/reviews/post?itemId=1&reviewerComments=Worst flavor ever.&itemsStars=6&dateItemServed=2021-12-12T08:08:08")
                                .with(csrf()))
                .andDo(print()) // This helps you see the full response for debugging
                .andExpect(status().isBadRequest());
    }

    // Test valid input at boundaries
    @WithMockUser(roles = {"USER"})
    @Test
    public void postReview_ShouldAcceptRatingAtBoundaries() throws Exception {
        // Lower boundary test
        mockMvc.perform(
                        post("/api/reviews/post?itemId=1&reviewerComments=Worst flavor ever.&itemsStars=1&dateItemServed=2021-12-12T08:08:08")
                                .with(csrf()))
                .andExpect(status().isOk());
        // Lower boundary test
        mockMvc.perform(
                        post("/api/reviews/post?itemId=1&reviewerComments=Worst flavor ever.&itemsStars=5&dateItemServed=2021-12-12T08:08:08")
                                .with(csrf()))
                .andExpect(status().isOk());
    }


    @WithMockUser(roles = {"USER"})
    @Test
    public void test_emptyString_on_creating_new_review() throws Exception {

        // Arrange
        LocalDateTime now = LocalDateTime.now();

        User user = currentUserService.getUser();
        MenuItem menuItem = MenuItem.builder().id(1L).build();

        Review review = Review.builder()
                .dateCreated(now)
                .dateEdited(now)
                .itemsStars(1l)
                .reviewerComments("   ")
                .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
                .reviewer(user)
                .status("Awaiting Moderation")
                .item(menuItem)
                .id(0L)
                .build();
        when(reviewRepository.save(eq(review))).thenReturn(review);

        // Act
        MvcResult response = mockMvc.perform(
                        post("/api/reviews/post?itemId=1&reviewerComments=   &itemsStars=1&dateItemServed=2021-12-12T08:08:08")
                                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        String jsonReview = mapper.writeValueAsString(review);

        // Assert
        verify(reviewRepository).save(any(Review.class));
        JsonNode responseJson = mapper.readTree(response.getResponse().getContentAsString());
        JsonNode expectedJson = mapper.readTree(jsonReview);

        assertTrue(responseJson.get("reviewerComments").isNull());
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void test_no_string_on_creating_new_review() throws Exception {

        // Arrange
        LocalDateTime now = LocalDateTime.now();

        User user = currentUserService.getUser();
        MenuItem menuItem = MenuItem.builder().id(1L).build();

        Review review = Review.builder()
                .dateCreated(now)
                .dateEdited(now)
                .itemsStars(1l)
                .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
                .reviewer(user)
                .status("Awaiting Moderation")
                .item(menuItem)
                .id(0L)
                .build();
        when(reviewRepository.save(eq(review))).thenReturn(review);

        // Act
        MvcResult response = mockMvc.perform(
                        post("/api/reviews/post?itemId=1&reviewerComments=&itemsStars=1&dateItemServed=2021-12-12T08:08:08")
                                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        verify(reviewRepository).save(any(Review.class));
        JsonNode responseJson = mapper.readTree(response.getResponse().getContentAsString());
        assertTrue(responseJson.get("reviewerComments").isNull());

    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void a_logged_in_admin_can_get_all() throws Exception {
        // Arrange

        LocalDateTime now = LocalDateTime.now();

        User user1 = currentUserService.getUser();
        User user2 = User.builder().id(2L).build();
        MenuItem menuItem1 = MenuItem.builder().id(1L).build();
        MenuItem menuItem2 = MenuItem.builder().id(313L).build();

        Review review1 = Review.builder()
                .dateCreated(now)
                .dateEdited(now)
                .itemsStars(3l)
                .reviewerComments("Im tired of this same chicken")
                .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
                .reviewer(user1)
                .status("Awaiting Moderation")
                .item(menuItem1)
                .id(0L)
                .build();

        Review review2 = Review.builder()
                .dateCreated(now.plusDays(4))
                .dateEdited(now.plusDays(5))
                .itemsStars(5l)
                .reviewerComments("MMMMM I LOVE CHICKEN")
                .dateItemServed(LocalDateTime.of(2022, 7, 1, 8, 8, 8))
                .reviewer(user2)
                .status("Awaiting Moderation")
                .item(menuItem2)
                .id(0L)
                .build();

        Review review3 = Review.builder()
                .dateCreated(now)
                .dateEdited(now)
                .itemsStars(6l)
                .reviewerComments("Im tired of this same chicken")
                .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
                .reviewer(user1)
                .status("Awaiting Moderation")
                .item(menuItem2)
                .id(0L)
                .build();

        ArrayList<Review> reviews = new ArrayList<>();
        reviews.addAll(Arrays.asList(review1, review2, review3));

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


    @WithMockUser(roles = {"USER"})
    @Test
    public void a_logged_in_user_can_get_own_reviews_list() throws Exception {
        // Arrange
        User user1 = currentUserService.getUser();
        User user2 = User.builder().id(2L).build();
        CurrentUser currentUser = CurrentUser.builder().user(user1).build();

        MenuItem menuItem1 = MenuItem.builder().id(1L).build();
        MenuItem menuItem2 = MenuItem.builder().id(313L).build();

        Review review1 = Review.builder()
                .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
                .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
                .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
                .reviewer(user1)
                .status("Awaiting Moderation")
                .item(menuItem1)
                .id(1L)
                .build();

        Review review2 = Review.builder()
                .dateCreated(LocalDateTime.of(2024, 4, 28, 1, 47))
                .dateEdited(LocalDateTime.of(2024, 7, 2, 6, 47))
                .dateItemServed(LocalDateTime.of(2022, 2, 6, 8, 8))
                .reviewer(user2)
                .status("Awaiting Moderation")
                .item(menuItem1)
                .id(2L)
                .build();

        Review review3 = Review.builder()
                .dateCreated(LocalDateTime.of(2024, 2, 17, 2, 47))
                .dateEdited(LocalDateTime.of(2024, 12, 15, 04, 26))
                .dateItemServed(LocalDateTime.of(2023, 1, 7, 3, 8))
                .reviewer(user2)
                .status("Awaiting Moderation")
                .item(menuItem2)
                .id(3L)
                .build();

        ArrayList<Review> reviews = new ArrayList<>();
        ArrayList<Review> valid_reviews = new ArrayList<>();
        valid_reviews.addAll(Arrays.asList(review1));
        reviews.addAll(Arrays.asList(review1, review2, review3));
        when(reviewRepository.findByReviewer(eq(user1))).thenReturn(valid_reviews);

        // Act
        MvcResult response = mockMvc.perform(
                        get("/api/reviews/userReviews")
                                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        verify(reviewRepository, times(1)).findByReviewer(eq(user1));
        String expectedJson = mapper.writeValueAsString(valid_reviews);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);

    }


    @WithMockUser(roles = {"USER"})
    @Test
    public void testItemIdIsInvalid_NotFound() throws Exception {

        // Act: Perform the request and expect the review creation to fail due to non-existing itemId
        mockMvc.perform(post("/api/reviews/post")
                        .param("itemId", "5")  // This itemId does not exist
                        .param("reviewerComments", "")
                        .param("itemsStars", "1")
                        .param("dateItemServed", "2021-12-12T08:08:08")
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof EntityNotFoundException))
                .andExpect(result -> assertEquals("MenuItem with id 5 not found", result.getResolvedException().getMessage()));

        // Assert: Ensure no reviews are saved due to invalid itemId
        verify(reviewRepository, times(0)).save(any(Review.class));
    }

    /**
     * checkDates function is needed for checking and asserting the time of the
     * expected response and the instantiated review
     * There is a few millisecond delay from the mocked request and the creation of
     * the objects instance,
     * therefore, the time is off. Thus when checking against one another, we allow
     * some tolerance.
     *
     * @param expectedJson JSON you're expecting to see
     * @param responseJson JSON you actually received
     * @param fieldName    field in the JSON
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
