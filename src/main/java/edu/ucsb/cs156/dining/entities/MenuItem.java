package edu.ucsb.cs156.dining.entities;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id")
public class MenuItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private String diningCommonsCode;
  private String mealCode;
  private String name;
  private String station;

  @OneToMany(mappedBy = "item")
  @Fetch(FetchMode.JOIN)
  private List<Review> reviews;
}