package edu.ucsb.cs156.dining.interceptors;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.repositories.AdminRepository;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import java.time.Instant;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@SpringBootTest
@AutoConfigureMockMvc
public class RoleInterceptorTests extends ControllerTestCase {

  @MockBean AdminRepository adminRepository;
  @MockBean ModeratorRepository moderatorRepository;

  @Autowired private RequestMappingHandlerMapping mapping;

  @BeforeEach
  public void mockLogin() {
    Map<String, Object> attributes = new HashMap<>();
    attributes.put("sub", "sub");
    attributes.put("name", "name");
    attributes.put("email", "cgaucho@ucsb.edu");
    attributes.put("picture", "picture");
    attributes.put("given_name", "given_name");
    attributes.put("family_name", "family_name");
    attributes.put("email_verified", true);
    attributes.put("locale", "locale");
    attributes.put("hd", "hd");

    Set<GrantedAuthority> authorities = new HashSet<>();
    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
    authorities.add(new SimpleGrantedAuthority("ROLE_MODERATOR"));
    authorities.add(new SimpleGrantedAuthority("ROLE_MEMBER"));

    OAuth2User user = new DefaultOAuth2User(authorities, attributes, "name");
    Authentication authentication =
        new OAuth2AuthenticationToken(user, authorities, "userRegistrationId");

    SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
    SecurityContextHolder.getContext().setAuthentication(authentication);
  }

  @Test
  public void RoleInterceptorIsPresent() throws Exception {

    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    HandlerExecutionChain chain = mapping.getHandler(request);

    assert chain != null;
    Optional<HandlerInterceptor> RoleInterceptor =
        chain.getInterceptorList().stream().filter(RoleInterceptor.class::isInstance).findFirst();

    assertTrue(RoleInterceptor.isPresent());
  }

  @Test
  public void does_nothing_when_authentication_is_not_oauth2() throws Exception {
    Set<GrantedAuthority> authorities = new HashSet<>();
    authorities.add(new SimpleGrantedAuthority("ROLE_MEMBER"));
    Authentication authentication =
        new TestingAuthenticationToken("cgaucho", "password", authorities);

    SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
    SecurityContextHolder.getContext().setAuthentication(authentication);

    RoleInterceptor roleInterceptor = new RoleInterceptor(adminRepository, moderatorRepository);

    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    MockHttpServletResponse response = new MockHttpServletResponse();

    assertTrue(roleInterceptor.preHandle(request, response, new Object()));

    verify(adminRepository, never()).existsByEmail("cgaucho@ucsb.edu");
    verify(moderatorRepository, never()).existsByEmail("cgaucho@ucsb.edu");
    assertTrue(
        SecurityContextHolder.getContext()
            .getAuthentication()
            .getAuthorities()
            .containsAll(authorities));
  }

  @Test
  public void removes_admin_role_when_user_not_in_admin_repository() throws Exception {
    when(adminRepository.existsByEmail("cgaucho@ucsb.edu")).thenReturn(false);
    when(moderatorRepository.existsByEmail("cgaucho@ucsb.edu")).thenReturn(true);

    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    HandlerExecutionChain chain = mapping.getHandler(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    assert chain != null;
    Optional<HandlerInterceptor> RoleInterceptor =
        chain.getInterceptorList().stream().filter(RoleInterceptor.class::isInstance).findFirst();

    assertTrue(RoleInterceptor.isPresent());

    RoleInterceptor.get().preHandle(request, response, chain.getHandler());

    verify(adminRepository, times(1)).existsByEmail("cgaucho@ucsb.edu");
    verify(moderatorRepository, times(1)).existsByEmail("cgaucho@ucsb.edu");

    Collection<? extends GrantedAuthority> authorities =
        SecurityContextHolder.getContext().getAuthentication().getAuthorities();

    boolean role_admin =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_ADMIN"));
    boolean role_moderator =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_MODERATOR"));
    boolean role_member =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_MEMBER"));
    assertFalse(role_admin, "ROLE_ADMIN should not be in roles list");
    assertTrue(role_moderator, "ROLE_MODERATOR should be in roles list");
    assertTrue(role_member, "ROLE_MEMBER should be in roles list");
  }

  @Test
  public void removes_moderator_role_when_user_not_in_moderator_repository() throws Exception {
    when(adminRepository.existsByEmail("cgaucho@ucsb.edu")).thenReturn(true);
    when(moderatorRepository.existsByEmail("cgaucho@ucsb.edu")).thenReturn(false);

    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    HandlerExecutionChain chain = mapping.getHandler(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    assert chain != null;
    Optional<HandlerInterceptor> RoleInterceptor =
        chain.getInterceptorList().stream().filter(RoleInterceptor.class::isInstance).findFirst();

    assertTrue(RoleInterceptor.isPresent());

    RoleInterceptor.get().preHandle(request, response, chain.getHandler());

    verify(adminRepository, times(1)).existsByEmail("cgaucho@ucsb.edu");
    verify(moderatorRepository, times(1)).existsByEmail("cgaucho@ucsb.edu");

    Collection<? extends GrantedAuthority> authorities =
        SecurityContextHolder.getContext().getAuthentication().getAuthorities();

    boolean role_admin =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_ADMIN"));
    boolean role_moderator =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_MODERATOR"));
    boolean role_member =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_MEMBER"));
    assertTrue(role_admin, "ROLE_ADMIN should not be in roles list");
    assertFalse(role_moderator, "ROLE_MODERATOR should be in roles list");
    assertTrue(role_member, "ROLE_MEMBER should be in roles list");
  }

  @Test
  public void keeps_admin_and_moderator_roles_when_user_is_in_both_repositories() throws Exception {
    when(adminRepository.existsByEmail("cgaucho@ucsb.edu")).thenReturn(true);
    when(moderatorRepository.existsByEmail("cgaucho@ucsb.edu")).thenReturn(true);

    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    HandlerExecutionChain chain = mapping.getHandler(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    assert chain != null;
    Optional<HandlerInterceptor> RoleInterceptor =
        chain.getInterceptorList().stream().filter(RoleInterceptor.class::isInstance).findFirst();

    assertTrue(RoleInterceptor.isPresent());

    RoleInterceptor.get().preHandle(request, response, chain.getHandler());

    verify(adminRepository, times(1)).existsByEmail("cgaucho@ucsb.edu");
    verify(moderatorRepository, times(1)).existsByEmail("cgaucho@ucsb.edu");

    Collection<? extends GrantedAuthority> authorities =
        SecurityContextHolder.getContext().getAuthentication().getAuthorities();

    boolean role_admin =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_ADMIN"));
    boolean role_moderator =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_MODERATOR"));
    boolean role_member =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_MEMBER"));
    assertTrue(role_admin, "ROLE_ADMIN should not be in roles list");
    assertTrue(role_moderator, "ROLE_MODERATOR should be in roles list");
    assertTrue(role_member, "ROLE_MEMBER should be in roles list");
  }

  @Test
  public void keeps_admin_role_when_user_is_in_admin_emails() throws Exception {
    when(moderatorRepository.existsByEmail("cgaucho@ucsb.edu")).thenReturn(true);

    RoleInterceptor roleInterceptor = new RoleInterceptor(adminRepository, moderatorRepository);
    ReflectionTestUtils.setField(roleInterceptor, "adminEmails", List.of("cgaucho@ucsb.edu"));

    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    MockHttpServletResponse response = new MockHttpServletResponse();

    assertTrue(roleInterceptor.preHandle(request, response, new Object()));

    verify(adminRepository, never()).existsByEmail("cgaucho@ucsb.edu");
    verify(moderatorRepository, times(1)).existsByEmail("cgaucho@ucsb.edu");

    Collection<? extends GrantedAuthority> authorities =
        SecurityContextHolder.getContext().getAuthentication().getAuthorities();

    boolean role_admin =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_ADMIN"));
    boolean role_moderator =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_MODERATOR"));
    boolean role_member =
        authorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_MEMBER"));
    assertTrue(role_admin, "ROLE_ADMIN should be in roles list");
    assertTrue(role_moderator, "ROLE_MODERATOR should be in roles list");
    assertTrue(role_member, "ROLE_MEMBER should be in roles list");
  }

  @Test
  public void gets_email_from_oidc_user() throws Exception {
    Map<String, Object> claims = new HashMap<>();
    claims.put("sub", "sub");
    claims.put("email", "oidc-user@ucsb.edu");

    Set<GrantedAuthority> authorities = new HashSet<>();
    authorities.add(new SimpleGrantedAuthority("ROLE_MEMBER"));

    OidcIdToken idToken =
        new OidcIdToken("token", Instant.now(), Instant.now().plusSeconds(3600), claims);
    OAuth2User user = new DefaultOidcUser(authorities, idToken);
    Authentication authentication =
        new OAuth2AuthenticationToken(user, authorities, "userRegistrationId");

    SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
    SecurityContextHolder.getContext().setAuthentication(authentication);

    when(adminRepository.existsByEmail("oidc-user@ucsb.edu")).thenReturn(true);
    when(moderatorRepository.existsByEmail("oidc-user@ucsb.edu")).thenReturn(false);

    RoleInterceptor roleInterceptor = new RoleInterceptor(adminRepository, moderatorRepository);

    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/currentUser");
    MockHttpServletResponse response = new MockHttpServletResponse();

    assertTrue(roleInterceptor.preHandle(request, response, new Object()));

    verify(adminRepository, times(1)).existsByEmail("oidc-user@ucsb.edu");
    verify(moderatorRepository, times(1)).existsByEmail("oidc-user@ucsb.edu");

    Collection<? extends GrantedAuthority> revisedAuthorities =
        SecurityContextHolder.getContext().getAuthentication().getAuthorities();

    boolean role_admin =
        revisedAuthorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_ADMIN"));
    boolean role_moderator =
        revisedAuthorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_MODERATOR"));
    boolean role_member =
        revisedAuthorities.stream()
            .anyMatch(grantedAuth -> grantedAuth.getAuthority().equals("ROLE_MEMBER"));

    assertTrue(role_admin, "ROLE_ADMIN should be in roles list");
    assertFalse(role_moderator, "ROLE_MODERATOR should not be in roles list");
    assertTrue(role_member, "ROLE_MEMBER should be in roles list");
  }
}
