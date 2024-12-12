package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * This is a JPA entity that represents a UCSB Dining Commons.
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "UCSBAPIDiningCommons")
public class UCSBAPIDiningCommons {

  @Id
  private String name;
  private String code;
  private boolean hasSackMeal;
  private boolean hasTakeOutMeal;
  private boolean hasDiningCam;

  @Embedded
  private Location location;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Embeddable
  public static class Location {
    private double latitude;
    private double longitude;
  }
}
