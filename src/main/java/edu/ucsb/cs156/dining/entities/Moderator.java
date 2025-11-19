package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.*;
import lombok.*;

/** This is a JPA entity that represents a Moderator. */
@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Entity(name = "moderators")
public class Moderator {
  @Id private String email;
}
