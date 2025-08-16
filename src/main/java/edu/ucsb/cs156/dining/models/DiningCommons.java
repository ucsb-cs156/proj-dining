package edu.ucsb.cs156.dining.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
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

  // Found this on Baeldung for unpacking nested json properties:
  // https://www.baeldung.com/jackson-nested-values
  @JsonProperty("location")
  private void unpackedNested(Map<String, Object> location) {
    this.latitude = (Double) location.get("latitude");
    this.longitude = (Double) location.get("longitude");
  }

  public static final String SAMPLE_CARRILLO =
      """
          {
              "name": "Carrillo",
              "code": "M24",
              "hasDiningCam": true,
              "hasSackMeal": false,
              "hasTakeOutMeal" : false,
              "latitude" : null,
              "longitude" : null
          }
      """;
}
