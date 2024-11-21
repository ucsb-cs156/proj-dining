package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
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
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;
  private int student_id;
  private int item_id;
  private String date_served;
  private String status;

  @Column(name="userId")
  private long userId;
  
  private String moderator_comments;
  private String created_date;
  private String last_edited_date;
}