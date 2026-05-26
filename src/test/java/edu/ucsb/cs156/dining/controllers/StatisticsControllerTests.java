package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.models.CommonsAverage;
import edu.ucsb.cs156.dining.models.CommonsAverageOverTime;
import edu.ucsb.cs156.dining.models.ItemStatistic;
import edu.ucsb.cs156.dining.models.MealAverage;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = StatisticsController.class)
@Import(TestConfig.class)
public class StatisticsControllerTests extends ControllerTestCase {

  @MockBean ReviewRepository reviewRepository;

  @Autowired ObjectMapper objectMapper;

  // ---------- helpers ----------

  private MenuItem item(long id, String name, String commons, String meal, String station) {
    return MenuItem.builder()
        .id(id)
        .name(name)
        .diningCommonsCode(commons)
        .mealCode(meal)
        .station(station)
        .build();
  }

  private Review review(MenuItem mi, long stars, LocalDateTime served) {
    return Review.builder()
        .itemsStars(stars)
        .item(mi)
        .dateItemServed(served)
        .status(ModerationStatus.APPROVED)
        .build();
  }

  // ---------- cutoffForPeriod ----------

  @Test
  public void cutoffForPeriod_null_returns_null() {
    assertNull(StatisticsController.cutoffForPeriod(null, LocalDateTime.now()));
  }

  @Test
  public void cutoffForPeriod_all_returns_null() {
    assertNull(
        StatisticsController.cutoffForPeriod(StatisticsController.PERIOD_ALL, LocalDateTime.now()));
  }

  @Test
  public void cutoffForPeriod_unknown_returns_null() {
    assertNull(StatisticsController.cutoffForPeriod("nonsense", LocalDateTime.now()));
  }

  @Test
  public void cutoffForPeriod_6M() {
    LocalDateTime now = LocalDateTime.of(2025, 7, 1, 12, 0);
    assertEquals(
        now.minusMonths(6),
        StatisticsController.cutoffForPeriod(StatisticsController.PERIOD_6M, now));
  }

  @Test
  public void cutoffForPeriod_1M() {
    LocalDateTime now = LocalDateTime.of(2025, 7, 1, 12, 0);
    assertEquals(
        now.minusMonths(1),
        StatisticsController.cutoffForPeriod(StatisticsController.PERIOD_1M, now));
  }

  @Test
  public void cutoffForPeriod_1W() {
    LocalDateTime now = LocalDateTime.of(2025, 7, 1, 12, 0);
    assertEquals(
        now.minusWeeks(1),
        StatisticsController.cutoffForPeriod(StatisticsController.PERIOD_1W, now));
  }

  // ---------- auth ----------

  @Test
  public void logged_out_users_cannot_get_best_items() throws Exception {
    mockMvc.perform(get("/api/statistics/items/best")).andExpect(status().is(403));
  }

  @Test
  public void logged_out_users_cannot_get_worst_items() throws Exception {
    mockMvc.perform(get("/api/statistics/items/worst")).andExpect(status().is(403));
  }

  @Test
  public void logged_out_users_cannot_get_commons_averages() throws Exception {
    mockMvc.perform(get("/api/statistics/commons/averages")).andExpect(status().is(403));
  }

  @Test
  public void logged_out_users_cannot_get_commons_averages_over_time() throws Exception {
    mockMvc.perform(get("/api/statistics/commons/averages/overtime")).andExpect(status().is(403));
  }

  @Test
  public void logged_out_users_cannot_get_commons_meal_averages() throws Exception {
    mockMvc
        .perform(get("/api/statistics/commons/carrillo/meals/averages"))
        .andExpect(status().is(403));
  }

  // ---------- /items/best ----------

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_returns_empty_list_when_no_reviews() throws Exception {
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.emptyList());

    MvcResult response =
        mockMvc.perform(get("/api/statistics/items/best")).andExpect(status().isOk()).andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(Collections.emptyList(), result);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_returns_bad_request_for_negative_limit() throws Exception {
    mockMvc
        .perform(get("/api/statistics/items/best").param("limit", "-1"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("limit must be non-negative"));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_accepts_zero_limit() throws Exception {
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/api/statistics/items/best").param("limit", "0"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_ranks_highest_average_first_and_respects_limit() throws Exception {
    MenuItem waffle = item(1L, "Waffle", "carrillo", "breakfast", "Bakery");
    MenuItem soup = item(2L, "Soup", "ortega", "lunch", "Stove");
    MenuItem pizza = item(3L, "Pizza", "portola", "dinner", "Oven");

    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    List<Review> reviews =
        Arrays.asList(
            review(waffle, 5L, t),
            review(waffle, 5L, t),
            review(soup, 3L, t),
            review(soup, 3L, t),
            review(pizza, 4L, t),
            review(pizza, 4L, t));

    when(reviewRepository.findByStatus(ModerationStatus.APPROVED)).thenReturn(reviews);

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/items/best").param("limit", "2"))
            .andExpect(status().isOk())
            .andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(2, result.size());
    assertEquals(Long.valueOf(1L), result.get(0).getItemId());
    assertEquals(5.0, result.get(0).getAverageStars());
    assertEquals(Long.valueOf(2L), result.get(0).getReviewCount());
    assertEquals("Waffle", result.get(0).getItemName());
    assertEquals("carrillo", result.get(0).getDiningCommonsCode());
    assertEquals("breakfast", result.get(0).getMealCode());
    assertEquals("Bakery", result.get(0).getStation());

    assertEquals(Long.valueOf(3L), result.get(1).getItemId());
    assertEquals(4.0, result.get(1).getAverageStars());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_default_limit_returns_at_most_five() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    List<Review> reviews = new ArrayList<>();
    for (long i = 1; i <= 7; i++) {
      MenuItem mi = item(i, "Item" + i, "carrillo", "lunch", "Station");
      reviews.add(review(mi, 5L, t));
    }
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED)).thenReturn(reviews);

    MvcResult response =
        mockMvc.perform(get("/api/statistics/items/best")).andExpect(status().isOk()).andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(5, result.size());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_returns_all_when_below_limit() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem mi = item(1L, "Item1", "carrillo", "lunch", "Station");
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.singletonList(review(mi, 5L, t)));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/items/best").param("limit", "20"))
            .andExpect(status().isOk())
            .andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(1, result.size());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_filters_by_period_1W() throws Exception {
    LocalDateTime now = LocalDateTime.now();
    MenuItem fresh = item(1L, "Fresh", "carrillo", "lunch", "Station");
    MenuItem stale = item(2L, "Stale", "carrillo", "lunch", "Station");
    List<Review> reviews =
        Arrays.asList(review(fresh, 5L, now.minusDays(1)), review(stale, 5L, now.minusDays(30)));

    when(reviewRepository.findByStatus(ModerationStatus.APPROVED)).thenReturn(reviews);

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/items/best").param("period", "1W"))
            .andExpect(status().isOk())
            .andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(1, result.size());
    assertEquals(Long.valueOf(1L), result.get(0).getItemId());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_filters_by_period_1M() throws Exception {
    LocalDateTime now = LocalDateTime.now();
    MenuItem fresh = item(1L, "Fresh", "carrillo", "lunch", "Station");
    MenuItem stale = item(2L, "Stale", "carrillo", "lunch", "Station");
    List<Review> reviews =
        Arrays.asList(review(fresh, 5L, now.minusDays(1)), review(stale, 5L, now.minusMonths(3)));

    when(reviewRepository.findByStatus(ModerationStatus.APPROVED)).thenReturn(reviews);

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/items/best").param("period", "1M"))
            .andExpect(status().isOk())
            .andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(1, result.size());
    assertEquals(Long.valueOf(1L), result.get(0).getItemId());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_filters_by_period_6M() throws Exception {
    LocalDateTime now = LocalDateTime.now();
    MenuItem fresh = item(1L, "Fresh", "carrillo", "lunch", "Station");
    MenuItem stale = item(2L, "Stale", "carrillo", "lunch", "Station");
    List<Review> reviews =
        Arrays.asList(review(fresh, 5L, now.minusMonths(1)), review(stale, 5L, now.minusYears(1)));

    when(reviewRepository.findByStatus(ModerationStatus.APPROVED)).thenReturn(reviews);

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/items/best").param("period", "6M"))
            .andExpect(status().isOk())
            .andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(1, result.size());
    assertEquals(Long.valueOf(1L), result.get(0).getItemId());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_breaks_ties_using_review_count_then_id() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem a = item(2L, "A", "carrillo", "lunch", "Station");
    MenuItem b = item(1L, "B", "carrillo", "lunch", "Station");
    MenuItem c = item(3L, "C", "carrillo", "lunch", "Station");
    // a has 1 review at 5*, b has 2 reviews at 5*, c has 2 reviews at 5*
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(
            Arrays.asList(
                review(a, 5L, t),
                review(b, 5L, t),
                review(b, 5L, t),
                review(c, 5L, t),
                review(c, 5L, t)));

    MvcResult response =
        mockMvc.perform(get("/api/statistics/items/best")).andExpect(status().isOk()).andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    // tie on stars=5 -> higher reviewCount wins; b (id=1) and c (id=3) both have 2 reviews,
    // then tie broken by lower id ascending -> b before c, then a (only 1 review)
    assertEquals(Long.valueOf(1L), result.get(0).getItemId());
    assertEquals(Long.valueOf(3L), result.get(1).getItemId());
    assertEquals(Long.valueOf(2L), result.get(2).getItemId());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_ignores_reviews_with_null_item() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem mi = item(1L, "Item", "carrillo", "lunch", "Station");
    Review good = review(mi, 4L, t);
    Review nullItem =
        Review.builder()
            .itemsStars(5L)
            .item(null)
            .dateItemServed(t)
            .status(ModerationStatus.APPROVED)
            .build();
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Arrays.asList(good, nullItem));

    MvcResult response =
        mockMvc.perform(get("/api/statistics/items/best")).andExpect(status().isOk()).andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(1, result.size());
    assertEquals(Long.valueOf(1L), result.get(0).getItemId());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_ignores_reviews_with_null_stars() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem mi = item(1L, "Item", "carrillo", "lunch", "Station");
    Review withStars = review(mi, 4L, t);
    Review withoutStars =
        Review.builder()
            .itemsStars(null)
            .item(mi)
            .dateItemServed(t)
            .status(ModerationStatus.APPROVED)
            .build();
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Arrays.asList(withStars, withoutStars));

    MvcResult response =
        mockMvc.perform(get("/api/statistics/items/best")).andExpect(status().isOk()).andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(1, result.size());
    assertEquals(Long.valueOf(1L), result.get(0).getReviewCount());
    assertEquals(4.0, result.get(0).getAverageStars());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_drops_items_whose_reviews_are_all_starless() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem starless = item(1L, "Starless", "carrillo", "lunch", "Station");
    Review noStars =
        Review.builder()
            .itemsStars(null)
            .item(starless)
            .dateItemServed(t)
            .status(ModerationStatus.APPROVED)
            .build();
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.singletonList(noStars));

    MvcResult response =
        mockMvc.perform(get("/api/statistics/items/best")).andExpect(status().isOk()).andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(0, result.size());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_keeps_reviews_with_null_served_date_for_period_all() throws Exception {
    MenuItem mi = item(1L, "Item", "carrillo", "lunch", "Station");
    Review noDate =
        Review.builder()
            .itemsStars(4L)
            .item(mi)
            .dateItemServed(null)
            .status(ModerationStatus.APPROVED)
            .build();
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.singletonList(noDate));

    MvcResult response =
        mockMvc.perform(get("/api/statistics/items/best")).andExpect(status().isOk()).andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(1, result.size());
    assertEquals(4.0, result.get(0).getAverageStars());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void best_items_drops_reviews_with_null_served_date_when_period_set() throws Exception {
    MenuItem mi = item(1L, "Item", "carrillo", "lunch", "Station");
    Review noDate =
        Review.builder()
            .itemsStars(4L)
            .item(mi)
            .dateItemServed(null)
            .status(ModerationStatus.APPROVED)
            .build();
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.singletonList(noDate));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/items/best").param("period", "1M"))
            .andExpect(status().isOk())
            .andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(0, result.size());
  }

  // ---------- /items/worst ----------

  @WithMockUser(roles = {"USER"})
  @Test
  public void worst_items_returns_empty_when_no_reviews() throws Exception {
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.emptyList());

    MvcResult response =
        mockMvc.perform(get("/api/statistics/items/worst")).andExpect(status().isOk()).andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(Collections.emptyList(), result);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void worst_items_returns_bad_request_for_negative_limit() throws Exception {
    mockMvc
        .perform(get("/api/statistics/items/worst").param("limit", "-1"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("limit must be non-negative"));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void worst_items_accepts_zero_limit() throws Exception {
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.emptyList());

    mockMvc
        .perform(get("/api/statistics/items/worst").param("limit", "0"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void worst_items_ranks_lowest_first_and_respects_limit() throws Exception {
    MenuItem waffle = item(1L, "Waffle", "carrillo", "breakfast", "Bakery");
    MenuItem soup = item(2L, "Soup", "ortega", "lunch", "Stove");
    MenuItem pizza = item(3L, "Pizza", "portola", "dinner", "Oven");

    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    List<Review> reviews =
        Arrays.asList(
            review(waffle, 5L, t), review(soup, 1L, t), review(pizza, 4L, t), review(pizza, 4L, t));

    when(reviewRepository.findByStatus(ModerationStatus.APPROVED)).thenReturn(reviews);

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/items/worst").param("limit", "2"))
            .andExpect(status().isOk())
            .andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(2, result.size());
    assertEquals(Long.valueOf(2L), result.get(0).getItemId());
    assertEquals(1.0, result.get(0).getAverageStars());
    assertEquals(Long.valueOf(3L), result.get(1).getItemId());
    assertEquals(4.0, result.get(1).getAverageStars());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void worst_items_returns_all_when_below_limit() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem mi = item(1L, "Item1", "carrillo", "lunch", "Station");
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.singletonList(review(mi, 1L, t)));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/items/worst").param("limit", "20"))
            .andExpect(status().isOk())
            .andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(1, result.size());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void worst_items_breaks_ties_using_review_count_then_id() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem a = item(2L, "A", "carrillo", "lunch", "Station");
    MenuItem b = item(1L, "B", "carrillo", "lunch", "Station");
    MenuItem c = item(3L, "C", "carrillo", "lunch", "Station");
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(
            Arrays.asList(
                review(a, 1L, t),
                review(b, 1L, t),
                review(b, 1L, t),
                review(c, 1L, t),
                review(c, 1L, t)));

    MvcResult response =
        mockMvc.perform(get("/api/statistics/items/worst")).andExpect(status().isOk()).andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    // tie on stars=1 -> higher reviewCount first; among b and c (both 2 reviews), lower id wins
    assertEquals(Long.valueOf(1L), result.get(0).getItemId());
    assertEquals(Long.valueOf(3L), result.get(1).getItemId());
    assertEquals(Long.valueOf(2L), result.get(2).getItemId());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void worst_items_filters_by_period() throws Exception {
    LocalDateTime now = LocalDateTime.now();
    MenuItem fresh = item(1L, "Fresh", "carrillo", "lunch", "Station");
    MenuItem stale = item(2L, "Stale", "carrillo", "lunch", "Station");
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(
            Arrays.asList(
                review(fresh, 1L, now.minusDays(1)), review(stale, 1L, now.minusDays(60))));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/items/worst").param("period", "1M"))
            .andExpect(status().isOk())
            .andReturn();

    List<ItemStatistic> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<ItemStatistic>>() {});

    assertEquals(1, result.size());
    assertEquals(Long.valueOf(1L), result.get(0).getItemId());
  }

  // ---------- /commons/averages ----------

  @WithMockUser(roles = {"USER"})
  @Test
  public void commons_averages_returns_empty_when_no_reviews() throws Exception {
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.emptyList());

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/commons/averages"))
            .andExpect(status().isOk())
            .andReturn();

    List<CommonsAverage> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<CommonsAverage>>() {});

    assertEquals(Collections.emptyList(), result);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void commons_averages_groups_by_commons_and_sorts_alphabetically() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem waffle = item(1L, "Waffle", "carrillo", "breakfast", "Bakery");
    MenuItem soup = item(2L, "Soup", "ortega", "lunch", "Stove");
    MenuItem pizza = item(3L, "Pizza", "ortega", "dinner", "Oven");
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(
            Arrays.asList(
                review(waffle, 5L, t),
                review(waffle, 3L, t),
                review(soup, 2L, t),
                review(pizza, 4L, t)));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/commons/averages"))
            .andExpect(status().isOk())
            .andReturn();

    List<CommonsAverage> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<CommonsAverage>>() {});

    assertEquals(2, result.size());
    assertEquals("carrillo", result.get(0).getDiningCommonsCode());
    assertEquals(4.0, result.get(0).getAverageStars());
    assertEquals(Long.valueOf(2L), result.get(0).getReviewCount());
    assertEquals("ortega", result.get(1).getDiningCommonsCode());
    assertEquals(3.0, result.get(1).getAverageStars());
    assertEquals(Long.valueOf(2L), result.get(1).getReviewCount());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void commons_averages_sorts_alphabetically_when_data_arrives_unsorted() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem portola = item(1L, "Portola item", "portola", "lunch", "Station");
    MenuItem deLaGuerra = item(2L, "DLG item", "de-la-guerra", "lunch", "Station");
    MenuItem carrillo = item(3L, "Carrillo item", "carrillo", "lunch", "Station");
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(
            Arrays.asList(
                review(portola, 1L, t), review(deLaGuerra, 2L, t), review(carrillo, 3L, t)));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/commons/averages"))
            .andExpect(status().isOk())
            .andReturn();

    List<CommonsAverage> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<CommonsAverage>>() {});

    assertEquals(3, result.size());
    assertEquals("carrillo", result.get(0).getDiningCommonsCode());
    assertEquals("de-la-guerra", result.get(1).getDiningCommonsCode());
    assertEquals("portola", result.get(2).getDiningCommonsCode());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void commons_averages_ignores_reviews_missing_required_fields() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem good = item(1L, "Good", "carrillo", "breakfast", "Bakery");
    MenuItem noCommons = item(2L, "NoCommons", null, "lunch", "Station");
    Review withNullItem =
        Review.builder()
            .itemsStars(5L)
            .item(null)
            .dateItemServed(t)
            .status(ModerationStatus.APPROVED)
            .build();
    Review withNullStars =
        Review.builder()
            .itemsStars(null)
            .item(good)
            .dateItemServed(t)
            .status(ModerationStatus.APPROVED)
            .build();
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(
            Arrays.asList(
                review(good, 5L, t), review(noCommons, 5L, t), withNullItem, withNullStars));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/commons/averages"))
            .andExpect(status().isOk())
            .andReturn();

    List<CommonsAverage> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<CommonsAverage>>() {});

    assertEquals(1, result.size());
    assertEquals("carrillo", result.get(0).getDiningCommonsCode());
    assertEquals(5.0, result.get(0).getAverageStars());
    assertEquals(Long.valueOf(1L), result.get(0).getReviewCount());
  }

  // ---------- /commons/averages/overtime ----------

  @WithMockUser(roles = {"USER"})
  @Test
  public void commons_averages_over_time_groups_by_month_and_sorts() throws Exception {
    MenuItem waffle = item(1L, "Waffle", "carrillo", "breakfast", "Bakery");
    MenuItem soup = item(2L, "Soup", "ortega", "lunch", "Stove");
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(
            Arrays.asList(
                review(waffle, 5L, LocalDateTime.of(2025, 3, 5, 12, 0)),
                review(waffle, 3L, LocalDateTime.of(2025, 3, 20, 12, 0)),
                review(waffle, 1L, LocalDateTime.of(2025, 4, 1, 12, 0)),
                review(soup, 2L, LocalDateTime.of(2025, 3, 15, 12, 0))));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/commons/averages/overtime"))
            .andExpect(status().isOk())
            .andReturn();

    List<CommonsAverageOverTime> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<CommonsAverageOverTime>>() {});

    assertEquals(3, result.size());
    assertEquals("carrillo", result.get(0).getDiningCommonsCode());
    assertEquals("2025-03", result.get(0).getPeriod());
    assertEquals(4.0, result.get(0).getAverageStars());
    assertEquals(Long.valueOf(2L), result.get(0).getReviewCount());
    assertEquals("carrillo", result.get(1).getDiningCommonsCode());
    assertEquals("2025-04", result.get(1).getPeriod());
    assertEquals(1.0, result.get(1).getAverageStars());
    assertEquals(Long.valueOf(1L), result.get(1).getReviewCount());
    assertEquals("ortega", result.get(2).getDiningCommonsCode());
    assertEquals("2025-03", result.get(2).getPeriod());
    assertEquals(2.0, result.get(2).getAverageStars());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void commons_averages_over_time_ignores_reviews_missing_required_fields()
      throws Exception {
    MenuItem good = item(1L, "Good", "carrillo", "breakfast", "Bakery");
    MenuItem noCommons = item(2L, "NoCommons", null, "lunch", "Station");
    Review withNullItem =
        Review.builder()
            .itemsStars(5L)
            .item(null)
            .dateItemServed(LocalDateTime.of(2025, 4, 1, 12, 0))
            .status(ModerationStatus.APPROVED)
            .build();
    Review withNullStars =
        Review.builder()
            .itemsStars(null)
            .item(good)
            .dateItemServed(LocalDateTime.of(2025, 4, 1, 12, 0))
            .status(ModerationStatus.APPROVED)
            .build();
    Review withNullDate =
        Review.builder()
            .itemsStars(5L)
            .item(good)
            .dateItemServed(null)
            .status(ModerationStatus.APPROVED)
            .build();
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(
            Arrays.asList(
                review(good, 5L, LocalDateTime.of(2025, 4, 1, 12, 0)),
                review(noCommons, 5L, LocalDateTime.of(2025, 4, 1, 12, 0)),
                withNullItem,
                withNullStars,
                withNullDate));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/commons/averages/overtime"))
            .andExpect(status().isOk())
            .andReturn();

    List<CommonsAverageOverTime> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<List<CommonsAverageOverTime>>() {});

    assertEquals(1, result.size());
    assertEquals("carrillo", result.get(0).getDiningCommonsCode());
    assertEquals("2025-04", result.get(0).getPeriod());
    assertEquals(5.0, result.get(0).getAverageStars());
    assertEquals(Long.valueOf(1L), result.get(0).getReviewCount());
  }

  // ---------- /commons/{code}/meals/averages ----------

  @WithMockUser(roles = {"USER"})
  @Test
  public void commons_meal_averages_returns_only_matching_commons_and_groups_by_meal()
      throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem waffle = item(1L, "Waffle", "carrillo", "breakfast", "Bakery");
    MenuItem lunchA = item(2L, "Salad", "carrillo", "lunch", "Station");
    MenuItem lunchB = item(3L, "Soup", "carrillo", "lunch", "Station");
    MenuItem otherCommons = item(4L, "Pizza", "portola", "dinner", "Oven");

    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(
            Arrays.asList(
                review(waffle, 5L, t),
                review(lunchA, 3L, t),
                review(lunchB, 5L, t),
                review(otherCommons, 1L, t)));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/commons/carrillo/meals/averages"))
            .andExpect(status().isOk())
            .andReturn();

    List<MealAverage> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(), new TypeReference<List<MealAverage>>() {});

    assertEquals(2, result.size());
    assertEquals("breakfast", result.get(0).getMealCode());
    assertEquals("carrillo", result.get(0).getDiningCommonsCode());
    assertEquals(5.0, result.get(0).getAverageStars());
    assertEquals(Long.valueOf(1L), result.get(0).getReviewCount());
    assertEquals("lunch", result.get(1).getMealCode());
    assertEquals("carrillo", result.get(1).getDiningCommonsCode());
    assertEquals(4.0, result.get(1).getAverageStars());
    assertEquals(Long.valueOf(2L), result.get(1).getReviewCount());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void commons_meal_averages_returns_empty_for_unknown_commons() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem waffle = item(1L, "Waffle", "carrillo", "breakfast", "Bakery");
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(Collections.singletonList(review(waffle, 5L, t)));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/commons/portola/meals/averages"))
            .andExpect(status().isOk())
            .andReturn();

    List<MealAverage> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(), new TypeReference<List<MealAverage>>() {});

    assertEquals(Collections.emptyList(), result);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void commons_meal_averages_ignores_reviews_missing_required_fields() throws Exception {
    LocalDateTime t = LocalDateTime.of(2025, 4, 1, 12, 0);
    MenuItem good = item(1L, "Good", "carrillo", "breakfast", "Bakery");
    MenuItem noMeal = item(2L, "NoMeal", "carrillo", null, "Station");
    Review withNullItem =
        Review.builder()
            .itemsStars(5L)
            .item(null)
            .dateItemServed(t)
            .status(ModerationStatus.APPROVED)
            .build();
    Review withNullStars =
        Review.builder()
            .itemsStars(null)
            .item(good)
            .dateItemServed(t)
            .status(ModerationStatus.APPROVED)
            .build();
    when(reviewRepository.findByStatus(ModerationStatus.APPROVED))
        .thenReturn(
            Arrays.asList(review(good, 5L, t), review(noMeal, 5L, t), withNullItem, withNullStars));

    MvcResult response =
        mockMvc
            .perform(get("/api/statistics/commons/carrillo/meals/averages"))
            .andExpect(status().isOk())
            .andReturn();

    List<MealAverage> result =
        objectMapper.readValue(
            response.getResponse().getContentAsString(), new TypeReference<List<MealAverage>>() {});

    assertEquals(1, result.size());
    assertEquals("breakfast", result.get(0).getMealCode());
    assertEquals(5.0, result.get(0).getAverageStars());
    assertEquals(Long.valueOf(1L), result.get(0).getReviewCount());
  }

  // ---------- DTO sanity (covers Lombok no-args + setters) ----------

  @Test
  public void itemStatistic_no_args_constructor_works() {
    ItemStatistic stat = new ItemStatistic();
    stat.setItemId(1L);
    stat.setItemName("name");
    stat.setDiningCommonsCode("c");
    stat.setMealCode("m");
    stat.setStation("s");
    stat.setAverageStars(4.0);
    stat.setReviewCount(2L);
    assertEquals(Long.valueOf(1L), stat.getItemId());
    assertEquals("name", stat.getItemName());
    assertEquals("c", stat.getDiningCommonsCode());
    assertEquals("m", stat.getMealCode());
    assertEquals("s", stat.getStation());
    assertEquals(4.0, stat.getAverageStars());
    assertEquals(Long.valueOf(2L), stat.getReviewCount());
    assertNotNull(stat.toString());
  }

  @Test
  public void commonsAverage_all_args_constructor_works() {
    CommonsAverage avg = new CommonsAverage("c", 3.5, 4L);
    assertEquals("c", avg.getDiningCommonsCode());
    assertEquals(3.5, avg.getAverageStars());
    assertEquals(Long.valueOf(4L), avg.getReviewCount());
  }

  @Test
  public void commonsAverageOverTime_no_args_constructor_works() {
    CommonsAverageOverTime row = new CommonsAverageOverTime();
    row.setDiningCommonsCode("c");
    row.setPeriod("2025-04");
    row.setAverageStars(3.0);
    row.setReviewCount(7L);
    assertEquals("c", row.getDiningCommonsCode());
    assertEquals("2025-04", row.getPeriod());
    assertEquals(3.0, row.getAverageStars());
    assertEquals(Long.valueOf(7L), row.getReviewCount());
  }

  @Test
  public void mealAverage_all_args_constructor_works() {
    MealAverage m = new MealAverage("c", "breakfast", 4.5, 2L);
    assertEquals("c", m.getDiningCommonsCode());
    assertEquals("breakfast", m.getMealCode());
    assertEquals(4.5, m.getAverageStars());
    assertEquals(Long.valueOf(2L), m.getReviewCount());
  }
}
