package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.models.CommonsAverage;
import edu.ucsb.cs156.dining.models.CommonsAverageOverTime;
import edu.ucsb.cs156.dining.models.ItemStatistic;
import edu.ucsb.cs156.dining.models.MealAverage;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller that exposes aggregated review statistics. These endpoints power the "Review
 * Statistics" pages of the frontend (see issue #18).
 *
 * <p>Only reviews with moderation status {@link ModerationStatus#APPROVED} (or reviews that have no
 * comments and were therefore auto-approved) are considered when computing the statistics, so that
 * unmoderated user content does not influence what we publish.
 */
@Tag(name = "Statistics")
@RequestMapping("/api/statistics")
@RestController
@Slf4j
public class StatisticsController extends ApiController {

  @Autowired ReviewRepository reviewRepository;

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> handleValidationExceptions(
      IllegalArgumentException ex) {
    Map<String, String> errors = new HashMap<>();
    errors.put("error", ex.getMessage());
    return ResponseEntity.badRequest().body(errors);
  }

  /** Supported time-period filters for the best/worst items endpoints. */
  public static final String PERIOD_ALL = "ALL";

  public static final String PERIOD_6M = "6M";
  public static final String PERIOD_1M = "1M";
  public static final String PERIOD_1W = "1W";

  private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

  /**
   * Returns the cutoff {@link LocalDateTime} for the supplied period. {@code ALL} (or any
   * unrecognised value) maps to {@code null}, meaning no lower bound.
   */
  static LocalDateTime cutoffForPeriod(String period, LocalDateTime now) {
    if (period == null) {
      return null;
    }
    switch (period) {
      case PERIOD_6M:
        return now.minusMonths(6);
      case PERIOD_1M:
        return now.minusMonths(1);
      case PERIOD_1W:
        return now.minusWeeks(1);
      case PERIOD_ALL:
      default:
        return null;
    }
  }

  /** Loads only approved reviews from the repository (the only ones we expose in statistics). */
  private List<Review> approvedReviews() {
    List<Review> approved = new ArrayList<>();
    for (Review r : reviewRepository.findByStatus(ModerationStatus.APPROVED)) {
      approved.add(r);
    }
    return approved;
  }

  /** Applies a "served on or after the cutoff" filter (if a cutoff was given). */
  private List<Review> filterByCutoff(List<Review> reviews, LocalDateTime cutoff) {
    if (cutoff == null) {
      return reviews;
    }
    List<Review> filtered = new ArrayList<>();
    for (Review r : reviews) {
      if (r.getDateItemServed() != null && !r.getDateItemServed().isBefore(cutoff)) {
        filtered.add(r);
      }
    }
    return filtered;
  }

  /** Groups reviews by their associated menu item id and computes aggregate statistics. */
  private List<ItemStatistic> aggregateByItem(List<Review> reviews) {
    Map<Long, List<Review>> byItem = new HashMap<>();
    for (Review r : reviews) {
      MenuItem item = r.getItem();
      if (item == null) {
        continue;
      }
      byItem.computeIfAbsent(item.getId(), k -> new ArrayList<>()).add(r);
    }
    List<ItemStatistic> stats = new ArrayList<>();
    for (Map.Entry<Long, List<Review>> entry : byItem.entrySet()) {
      List<Review> itemReviews = entry.getValue();
      MenuItem item = itemReviews.get(0).getItem();
      double total = 0.0;
      long count = 0L;
      for (Review r : itemReviews) {
        if (r.getItemsStars() != null) {
          total += r.getItemsStars();
          count++;
        }
      }
      if (count == 0L) {
        continue;
      }
      stats.add(
          ItemStatistic.builder()
              .itemId(entry.getKey())
              .itemName(item.getName())
              .diningCommonsCode(item.getDiningCommonsCode())
              .mealCode(item.getMealCode())
              .station(item.getStation())
              .averageStars(total / count)
              .reviewCount(count)
              .build());
    }
    return stats;
  }

  /** Rejects negative limits before they reach {@code Stream.limit}, which throws. */
  private void validateLimit(int limit) {
    if (limit < 0) {
      throw new IllegalArgumentException("limit must be non-negative");
    }
  }

  /** Best items endpoint, supports a time period filter and a maximum result count. */
  @Operation(summary = "Best rated items, optionally restricted to a recent time period")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/items/best")
  public List<ItemStatistic> bestItems(
      @Parameter(name = "period", description = "ALL, 6M, 1M, or 1W")
          @RequestParam(name = "period", defaultValue = PERIOD_ALL)
          String period,
      @Parameter(name = "limit", description = "Maximum number of items to return")
          @RequestParam(name = "limit", defaultValue = "5")
          int limit) {
    log.info("statistics.bestItems period={} limit={}", period, limit);
    validateLimit(limit);
    LocalDateTime cutoff = cutoffForPeriod(period, LocalDateTime.now());
    List<ItemStatistic> stats = aggregateByItem(filterByCutoff(approvedReviews(), cutoff));
    stats.sort(
        Comparator.comparingDouble(ItemStatistic::getAverageStars)
            .reversed()
            .thenComparing(Comparator.comparingLong(ItemStatistic::getReviewCount).reversed())
            .thenComparing(Comparator.comparing(ItemStatistic::getItemId)));
    return stats.stream().limit(limit).collect(Collectors.toCollection(ArrayList::new));
  }

  /** Worst items endpoint, supports a time period filter and a maximum result count. */
  @Operation(summary = "Worst rated items, optionally restricted to a recent time period")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/items/worst")
  public List<ItemStatistic> worstItems(
      @Parameter(name = "period", description = "ALL, 6M, 1M, or 1W")
          @RequestParam(name = "period", defaultValue = PERIOD_ALL)
          String period,
      @Parameter(name = "limit", description = "Maximum number of items to return")
          @RequestParam(name = "limit", defaultValue = "5")
          int limit) {
    log.info("statistics.worstItems period={} limit={}", period, limit);
    validateLimit(limit);
    LocalDateTime cutoff = cutoffForPeriod(period, LocalDateTime.now());
    List<ItemStatistic> stats = aggregateByItem(filterByCutoff(approvedReviews(), cutoff));
    stats.sort(
        Comparator.comparingDouble(ItemStatistic::getAverageStars)
            .thenComparing(Comparator.comparingLong(ItemStatistic::getReviewCount).reversed())
            .thenComparing(Comparator.comparing(ItemStatistic::getItemId)));
    return stats.stream().limit(limit).collect(Collectors.toCollection(ArrayList::new));
  }

  /** Average review score for each dining commons. */
  @Operation(summary = "Average review score for each dining commons")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/commons/averages")
  public List<CommonsAverage> commonsAverages() {
    log.info("statistics.commonsAverages");
    Map<String, double[]> byCommons = new HashMap<>();
    for (Review r : approvedReviews()) {
      MenuItem item = r.getItem();
      if (item == null || item.getDiningCommonsCode() == null || r.getItemsStars() == null) {
        continue;
      }
      double[] acc = byCommons.computeIfAbsent(item.getDiningCommonsCode(), k -> new double[2]);
      acc[0] += r.getItemsStars();
      acc[1] += 1.0;
    }
    List<CommonsAverage> result = new ArrayList<>();
    for (Map.Entry<String, double[]> entry : byCommons.entrySet()) {
      double[] acc = entry.getValue();
      long count = (long) acc[1];
      result.add(
          CommonsAverage.builder()
              .diningCommonsCode(entry.getKey())
              .averageStars(acc[0] / acc[1])
              .reviewCount(count)
              .build());
    }
    result.sort(Comparator.comparing(CommonsAverage::getDiningCommonsCode));
    return result;
  }

  /** Average review score for each dining commons grouped by month (used to draw a graph). */
  @Operation(summary = "Average review score for each dining commons grouped by month")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/commons/averages/overtime")
  public List<CommonsAverageOverTime> commonsAveragesOverTime() {
    log.info("statistics.commonsAveragesOverTime");
    Map<String, double[]> buckets = new HashMap<>();
    Map<String, String[]> labels = new HashMap<>();
    for (Review r : approvedReviews()) {
      MenuItem item = r.getItem();
      if (item == null
          || item.getDiningCommonsCode() == null
          || r.getItemsStars() == null
          || r.getDateItemServed() == null) {
        continue;
      }
      String code = item.getDiningCommonsCode();
      String period = r.getDateItemServed().format(MONTH_FORMATTER);
      String key = code + "|" + period;
      double[] acc = buckets.computeIfAbsent(key, k -> new double[2]);
      acc[0] += r.getItemsStars();
      acc[1] += 1.0;
      labels.computeIfAbsent(key, k -> new String[] {code, period});
    }
    List<CommonsAverageOverTime> result = new ArrayList<>();
    for (Map.Entry<String, double[]> entry : buckets.entrySet()) {
      String[] label = labels.get(entry.getKey());
      double[] acc = entry.getValue();
      long count = (long) acc[1];
      result.add(
          CommonsAverageOverTime.builder()
              .diningCommonsCode(label[0])
              .period(label[1])
              .averageStars(acc[0] / acc[1])
              .reviewCount(count)
              .build());
    }
    result.sort(
        Comparator.comparing(CommonsAverageOverTime::getDiningCommonsCode)
            .thenComparing(CommonsAverageOverTime::getPeriod));
    return result;
  }

  /** Average review score for each meal slot at the supplied dining commons. */
  @Operation(summary = "Average review score grouped by meal for a single dining commons")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/commons/{code}/meals/averages")
  public List<MealAverage> commonsMealAverages(
      @Parameter(name = "code", description = "dining commons code, e.g. 'carrillo'")
          @PathVariable("code")
          String code) {
    log.info("statistics.commonsMealAverages code={}", code);
    Map<String, double[]> byMeal = new HashMap<>();
    for (Review r : approvedReviews()) {
      MenuItem item = r.getItem();
      if (item == null
          || item.getMealCode() == null
          || r.getItemsStars() == null
          || !code.equals(item.getDiningCommonsCode())) {
        continue;
      }
      double[] acc = byMeal.computeIfAbsent(item.getMealCode(), k -> new double[2]);
      acc[0] += r.getItemsStars();
      acc[1] += 1.0;
    }
    List<MealAverage> result = new ArrayList<>();
    for (Map.Entry<String, double[]> entry : byMeal.entrySet()) {
      double[] acc = entry.getValue();
      long count = (long) acc[1];
      result.add(
          MealAverage.builder()
              .diningCommonsCode(code)
              .mealCode(entry.getKey())
              .averageStars(acc[0] / acc[1])
              .reviewCount(count)
              .build());
    }
    result.sort(Comparator.comparing(MealAverage::getMealCode));
    return result;
  }
}
