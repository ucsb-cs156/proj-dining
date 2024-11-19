package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity(name = "diningmenuapi")
public class DiningMenuAPI {
  @Id 
  private String name; 

  private String station; 
  private String mealCode; 
  private String diningCommonsCode; 
  private String dayName; 
  private LocalDate dateCode;
  private LocalDateTime date; 

  public static final String SAMPLE_MENU_ITEM_1_JSON =
      """
                {
                    "name": "Cream of Wheat (vgn)",
                    "station": "Grill (Cafe)",
                    "mealCode": "breakfast",
                    "diningCommonsCode": "carrillo",
                    "dayName": "Today",
                    "dateCode": "2024-11-18",
                    "date": "2024-11-18T00:00:00-08:00"
                }
            """;

  public static final String SAMPLE_MENU_ITEM_2_JSON =
      """
                    {
                        "name": "Turkey Noodle Soup",
                        "station": "Blue Plate Special",
                        "mealCode": "lunch",
                        "diningCommonsCode": "de-la-guerra",
                        "dayName": "Tomorrow",
                        "dateCode": "2024-11-19",
                        "date": "2024-11-19T00:00:00-08:00"
                    }
            """;

  public static final String SAMPLE_MENU_ITEM_3_JSON =
      """
                    {
                       "name": "Watermelon (vgn)",
                        "station": "Salad Bar Featured Items",
                        "mealCode": "dinner",
                        "diningCommonsCode": "portola",
                        "dayName": "Wednesday",
                        "dateCode": "2024-11-20",
                        "date": "2024-11-20T00:00:00-08:00"
                    },
            """;
}