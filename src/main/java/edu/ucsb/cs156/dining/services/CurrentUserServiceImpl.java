package edu.ucsb.cs156.dining.services;

import edu.ucsb.cs156.dining.entities.Admin;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.repositories.AdminRepository;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Slf4j
@Service("currentUser")
@Primary
public class CurrentUserServiceImpl extends CurrentUserService {

  @Autowired private UserRepository userRepository;

  @Autowired private AdminRepository adminRepository;

  @Autowired GrantedAuthoritiesService grantedAuthoritiesService;

  @Value("${app.admin.emails}")
  private final List<String> adminEmails = new ArrayList<>();

  public CurrentUser getCurrentUser() {
    CurrentUser cu = CurrentUser.builder().user(this.getUser()).roles(this.getRoles()).build();
    log.info("getCurrentUser returns {}", cu);
    return cu;
  }

  public User getOAuth2AuthenticatedUser(
      SecurityContext securityContext, Authentication authentication) {
    OAuth2User oAuthUser = ((OAuth2AuthenticationToken) authentication).getPrincipal();

    String email = oAuthUser.getAttribute("email");
    String googleSub = oAuthUser.getAttribute("sub");
    String pictureUrl = oAuthUser.getAttribute("picture");
    String fullName = oAuthUser.getAttribute("name");
    String givenName = oAuthUser.getAttribute("given_name");
    String familyName = oAuthUser.getAttribute("family_name");
    boolean emailVerified = oAuthUser.getAttribute("email_verified");
    String locale = oAuthUser.getAttribute("locale");
    if (locale == null) {
      locale = "";
    }

    String hostedDomain = oAuthUser.getAttribute("hd");
    if (hostedDomain == null) {
      hostedDomain = "";
    }

    if (adminEmails.contains(email) && !adminRepository.existsByEmail(email)) {
      adminRepository.save(Admin.builder().email(email).build());
    }

    Optional<User> ou = userRepository.findByEmail(email);

    if (ou.isPresent()) {
      return ou.get();
    }

    User u =
        User.builder()
            .googleSub(googleSub)
            .email(email)
            .pictureUrl(pictureUrl)
            .fullName(fullName)
            .givenName(givenName)
            .familyName(familyName)
            .emailVerified(emailVerified)
            .locale(locale)
            .hostedDomain(hostedDomain)
            .build();

    userRepository.save(u);
    return u;
  }

  public User getUser() {
    SecurityContext securityContext = SecurityContextHolder.getContext();
    Authentication authentication = securityContext.getAuthentication();

    if (authentication instanceof OAuth2AuthenticationToken) {
      return getOAuth2AuthenticatedUser(securityContext, authentication);
    }

    return null;
  }

  public Collection<? extends GrantedAuthority> getRoles() {
    return grantedAuthoritiesService.getGrantedAuthorities();
  }
}
