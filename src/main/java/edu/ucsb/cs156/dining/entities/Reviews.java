package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 
 * This is a JPA entity that represents a Review
 * 
 * A Review is a review of dining commons at UCSB
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "reviews")
public class Reviews {
  
  @Id
  private long id;
  private int student_id;
  private String item_id;
  private String date_served;
  private String status;
  private String user_id;
  private String moderator_comments;
  private String created_date;
  private String last_edited_date;
}