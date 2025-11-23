package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.models.EditedReview;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.CurrentUserService;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = ReviewController.class)
@Import(TestConfig.class)
public class ReviewControllerTests extends ControllerTestCase {

  @MockBean ReviewRepository reviewRepository;

  @Autowired private ObjectMapper mapper;

  @MockBean UserRepository userRepository;

  @MockBean private MenuItemRepository menuItemRepository;

  @Autowired private CurrentUserService currentUserService;

  @BeforeEach
  void setup() {
    // Assume an item exists with ID 1
    when(menuItemRepository.existsById(1L)).thenReturn(true);
    when(menuItemRepository.findById(1L))
        .thenReturn(Optional.of(MenuItem.builder().id(1L).build()));
    when(menuItemRepository.existsById(5L)).thenReturn(false);
    when(menuItemRepository.existsById(313L)).thenReturn(true);
    // Assume no item exists with ID 999
    when(menuItemRepository.existsById(999L)).thenReturn(false);
  }

  // Authorization tests for /api/request

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc
        .perform(get("/api/reviews/all"))
        .andExpect(status().is(403)); // logged out users can't get all
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void logged_in_admin_can_get_all() throws Exception {
    mockMvc.perform(get("/api/reviews/all")).andExpect(status().is(200));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_cant_get_all() throws Exception {
    mockMvc.perform(get("/api/reviews/all")).andExpect(status().is(403));
  }

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/reviews/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void a_user_can_post_a_new_review() throws Exception {

    // Arrange
    LocalDateTime now = LocalDateTime.now();

    User user = currentUserService.getUser();
    MenuItem menuItem = MenuItem.builder().id(1L).build();

    Review review =
        Review.builder()
            .itemsStars(1l)
            .reviewerComments("Worst flavor ever.")
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
            .reviewer(user)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem)
            .build();

    Review reviewReturn =
        Review.builder()
            .dateCreated(now)
            .dateEdited(now)
            .itemsStars(1l)
            .reviewerComments("Worst flavor ever.")
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
            .reviewer(user)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem)
            .id(0L)
            .build();
    when(reviewRepository.save(eq(review))).thenReturn(reviewReturn);

    // Act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/reviews/post?itemId=1&reviewerComments=Worst flavor ever.&itemsStars=1&dateItemServed=2021-12-12T08:08:08")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String jsonReview = mapper.writeValueAsString(reviewReturn);

    // Assert
    verify(reviewRepository).save(any(Review.class));
    String responseJson = response.getResponse().getContentAsString();

    assertEquals(responseJson, jsonReview);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_rating_below_1_throws_exception() throws Exception {
    mockMvc
        .perform(
            post("/api/reviews/post?itemId=1&reviewerComments=Worst flavor ever.&itemsStars=0&dateItemServed=2021-12-12T08:08:08")
                .with(csrf()))
        .andDo(print()) // This helps you see the full response for debugging
        .andExpect(status().isBadRequest());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_rating_above_5_throws_exception() throws Exception {
    mockMvc
        .perform(
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
    mockMvc
        .perform(
            post("/api/reviews/post?itemId=1&reviewerComments=Worst flavor ever.&itemsStars=1&dateItemServed=2021-12-12T08:08:08")
                .with(csrf()))
        .andExpect(status().isOk());
    // Lower boundary test
    mockMvc
        .perform(
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

    Review review =
        Review.builder()
            .itemsStars(1l)
            .reviewerComments(null)
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
            .reviewer(user)
            .status(ModerationStatus.APPROVED)
            .item(menuItem)
            .build();

    Review reviewReturn =
        Review.builder()
            .dateCreated(now)
            .dateEdited(now)
            .itemsStars(1l)
            .reviewerComments(null)
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
            .reviewer(user)
            .status(ModerationStatus.APPROVED)
            .item(menuItem)
            .id(0L)
            .build();
    when(reviewRepository.save(eq(review))).thenReturn(reviewReturn);

    // Act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/reviews/post?itemId=1&reviewerComments=&itemsStars=1&dateItemServed=2021-12-12T08:08:08")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String jsonReview = mapper.writeValueAsString(reviewReturn);

    // Assert
    verify(reviewRepository).save(any(Review.class));
    String responseJson = response.getResponse().getContentAsString();

    assertEquals(jsonReview, responseJson);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_no_string_on_creating_new_review() throws Exception {

    // Arrange
    LocalDateTime now = LocalDateTime.now();

    User user = currentUserService.getUser();
    MenuItem menuItem = MenuItem.builder().id(1L).build();

    Review review =
        Review.builder()
            .itemsStars(1l)
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
            .reviewer(user)
            .status(ModerationStatus.APPROVED)
            .item(menuItem)
            .build();

    Review reviewReturn =
        Review.builder()
            .dateCreated(now)
            .dateEdited(now)
            .itemsStars(1l)
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
            .reviewer(user)
            .status(ModerationStatus.APPROVED)
            .item(menuItem)
            .id(0L)
            .build();
    when(reviewRepository.save(eq(review))).thenReturn(reviewReturn);

    // Act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/reviews/post?itemId=1&itemsStars=1&dateItemServed=2021-12-12T08:08:08")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // Assert
    verify(reviewRepository).save(any(Review.class));
    String responseJson = response.getResponse().getContentAsString();
    String reviewJson = mapper.writeValueAsString(reviewReturn);
    assertEquals(responseJson, reviewJson);
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

    Review review1 =
        Review.builder()
            .dateCreated(now)
            .dateEdited(now)
            .itemsStars(3l)
            .reviewerComments("Im tired of this same chicken")
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(0L)
            .build();

    Review review2 =
        Review.builder()
            .dateCreated(now.plusDays(4))
            .dateEdited(now.plusDays(5))
            .itemsStars(5l)
            .reviewerComments("MMMMM I LOVE CHICKEN")
            .dateItemServed(LocalDateTime.of(2022, 7, 1, 8, 8, 8))
            .reviewer(user2)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem2)
            .id(0L)
            .build();

    Review review3 =
        Review.builder()
            .dateCreated(now)
            .dateEdited(now)
            .itemsStars(6l)
            .reviewerComments("Im tired of this same chicken")
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 8, 8, 8))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem2)
            .id(0L)
            .build();

    ArrayList<Review> reviews = new ArrayList<>();
    reviews.addAll(Arrays.asList(review1, review2, review3));

    when(reviewRepository.findAll()).thenReturn(reviews);
    // Act
    MvcResult response =
        mockMvc.perform(get("/api/reviews/all")).andExpect(status().is(200)).andReturn();

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

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();
    MenuItem menuItem2 = MenuItem.builder().id(313L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    Review review2 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 4, 28, 1, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 6, 47))
            .dateItemServed(LocalDateTime.of(2022, 2, 6, 8, 8))
            .reviewer(user2)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(2L)
            .build();

    Review review3 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 2, 17, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 12, 15, 04, 26))
            .dateItemServed(LocalDateTime.of(2023, 1, 7, 3, 8))
            .reviewer(user2)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem2)
            .id(3L)
            .build();

    ArrayList<Review> reviews = new ArrayList<>();
    ArrayList<Review> valid_reviews = new ArrayList<>();
    valid_reviews.addAll(Arrays.asList(review1));
    reviews.addAll(Arrays.asList(review1, review2, review3));
    when(reviewRepository.findByReviewer(eq(user1))).thenReturn(valid_reviews);

    // Act
    MvcResult response =
        mockMvc
            .perform(get("/api/reviews/userReviews").with(csrf()))
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

    // Act: Perform the request and expect the review creation to fail due to
    // non-existing itemId
    mockMvc
        .perform(
            post("/api/reviews/post")
                .param("itemId", "5") // This itemId does not exist
                .param("reviewerComments", "")
                .param("itemsStars", "1")
                .param("dateItemServed", "2021-12-12T08:08:08")
                .with(csrf()))
        .andExpect(status().isNotFound())
        .andExpect(
            result -> assertTrue(result.getResolvedException() instanceof EntityNotFoundException))
        .andExpect(
            result ->
                assertEquals(
                    "MenuItem with id 5 not found", result.getResolvedException().getMessage()));

    // Assert: Ensure no reviews are saved due to invalid itemId
    verify(reviewRepository, times(0)).save(any(Review.class));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void wrong_user_cannot_edit() throws Exception {
    User user2 = User.builder().id(2L).build();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user2)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    EditedReview reviewEdit =
        EditedReview.builder()
            .reviewerComments("test")
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .itemStars(2L)
            .build();

    String requestBody = mapper.writeValueAsString(reviewEdit);

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));

    MvcResult response =
        mockMvc
            .perform(
                put("/api/reviews/reviewer")
                    .param("id", "1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isForbidden())
            .andReturn();
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void cannot_set_stars_over_boundaries() throws Exception {
    User user1 = currentUserService.getUser();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    EditedReview reviewTooLow =
        EditedReview.builder()
            .reviewerComments("test")
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .itemStars(0L)
            .build();

    EditedReview reviewTooHigh =
        EditedReview.builder()
            .reviewerComments("test")
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .itemStars(6L)
            .build();

    String requestBodyTooLow = mapper.writeValueAsString(reviewTooLow);
    String requestBodyTooHigh = mapper.writeValueAsString(reviewTooHigh);

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));

    mockMvc
        .perform(
            put("/api/reviews/reviewer")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBodyTooLow)
                .with(csrf()))
        .andExpect(status().isBadRequest())
        .andReturn();
    mockMvc
        .perform(
            put("/api/reviews/reviewer")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBodyTooHigh)
                .with(csrf()))
        .andExpect(status().isBadRequest())
        .andReturn();
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void can_set_stars_at_low_boundary() throws Exception {
    User user1 = currentUserService.getUser();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    EditedReview review =
        EditedReview.builder()
            .reviewerComments("test")
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .itemStars(1L)
            .build();

    String requestBody = mapper.writeValueAsString(review);

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));

    mockMvc
        .perform(
            put("/api/reviews/reviewer")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void can_set_stars_at_high_boundary() throws Exception {
    User user1 = currentUserService.getUser();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    EditedReview review =
        EditedReview.builder()
            .reviewerComments("test")
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .itemStars(5L)
            .build();

    String requestBody = mapper.writeValueAsString(review);

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));

    mockMvc
        .perform(
            put("/api/reviews/reviewer")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .characterEncoding("utf-8")
                .content(requestBody)
                .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void trim_works_correctly() throws Exception {
    User user1 = currentUserService.getUser();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    EditedReview reviewEdit =
        EditedReview.builder()
            .reviewerComments("   ")
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .itemStars(2L)
            .build();

    Review reviewResponse =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .reviewer(user1)
            .reviewerComments(null)
            .itemsStars(2L)
            .status(ModerationStatus.APPROVED)
            .item(menuItem1)
            .id(1L)
            .build();

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));
    when(reviewRepository.save(eq(reviewResponse))).thenReturn(reviewResponse);

    String requestBody = mapper.writeValueAsString(reviewEdit);

    MvcResult response =
        mockMvc
            .perform(
                put("/api/reviews/reviewer")
                    .param("id", "1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String reviewJson = mapper.writeValueAsString(reviewResponse);
    String responseJson = response.getResponse().getContentAsString();
    verify(reviewRepository, times(1)).findById(eq(1L));
    verify(reviewRepository, times(1)).save(eq(reviewResponse));
    assertEquals(responseJson, reviewJson);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void null_works_correctly() throws Exception {
    User user1 = currentUserService.getUser();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .reviewerComments("there is a comment here.")
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    EditedReview reviewEdit =
        EditedReview.builder()
            .reviewerComments(null)
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .itemStars(2L)
            .build();

    Review reviewResponse =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .reviewer(user1)
            .reviewerComments(null)
            .itemsStars(2L)
            .status(ModerationStatus.APPROVED)
            .item(menuItem1)
            .id(1L)
            .build();

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));
    when(reviewRepository.save(eq(reviewResponse))).thenReturn(reviewResponse);

    String requestBody = mapper.writeValueAsString(reviewEdit);

    MvcResult response =
        mockMvc
            .perform(
                put("/api/reviews/reviewer")
                    .param("id", "1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String reviewJson = mapper.writeValueAsString(reviewResponse);
    String responseJson = response.getResponse().getContentAsString();
    verify(reviewRepository, times(1)).findById(eq(1L));
    verify(reviewRepository, times(1)).save(eq(reviewResponse));
    assertEquals(responseJson, reviewJson);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void edit_works_correctly() throws Exception {
    User user1 = currentUserService.getUser();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.REJECTED)
            .moderatorComments("unacceptable")
            .item(menuItem1)
            .itemsStars(3L)
            .id(1L)
            .build();

    EditedReview reviewEdit =
        EditedReview.builder()
            .reviewerComments("test")
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .itemStars(2L)
            .build();

    Review reviewResponse =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .reviewer(user1)
            .reviewerComments("test")
            .itemsStars(2L)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));
    when(reviewRepository.save(eq(reviewResponse))).thenReturn(reviewResponse);

    String requestBody = mapper.writeValueAsString(reviewEdit);

    MvcResult response =
        mockMvc
            .perform(
                put("/api/reviews/reviewer")
                    .param("id", "1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String reviewJson = mapper.writeValueAsString(reviewResponse);
    String responseJson = response.getResponse().getContentAsString();
    verify(reviewRepository, times(1)).findById(eq(1L));
    verify(reviewRepository, times(1)).save(eq(reviewResponse));
    assertEquals(responseJson, reviewJson);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void not_found_throws_exception() throws Exception {
    EditedReview reviewEdit =
        EditedReview.builder()
            .reviewerComments("test")
            .dateItemServed(LocalDateTime.of(2022, 1, 1, 0, 0))
            .itemStars(2L)
            .build();

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.empty());

    String requestBody = mapper.writeValueAsString(reviewEdit);

    MvcResult response =
        mockMvc
            .perform(
                put("/api/reviews/reviewer")
                    .param("id", "1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(reviewRepository, times(1)).findById(eq(1L));
    Map<String, Object> json = responseToJson(response);
    assertEquals("Review with id 1 not found", json.get("message"));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void wrong_user_cannot_delete() throws Exception {
    User user2 = User.builder().id(2L).build();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user2)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));

    MvcResult response =
        mockMvc
            .perform(delete("/api/reviews/reviewer").param("id", "1").with(csrf()))
            .andExpect(status().isForbidden())
            .andReturn();

    verify(reviewRepository, times(0)).delete(eq(review1));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete() throws Exception {
    User user2 = User.builder().id(2L).build();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user2)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));

    MvcResult response =
        mockMvc
            .perform(delete("/api/reviews/reviewer").param("id", "1").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(reviewRepository, times(1)).delete(eq(review1));
    Map<String, Object> json = responseToJson(response);
    assertEquals("Review with id 1 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void user_can_delete() throws Exception {
    User user1 = currentUserService.getUser();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));

    MvcResult response =
        mockMvc
            .perform(delete("/api/reviews/reviewer").param("id", "1").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(reviewRepository, times(1)).delete(eq(review1));
    Map<String, Object> json = responseToJson(response);
    assertEquals("Review with id 1 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void nonexistent_cannot_delete() throws Exception {
    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(delete("/api/reviews/reviewer").param("id", "1").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    Map<String, Object> json = responseToJson(response);
    assertEquals("Review with id 1 not found", json.get("message"));
  }

  @WithMockUser(roles = {"MODERATOR"})
  @Test
  public void moderator_can_moderate_a_review() throws Exception {
    User user1 = User.builder().id(2L).build();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    Review approved =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.APPROVED)
            .moderatorComments("acceptable")
            .item(menuItem1)
            .id(1L)
            .build();

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));
    when(reviewRepository.save(eq(approved))).thenReturn(approved);

    MvcResult response =
        mockMvc
            .perform(
                put("/api/reviews/moderate")
                    .param("id", "1")
                    .param("status", "APPROVED")
                    .param("moderatorComments", "acceptable")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String jsonExpected = mapper.writeValueAsString(approved);
    String jsonResponse = response.getResponse().getContentAsString();
    verify(reviewRepository, times(1)).findById(eq(1L));
    verify(reviewRepository, times(1)).save(eq(approved));
    assertEquals(jsonExpected, jsonResponse);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_moderate_a_review() throws Exception {
    User user1 = User.builder().id(2L).build();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    Review approved =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.APPROVED)
            .moderatorComments("acceptable")
            .item(menuItem1)
            .id(1L)
            .build();

    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.of(review1));
    when(reviewRepository.save(eq(approved))).thenReturn(approved);

    MvcResult response =
        mockMvc
            .perform(
                put("/api/reviews/moderate")
                    .param("id", "1")
                    .param("status", "APPROVED")
                    .param("moderatorComments", "acceptable")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String jsonExpected = mapper.writeValueAsString(approved);
    String jsonResponse = response.getResponse().getContentAsString();
    verify(reviewRepository, times(1)).findById(eq(1L));
    verify(reviewRepository, times(1)).save(eq(approved));
    assertEquals(jsonExpected, jsonResponse);
  }

  @WithMockUser(roles = {"MODERATOR"})
  @Test
  public void moderator_nonexistent_cannot_approve() throws Exception {
    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(
                put("/api/reviews/moderate")
                    .param("id", "1")
                    .param("status", "APPROVED")
                    .param("moderatorComments", "acceptable")
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    Map<String, Object> json = responseToJson(response);
    assertEquals("Review with id 1 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_nonexistent_cannot_approve() throws Exception {
    when(reviewRepository.findById(eq(1L))).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(
                put("/api/reviews/moderate")
                    .param("id", "1")
                    .param("status", "APPROVED")
                    .param("moderatorComments", "acceptable")
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    Map<String, Object> json = responseToJson(response);
    assertEquals("Review with id 1 not found", json.get("message"));
  }

  @WithMockUser(roles = {"MODERATOR"})
  @Test
  public void moderator_get_needs_moderation_returns_moderation_needed() throws Exception {
    User user1 = User.builder().id(2L).build();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    Review review2 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(2L)
            .build();

    ArrayList<Review> returnableReviews = new ArrayList<>(Arrays.asList(review1, review2));

    when(reviewRepository.findByStatus(eq(ModerationStatus.AWAITING_REVIEW)))
        .thenReturn(returnableReviews);

    MvcResult response =
        mockMvc
            .perform(get("/api/reviews/needsmoderation").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String expectedJson = mapper.writeValueAsString(returnableReviews);
    String responseJson = response.getResponse().getContentAsString();
    verify(reviewRepository, times(1)).findByStatus(eq(ModerationStatus.AWAITING_REVIEW));
    assertEquals(expectedJson, responseJson);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_get_needs_moderation_returns_moderation_needed() throws Exception {
    User user1 = User.builder().id(2L).build();

    MenuItem menuItem1 = MenuItem.builder().id(1L).build();

    Review review1 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(1L)
            .build();

    Review review2 =
        Review.builder()
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user1)
            .status(ModerationStatus.AWAITING_REVIEW)
            .item(menuItem1)
            .id(2L)
            .build();

    ArrayList<Review> returnableReviews = new ArrayList<>(Arrays.asList(review1, review2));

    when(reviewRepository.findByStatus(eq(ModerationStatus.AWAITING_REVIEW)))
        .thenReturn(returnableReviews);

    MvcResult response =
        mockMvc
            .perform(get("/api/reviews/needsmoderation").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String expectedJson = mapper.writeValueAsString(returnableReviews);
    String responseJson = response.getResponse().getContentAsString();
    verify(reviewRepository, times(1)).findByStatus(eq(ModerationStatus.AWAITING_REVIEW));
    assertEquals(expectedJson, responseJson);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void allApprovedReviewsForItem_returns_approved_reviews_for_existing_item()
      throws Exception {
    // Arrange
    long itemId = 1L;
    MenuItem item = MenuItem.builder().id(itemId).build();

    Review review1 =
        Review.builder()
            .id(10L)
            .item(item)
            .status(ModerationStatus.APPROVED)
            .reviewerComments("Great!")
            .build();

    Review review2 =
        Review.builder()
            .id(11L)
            .item(item)
            .status(ModerationStatus.APPROVED)
            .reviewerComments("Loved it!")
            .build();

    ArrayList<Review> approvedReviews = new ArrayList<>(Arrays.asList(review1, review2));

    when(menuItemRepository.findById(eq(itemId))).thenReturn(Optional.of(item));
    when(reviewRepository.findByItemAndStatus(eq(item), eq(ModerationStatus.APPROVED)))
        .thenReturn(approvedReviews);

    // Act
    MvcResult response =
        mockMvc
            .perform(get("/api/reviews/approved/forItem/" + itemId).with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // Assert
    String expectedJson = mapper.writeValueAsString(approvedReviews);
    String responseJson = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseJson);
    verify(menuItemRepository, times(1)).findById(eq(itemId));
    verify(reviewRepository, times(1)).findByItemAndStatus(eq(item), eq(ModerationStatus.APPROVED));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void allApprovedReviewsForItem_returns_not_found_for_nonexistent_item() throws Exception {
    // Arrange
    long itemId = 999L;
    when(menuItemRepository.findById(eq(itemId))).thenReturn(Optional.empty());

    // Act
    MvcResult response =
        mockMvc
            .perform(get("/api/reviews/approved/forItem/" + itemId).with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // Assert
    Map<String, Object> json = responseToJson(response);
    assertEquals("MenuItem with id 999 not found", json.get("message"));
    verify(menuItemRepository, times(1)).findById(eq(itemId));
    verify(reviewRepository, times(0)).findByItemAndStatus(any(), any());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void getReviewById_returns_review_for_existing_id() throws Exception {
    // Arrange
    long reviewId = 1L;
    User user = User.builder().id(2L).build();
    MenuItem menuItem = MenuItem.builder().id(1L).build();

    Review review =
        Review.builder()
            .id(reviewId)
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user)
            .status(ModerationStatus.APPROVED)
            .reviewerComments("Great food!")
            .itemsStars(5L)
            .item(menuItem)
            .build();

    when(reviewRepository.findById(eq(reviewId))).thenReturn(Optional.of(review));

    // Act
    MvcResult response =
        mockMvc
            .perform(get("/api/reviews/" + reviewId).with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // Assert
    String expectedJson = mapper.writeValueAsString(review);
    String responseJson = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseJson);
    verify(reviewRepository, times(1)).findById(eq(reviewId));
  }

  @Test
  public void getReviewById_returns_review_for_logged_out_user() throws Exception {
    // Arrange
    long reviewId = 1L;
    User user = User.builder().id(2L).build();
    MenuItem menuItem = MenuItem.builder().id(1L).build();

    Review review =
        Review.builder()
            .id(reviewId)
            .dateCreated(LocalDateTime.of(2024, 7, 1, 2, 47))
            .dateEdited(LocalDateTime.of(2024, 7, 2, 12, 47))
            .dateItemServed(LocalDateTime.of(2021, 12, 12, 1, 3))
            .reviewer(user)
            .status(ModerationStatus.APPROVED)
            .reviewerComments("Great food!")
            .itemsStars(5L)
            .item(menuItem)
            .build();

    when(reviewRepository.findById(eq(reviewId))).thenReturn(Optional.of(review));

    // Act
    MvcResult response =
        mockMvc
            .perform(get("/api/reviews/" + reviewId).with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // Assert
    String expectedJson = mapper.writeValueAsString(review);
    String responseJson = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseJson);
    verify(reviewRepository, times(1)).findById(eq(reviewId));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void getReviewById_returns_not_found_for_nonexistent_id() throws Exception {
    // Arrange
    long reviewId = 999L;
    when(reviewRepository.findById(eq(reviewId))).thenReturn(Optional.empty());

    // Act
    MvcResult response =
        mockMvc
            .perform(get("/api/reviews/" + reviewId).with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // Assert
    Map<String, Object> json = responseToJson(response);
    assertEquals("Review with id 999 not found", json.get("message"));
    verify(reviewRepository, times(1)).findById(eq(reviewId));
  }

  @Test
  public void getReviewById_returns_not_found_for_nonexistent_id_logged_out() throws Exception {
    // Arrange
    long reviewId = 999L;
    when(reviewRepository.findById(eq(reviewId))).thenReturn(Optional.empty());

    // Act
    MvcResult response =
        mockMvc
            .perform(get("/api/reviews/" + reviewId).with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // Assert
    Map<String, Object> json = responseToJson(response);
    assertEquals("Review with id 999 not found", json.get("message"));
    verify(reviewRepository, times(1)).findById(eq(reviewId));
  }
}
