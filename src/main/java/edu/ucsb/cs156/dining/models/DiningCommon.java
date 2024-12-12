package edu.ucsb.cs156.dining.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DiningCommon {
  private String name;
  private String code;
  private boolean hasSackMeal;
  private boolean hasTakeOutMeal;
  private boolean hasDiningCam;
}