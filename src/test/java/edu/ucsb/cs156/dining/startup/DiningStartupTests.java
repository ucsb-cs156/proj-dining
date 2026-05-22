package edu.ucsb.cs156.dining.startup;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import edu.ucsb.cs156.dining.entities.Admin;
import edu.ucsb.cs156.dining.repositories.AdminRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

class DiningStartupTests {

  @Mock private AdminRepository adminRepository;

  private DiningStartup diningStartup;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    diningStartup = new DiningStartup();
    diningStartup.adminRepository = adminRepository;
    diningStartup.adminEmails = List.of("acdamstedt@ucsb.edu", "phtcon@ucsb.edu");
  }

  @Test
  void test_AlwaysRunOnStartup_saves_admins() {
    diningStartup.alwaysRunOnStartup();

    verify(adminRepository).save(new Admin("acdamstedt@ucsb.edu"));
    verify(adminRepository).save(new Admin("phtcon@ucsb.edu"));
    verifyNoMoreInteractions(adminRepository);
  }

  @Test
  void test_AlwaysRunOnStartup_handles_exception() {
    doThrow(new RuntimeException("Simulated error")).when(adminRepository).save(any(Admin.class));

    diningStartup.alwaysRunOnStartup();

    verify(adminRepository, times(1)).save(any(Admin.class));
  }
}
