package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.Admin;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface AdminRepository extends CrudRepository<Admin, Long> {
  /**
   * This method returns an Admin entity with a given email.
   *
   * @param email email address of the admin
   * @return Optional of Admin (empty if not found)
   */
  Optional<Admin> findByEmail(String email);

  List<Admin> findAllByEmail(String email);

  @Transactional
  long deleteByEmail(String email);

  boolean existsByEmail(String email);
}
