package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.Moderator;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/** The ModeratorRepository is a repository for Moderator entities. */
@Repository
public interface ModeratorRepository extends CrudRepository<Moderator, String> {
  /**
   * This method returns a Moderator entity with a given email.
   *
   * @param email email address of the moderator
   * @return Optional of Moderator (empty if not found)
   */
  Optional<Moderator> findByEmail(String email);

  boolean existsByEmail(String email);
}
