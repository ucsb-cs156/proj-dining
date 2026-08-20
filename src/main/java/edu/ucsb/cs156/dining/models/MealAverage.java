package edu.ucsb.cs156.dining.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Aggregated average rating for a meal (e.g. breakfast/lunch/dinner) at a single dining commons.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MealAverage {
  private String diningCommonsCode;
  private String mealCode;
  private Double averageStars;
  private Long reviewCount;
}
