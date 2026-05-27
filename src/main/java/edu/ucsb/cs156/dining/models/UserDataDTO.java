package edu.ucsb.cs156.dining.models;

import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class UserDataDTO {
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
  private String alias;
  private String proposedAlias;
  private ModerationStatus status;
  private LocalDate dateApproved;
  private boolean admin;
  private boolean moderator;

  public static UserDataDTO from(User user, boolean isAdmin, boolean isModerator) {
    return UserDataDTO.builder()
        .id(user.getId())
        .email(user.getEmail())
        .googleSub(user.getGoogleSub())
        .pictureUrl(user.getPictureUrl())
        .fullName(user.getFullName())
        .givenName(user.getGivenName())
        .familyName(user.getFamilyName())
        .emailVerified(user.getEmailVerified())
        .locale(user.getLocale())
        .hostedDomain(user.getHostedDomain())
        .alias(user.getAlias())
        .proposedAlias(user.getProposedAlias())
        .status(user.getStatus())
        .dateApproved(user.getDateApproved())
        .admin(isAdmin)
        .moderator(isModerator)
        .build();
  }
}
