package edu.ucsb.cs156.dining.entities;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.LocalDate;
import java.util.List;

/**
* This is a JPA entity that represents a user.
*/

@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Entity(name = "users")
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id")
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
 private boolean moderator;
 private boolean admin;
 private String alias;
 private String proposedAlias;
 @Enumerated(EnumType.STRING)
 private ModerationStatus status;
 private LocalDate dateApproved;

 @ToString.Exclude
 @OneToMany(mappedBy="reviewer")
 @Fetch(FetchMode.JOIN)
 private List<Review> reviews;
 
 public String getAlias() {
        if (this.alias == null) {
            this.alias = "Anonymous User"; 
        }
        return this.alias;
    }
}