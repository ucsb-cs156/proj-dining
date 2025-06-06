package edu.ucsb.cs156.dining.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.util.List;


/**
 * This is a JPA entity that represents a MenuItem
 *
 * A MenuItem represents an actual menu item in a dining commons at UCSB
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "menuitem")
public class MenuItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private String diningCommonsCode;
  private String mealCode;
  private String name;
  private String station;

  @ToString.Exclude
  @JsonIgnore
  @OneToMany(mappedBy = "item")
  @Fetch(FetchMode.JOIN)
  private List<Review> reviews;
}