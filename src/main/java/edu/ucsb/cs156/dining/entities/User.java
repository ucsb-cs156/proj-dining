package edu.ucsb.cs156.dining.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

/** This is a JPA entity that represents a user. */
@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Entity(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private String email;
  private String googleSub;
  private String pictureUrl;
  private String fullName;
  private String givenName;
  private String familyName;
  private boolean emailVerified;
  private String locale;
  private String hostedDomain;
  private boolean admin;
  private boolean moderator;
  private String alias;
  private String proposedAlias;

  @Enumerated(EnumType.STRING)
  private ModerationStatus status;

  private LocalDate dateApproved;

  @ToString.Exclude
  @JsonIgnore
  @OneToMany(mappedBy = "reviewer")
  @Fetch(FetchMode.JOIN)
  private List<Review> reviews;

  public String getAlias() {
    if (this.alias == null) {
      this.alias = "Anonymous User";
    }
    return this.alias;
  }

  public boolean isAdmin() {
    return admin;
  }

  public boolean isModerator() {
    return moderator;
  }
}
