package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import edu.ucsb.cs156.dining.entities.Admin;
import edu.ucsb.cs156.dining.entities.Moderator;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.models.UserDataDTO;
import edu.ucsb.cs156.dining.repositories.AdminRepository;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

public class UserDataDTOServiceTests {

  @Mock UserRepository userRepository;

  @Mock AdminRepository adminRepository;

  @Mock ModeratorRepository moderatorRepository;

  @InjectMocks UserDataDTOService userDataService;

  @BeforeEach
  public void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  public void service_properly_translates_user_data_to_dto() {
    User u1 = User.builder().id(1L).email("djensen@ucsb.edu").build();
    User u2 = User.builder().id(2L).email("cgaucho@ucsb.edu").build();
    User u3 = User.builder().id(3L).email("jgaucho@ucsb.edu").build();

    Admin admin = Admin.builder().email(u1.getEmail()).build();
    Moderator moderator = Moderator.builder().email(u2.getEmail()).build();

    ArrayList<User> expectedUsers = new ArrayList<>(Arrays.asList(u1, u2, u3));

    ArrayList<Admin> expectedAdmins = new ArrayList<>();
    expectedAdmins.add(admin);

    ArrayList<Moderator> expectedModerators = new ArrayList<>();
    expectedModerators.add(moderator);

    List<UserDataDTO> userDTOS = new ArrayList<>();
    userDTOS.add(UserDataDTO.from(u1, true, false));
    userDTOS.add(UserDataDTO.from(u2, false, true));
    userDTOS.add(UserDataDTO.from(u3, false, false));

    PageImpl<User> page = new PageImpl<>(expectedUsers);

    Pageable pageable = Pageable.unpaged();

    when(userRepository.findAll(eq(pageable))).thenReturn(page);
    when(adminRepository.findAll()).thenReturn(expectedAdmins);
    when(moderatorRepository.findAll()).thenReturn(expectedModerators);

    assertEquals(userDTOS, userDataService.getUserDataDTOs(pageable).getContent());
  }
}
