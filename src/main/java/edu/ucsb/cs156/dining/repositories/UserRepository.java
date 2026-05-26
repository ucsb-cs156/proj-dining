package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** The UserRepository is a repository for User entities. */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);

  Optional<User> findByAlias(String alias);

  List<User> findByProposedAliasNotNull();

  List<User> findByStatusAndProposedAliasNotNull(ModerationStatus status);
}
