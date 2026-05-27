package edu.ucsb.cs156.dining.models;

import static org.junit.jupiter.api.Assertions.assertEquals;

import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

public class UserDataDTOTests {

  @Test
  public void properly_translates_user_object_to_dto() {
    User user =
        User.builder()
            .id(1L)
            .email("cgaucho@ucsb.edu")
            .googleSub("fakesub")
            .pictureUrl("pictureurl")
            .fullName("Chris Gaucho")
            .givenName("Chris")
            .familyName("Gaucho")
            .emailVerified(true)
            .locale("en")
            .hostedDomain("ucsb.edu")
            .alias("Chris")
            .proposedAlias("Gaucho")
            .status(ModerationStatus.APPROVED)
            .dateApproved(LocalDate.of(2026, 5, 26))
            .build();

    UserDataDTO translated =
        UserDataDTO.builder()
            .id(1L)
            .email("cgaucho@ucsb.edu")
            .googleSub("fakesub")
            .pictureUrl("pictureurl")
            .fullName("Chris Gaucho")
            .givenName("Chris")
            .familyName("Gaucho")
            .emailVerified(true)
            .locale("en")
            .hostedDomain("ucsb.edu")
            .alias("Chris")
            .proposedAlias("Gaucho")
            .status(ModerationStatus.APPROVED)
            .dateApproved(LocalDate.of(2026, 5, 26))
            .admin(false)
            .moderator(false)
            .build();

    assertEquals(translated, UserDataDTO.from(user, false, false));
  }

  @Test
  public void properly_translates_roles() {
    User user =
        User.builder()
            .id(1L)
            .email("cgaucho@ucsb.edu")
            .googleSub("fakesub")
            .pictureUrl("pictureurl")
            .fullName("Chris Gaucho")
            .givenName("Chris")
            .familyName("Gaucho")
            .build();

    UserDataDTO translated =
        UserDataDTO.builder()
            .id(1L)
            .email("cgaucho@ucsb.edu")
            .googleSub("fakesub")
            .pictureUrl("pictureurl")
            .fullName("Chris Gaucho")
            .givenName("Chris")
            .familyName("Gaucho")
            .emailVerified(false)
            .locale(null)
            .hostedDomain(null)
            .alias("Anonymous User")
            .proposedAlias(null)
            .status(null)
            .dateApproved(null)
            .admin(true)
            .moderator(true)
            .build();

    assertEquals(translated, UserDataDTO.from(user, true, true));
  }
}
