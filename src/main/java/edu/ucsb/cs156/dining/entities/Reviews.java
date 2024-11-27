package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.Date;

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

  @Column(name="USER_ID")
  private long userId;
  
  private String moderator_comments;
  private int moderator_id;

  @CreationTimestamp
  @Temporal(TemporalType.TIMESTAMP)
  private Date created_date; // FIX THESE AND THEN FIX TESTS

  @UpdateTimestamp
  @Temporal(TemporalType.TIMESTAMP)
  private Date last_edited_date;
}