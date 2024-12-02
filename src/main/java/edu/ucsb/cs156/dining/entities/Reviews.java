package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
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
  private int item_id;

  private LocalDateTime date_served;

  private String status;
  @Column(name = "COMMENTS")
  private String comments;
  private int rating;

  @Column(name="USER_ID")
  private long userId;
  
  private String moderator_comments;
  private int moderator_id;

  @CreationTimestamp
  @Temporal(TemporalType.TIMESTAMP)
  private Date created_date;

  @UpdateTimestamp
  @Temporal(TemporalType.TIMESTAMP)
  private Date last_edited_date;
}