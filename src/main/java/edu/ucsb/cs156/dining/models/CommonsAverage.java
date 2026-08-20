package edu.ucsb.cs156.dining.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Aggregated average rating for a single dining commons. */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommonsAverage {
  private String diningCommonsCode;
  private Double averageStars;
  private Long reviewCount;
}
