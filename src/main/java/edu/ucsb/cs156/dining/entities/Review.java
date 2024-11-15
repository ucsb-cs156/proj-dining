package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * This is a JPA entity that represents a restaurant.
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "reviews")
public class Review {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private long reviewerId;
  private String diningCommons;
  private String meal;
  private long itemId;
  private String station;
  private LocalDateTime dateServed;
  private long stars;
  private String reviewText;
  private String status;
  private long modId;
  private String modComments;
  private LocalDateTime createdDate;
  private LocalDateTime lastEditedDate;

}