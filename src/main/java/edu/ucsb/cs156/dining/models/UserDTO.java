package edu.ucsb.cs156.dining.models;

import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import java.time.LocalDate;

/** Response model for user data with computed role flags. */
public record UserDTO(
    long id,
    String email,
    String googleSub,
    String pictureUrl,
    String fullName,
    String givenName,
    String familyName,
    boolean emailVerified,
    String locale,
    String hostedDomain,
    boolean admin,
    boolean moderator,
    String alias,
    String proposedAlias,
    ModerationStatus status,
    LocalDate dateApproved) {

  public UserDTO(User user, boolean admin, boolean moderator) {
    this(
        user.getId(),
        user.getEmail(),
        user.getGoogleSub(),
        user.getPictureUrl(),
        user.getFullName(),
        user.getGivenName(),
        user.getFamilyName(),
        user.getEmailVerified(),
        user.getLocale(),
        user.getHostedDomain(),
        admin,
        moderator,
        user.getAlias(),
        user.getProposedAlias(),
        user.getStatus(),
        user.getDateApproved());
  }
}
