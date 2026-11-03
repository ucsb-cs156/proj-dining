package edu.ucsb.cs156.dining.services;

import edu.ucsb.cs156.dining.entities.Moderator;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Emails all moderators when a review needs moderation. The email is sent through the Gmail API
 * from the account of the logged-in user who submitted the review, using their OAuth token (this
 * requires the gmail.send scope).
 *
 * <p>Sending is best effort: any failure is logged and never stops the review from being saved.
 */
@Slf4j
@Service
public class ModeratorNotificationService {

  static final String GMAIL_SEND_URL =
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

  private final OAuth2AuthorizedClientService authorizedClientService;
  private final ModeratorRepository moderatorRepository;
  private final RestTemplate restTemplate;

  // On dokku the app's address is <app name>.<dokku host>, e.g. dining-qa.dokku-00.cs.ucsb.edu
  @Value("${app.name}")
  private String appName;

  @Value("${app.hostname}")
  private String appHostname;

  public ModeratorNotificationService(
      OAuth2AuthorizedClientService authorizedClientService,
      ModeratorRepository moderatorRepository,
      RestTemplateBuilder restTemplateBuilder) {
    this.authorizedClientService = authorizedClientService;
    this.moderatorRepository = moderatorRepository;
    // Finite timeouts so a slow Gmail API can't hang the review submission request.
    this.restTemplate =
        restTemplateBuilder
            .connectTimeout(Duration.ofSeconds(5))
            .readTimeout(Duration.ofSeconds(10))
            .build();
  }

  /** Sends the notification email. Never throws. */
  public void notifyModerators(Review review) {
    try {
      String accessToken = currentUserGoogleAccessToken();
      if (accessToken == null) {
        log.warn("Not emailing moderators: no Google access token for the current user");
        return;
      }

      List<String> recipients =
          StreamSupport.stream(moderatorRepository.findAll().spliterator(), false)
              .map(Moderator::getEmail)
              .filter(ModeratorNotificationService::isSafeEmail)
              .toList();
      if (recipients.isEmpty()) {
        log.info("Not emailing moderators: there are no moderators");
        return;
      }

      HttpHeaders headers = new HttpHeaders();
      headers.setBearerAuth(accessToken);
      headers.setContentType(MediaType.APPLICATION_JSON);
      Map<String, String> body = Map.of("raw", buildRawMessage(recipients, review));
      restTemplate.postForEntity(GMAIL_SEND_URL, new HttpEntity<>(body, headers), String.class);
      log.info("Emailed {} moderator(s) about review {}", recipients.size(), review.getId());
    } catch (Exception e) {
      log.error("Failed to email moderators about review {}", review.getId(), e);
    }
  }

  /** Returns the current user's Google access token, or null if there isn't a usable one. */
  private String currentUserGoogleAccessToken() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (!(auth instanceof OAuth2AuthenticationToken oauthToken)) {
      return null;
    }
    // Only the real Google login can call the Gmail API (not the mock provider used in tests).
    if (!"google".equals(oauthToken.getAuthorizedClientRegistrationId())) {
      return null;
    }
    OAuth2AuthorizedClient client =
        authorizedClientService.loadAuthorizedClient("google", oauthToken.getName());
    if (client == null || client.getAccessToken() == null) {
      return null;
    }
    if (!client
        .getAccessToken()
        .getScopes()
        .contains("https://www.googleapis.com/auth/gmail.send")) {
      // User logged in before the scope was added; they need to log out and back in.
      return null;
    }
    return client.getAccessToken().getTokenValue();
  }

  /** Builds a base64url-encoded RFC 2822 email, as the Gmail API expects. */
  private String buildRawMessage(List<String> recipients, Review review) {
    // Bcc so the submitting student doesn't see the moderators' addresses.
    String message =
        "Bcc: "
            + String.join(", ", recipients)
            + "\r\n"
            + "Subject: A new dining review needs moderation\r\n"
            + "Content-Type: text/plain; charset=UTF-8\r\n"
            + "\r\n"
            + "A new review (id "
            + review.getId()
            + ") was submitted and is waiting for moderation.\r\n\r\n"
            + "Review it here: https://"
            + appName
            + "."
            + appHostname
            + "/moderate\r\n";
    return Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(message.getBytes(StandardCharsets.UTF_8));
  }

  /** Rejects values that could inject extra email headers. */
  private static boolean isSafeEmail(String email) {
    return email != null && !email.isBlank() && email.indexOf('\r') < 0 && email.indexOf('\n') < 0;
  }
}
