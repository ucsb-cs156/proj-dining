package edu.ucsb.cs156.dining.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import edu.ucsb.cs156.dining.entities.Admin;
import edu.ucsb.cs156.dining.entities.Moderator;
import edu.ucsb.cs156.dining.services.wiremock.WiremockService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@DataJpaTest
public class RoleRepositoryTests {

  @Autowired AdminRepository adminRepository;

  @Autowired ModeratorRepository moderatorRepository;

  @MockBean WiremockService wiremockService;

  @Test
  @Transactional(propagation = Propagation.NOT_SUPPORTED)
  public void deleteByEmail_deletes_admin() {
    adminRepository.save(new Admin("admin@example.org"));

    long deleted = adminRepository.deleteByEmail("admin@example.org");

    assertEquals(1, deleted);
    assertFalse(adminRepository.existsByEmail("admin@example.org"));
  }

  @Test
  @Transactional(propagation = Propagation.NOT_SUPPORTED)
  public void deleteByEmail_deletes_moderator() {
    moderatorRepository.save(new Moderator("moderator@example.org"));

    long deleted = moderatorRepository.deleteByEmail("moderator@example.org");

    assertEquals(1, deleted);
    assertFalse(moderatorRepository.existsByEmail("moderator@example.org"));
  }
}
