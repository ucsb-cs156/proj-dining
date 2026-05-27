package edu.ucsb.cs156.dining.services;

import com.google.common.collect.Lists;
import edu.ucsb.cs156.dining.entities.Admin;
import edu.ucsb.cs156.dining.entities.Moderator;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.models.UserDataDTO;
import edu.ucsb.cs156.dining.repositories.AdminRepository;
import edu.ucsb.cs156.dining.repositories.ModeratorRepository;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserDataDTOService {
  private final UserRepository userRepository;
  private final AdminRepository adminRepository;
  private final ModeratorRepository moderatorRepository;

  @Autowired
  public UserDataDTOService(
      UserRepository userRepository,
      AdminRepository adminRepository,
      ModeratorRepository moderatorRepository) {
    this.userRepository = userRepository;
    this.adminRepository = adminRepository;
    this.moderatorRepository = moderatorRepository;
  }

  public Page<UserDataDTO> getUserDataDTOs(Pageable pageable) {
    Page<User> users = userRepository.findAll(pageable);
    List<Admin> admins = Lists.newArrayList(adminRepository.findAll());
    List<Moderator> moderators = Lists.newArrayList(moderatorRepository.findAll());

    List<UserDataDTO> userDTOs = new ArrayList<>();

    for (User user : users) {
      boolean isAdmin = admins.stream().anyMatch(a -> a.getEmail().equals(user.getEmail()));
      boolean isModerator = moderators.stream().anyMatch(m -> m.getEmail().equals(user.getEmail()));

      userDTOs.add(UserDataDTO.from(user, isAdmin, isModerator));
    }

    return new PageImpl<>(userDTOs, pageable, users.getTotalElements());
  }
}
