package edu.ucsb.cs156.dining.interceptors;

import edu.ucsb.cs156.dining.repositories.AdminRepository;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class RoleInterceptor implements HandlerInterceptor {

  @Autowired AdminRepository adminRepository;

  @Autowired ModeratorRepository moderatorRepository;

  @Override
  public boolean preHandle(
      HttpServletRequest request, HttpServletResponse response, Object handler) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication instanceof OAuth2AuthenticationToken) {
      OAuth2User principal = ((OAuth2AuthenticationToken) authentication).getPrincipal();
      String email = principal.getAttribute("email");

      Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

      Set<GrantedAuthority> revisedAuthorities =
          authorities.stream()
              .filter(
                  grantedAuth ->
                      !grantedAuth.getAuthority().equals("ROLE_ADMIN")
                          && !grantedAuth.getAuthority().equals("ROLE_MODERATOR"))
              .collect(Collectors.toSet());

      if (adminRepository.existsByEmail(email)) {
        revisedAuthorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
      }

      if (moderatorRepository.existsByEmail(email)) {
        revisedAuthorities.add(new SimpleGrantedAuthority("ROLE_MODERATOR"));
      }

      Authentication newAuth =
          new OAuth2AuthenticationToken(
              principal,
              revisedAuthorities,
              (((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId()));

      SecurityContextHolder.getContext().setAuthentication(newAuth);
    }

    return true;
  }
}
