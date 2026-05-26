package edu.ucsb.cs156.dining.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Aggregated average rating for a single dining commons grouped by a calendar month. The {@code
 * period} field is in {@code yyyy-MM} format (e.g. {@code 2025-04}).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommonsAverageOverTime {
  private String diningCommonsCode;
  private String period;
  private Double averageStars;
  private Long reviewCount;
}
