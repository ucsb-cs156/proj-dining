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
 * This is a JPA entity that represents a Review, i.e. an entry
 * that allows users to see data fields and then rate and comment on the said data, specifically about the menu and food
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
  private long studentId;
  private long itemId;
  private LocalDateTime dateItemServed;
  private String status;
  private long userIdModerator;
  private String moderatorComments;
  private LocalDateTime dateCreated;
  private LocalDateTime dateEdited;
}