package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * This is a JPA entity that represents a restaurant.
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "currentuser")
public class CurrentUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private String alias;
  private long modValue;
}