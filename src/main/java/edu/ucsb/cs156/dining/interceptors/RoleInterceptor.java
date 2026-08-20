package edu.ucsb.cs156.dining.interceptors;

import edu.ucsb.cs156.dining.repositories.AdminRepository;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class RoleInterceptor implements HandlerInterceptor {

  private final AdminRepository adminRepository;

  private final ModeratorRepository moderatorRepository;

  @Value("#{'${app.admin.emails}'.split(',')}")
  private final List<String> adminEmails = new ArrayList<>();

  public RoleInterceptor(AdminRepository adminRepository, ModeratorRepository moderatorRepository) {
    this.adminRepository = adminRepository;
    this.moderatorRepository = moderatorRepository;
  }

  @Override
  public boolean preHandle(
      HttpServletRequest request, HttpServletResponse response, Object handler) {
    SecurityContext securityContext = SecurityContextHolder.getContext();
    Authentication authentication = securityContext.getAuthentication();

    if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
      OAuth2User oauthUser = oauthToken.getPrincipal();
      String email =
          oauthUser instanceof OidcUser oidcUser
              ? oidcUser.getEmail()
              : oauthUser.getAttribute("email");
      Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
      Set<GrantedAuthority> revisedAuthorities = new HashSet<>();

      authorities.stream()
          .filter(
              grantedAuth ->
                  !grantedAuth.getAuthority().equals("ROLE_ADMIN")
                      && !grantedAuth.getAuthority().equals("ROLE_MODERATOR"))
          .forEach(revisedAuthorities::add);

      if (adminEmails.contains(email) || adminRepository.existsByEmail(email)) {
        revisedAuthorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
      }
      if (moderatorRepository.existsByEmail(email)) {
        revisedAuthorities.add(new SimpleGrantedAuthority("ROLE_MODERATOR"));
      }

      Authentication newAuth =
          new OAuth2AuthenticationToken(
              oauthUser, revisedAuthorities, oauthToken.getAuthorizedClientRegistrationId());

      securityContext.setAuthentication(newAuth);
    }
    return true;
  }
}
