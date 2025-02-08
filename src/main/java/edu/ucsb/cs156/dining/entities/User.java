package edu.ucsb.cs156.dining.entities;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
 private boolean admin;
 private String alias;
 private String proposedAlias;
 private String status;
 private LocalDate dateApproved;

 @OneToMany(mappedBy="reviewer")
 @Fetch(FetchMode.JOIN)
 @JsonIgnore
 private List<Review> reviews;
 
 public String getAlias() {
        if (this.alias == null) {
            this.alias = "Anonymous User"; 
        }
        return this.alias;
    }
}