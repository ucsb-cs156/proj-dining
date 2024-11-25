package edu.ucsb.cs156.dining.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DiningCommons {
  private String name;
  private String code;
  private Boolean hasDiningCam;
  private Boolean hasSackMeal;
  private Boolean hasTakeOutMeal;
  private Double latitude;
  private Double longitude;
}