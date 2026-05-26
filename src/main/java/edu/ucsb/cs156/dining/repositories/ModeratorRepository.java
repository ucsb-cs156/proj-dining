package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.Moderator;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/** The ModeratorRepository is a repository for Moderator entities. */
@Repository
public interface ModeratorRepository extends CrudRepository<Moderator, Long> {
  /**
   * This method returns an Moderator entity with a given email.
   *
   * @param email email address of the moderator
   * @return Optional of Moderator (empty if not found)
   */
  Optional<Moderator> findByEmail(String email);

  List<Moderator> findAllByEmail(String email);

  @Transactional
  long deleteByEmail(String email);

  boolean existsByEmail(String email);
}
