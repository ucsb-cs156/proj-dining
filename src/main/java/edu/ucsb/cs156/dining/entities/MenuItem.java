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
 * This is a JPA entity that represents a menu item
 * 
 * A menu item is a food item served at a dining commons
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "menuitems")
public class MenuItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String diningCommonsCode;
  private String meal;
  private String name;
  private String station;
}