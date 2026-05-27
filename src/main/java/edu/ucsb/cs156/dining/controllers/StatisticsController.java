package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Statistics")
@RequestMapping("/api/statistics")
@RestController
@Slf4j
public class StatisticsController extends ApiController {

  @Autowired ReviewRepository reviewRepository;

  @Autowired MenuItemRepository menuItemRepository;

  public record StatisticsSummary(
      long totalApprovedReviews,
      long totalMenuItemsReviewed,
      long totalCommonsCovered,
      LocalDateTime lastUpdated) {}

  @Operation(summary = "Get a summary of review statistics")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping(value = "", produces = "application/json")
  public StatisticsSummary getSummary() {
    return new StatisticsSummary(
        reviewRepository.countByStatus(ModerationStatus.APPROVED),
        reviewRepository.countDistinctItemsByStatus(ModerationStatus.APPROVED),
        reviewRepository.countDistinctCommonsByStatus(ModerationStatus.APPROVED),
        reviewRepository.findMaxDateEditedByStatus(ModerationStatus.APPROVED));
  }
}
