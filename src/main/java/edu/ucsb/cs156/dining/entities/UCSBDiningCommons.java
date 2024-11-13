package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 
 * This is a JPA entity that represents a UCSBDiningCommons
 * 
 * A UCSBDiningCommons is a dining commons at UCSB
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "ucsbdiningcommons")
public class UCSBDiningCommons {
  @Id
  private String code;
  private String name;
  private boolean hasSackMeal;
  private boolean hasTakeOutMeal;
  private boolean hasDiningCam;
  private Double latitude;
  private Double longitude;
}