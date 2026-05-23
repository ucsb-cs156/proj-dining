package edu.ucsb.cs156.dining.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Aggregated rating statistics for a single menu item, used by the statistics endpoints. */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ItemStatistic {
  private Long itemId;
  private String itemName;
  private String diningCommonsCode;
  private String mealCode;
  private String station;
  private Double averageStars;
  private Long reviewCount;
}
