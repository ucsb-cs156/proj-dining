package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/** The UserRepository is a repository for User entities. */
@Repository
public interface UserRepository extends CrudRepository<User, Long> {
  /**
   * This method returns a User entity with a given email.
   *
   * @param email email address of the user
   * @return Optional of User (empty if not found)
   */
  Optional<User> findByEmail(String email);

  /**
   * This method returns a User entity with an alias.
   *
   * @param alias alias of the user
   * @return Optional of User (empty if not found)
   */
  Optional<User> findByAlias(String alias);

  /** This method returns a list of users with proposed alias that is not null. */
  List<User> findByProposedAliasNotNull();

  List<User> findByStatusAndProposedAliasNotNull(ModerationStatus status);
}
