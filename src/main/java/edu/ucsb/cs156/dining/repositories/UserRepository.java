package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

/**
* The UserRepository is a repository for User entities.
*/
@Repository
public interface UserRepository extends CrudRepository<User, Long> {
 /**
  * This method returns a User entity with a given email.
  * @param email email address of the user
  * @return Optional of User (empty if not found)
  */
 Optional<User> findByEmail(String email);

 /**
  * This method returns a User entity with an alias.
  * @param alias alias of the user
  * @return Optional of User (empty if not found)
  */
 Optional<User> findByAlias(String alias);

 /**
  * This method returns a list of users with proposed alias
    that is not null.
  */
 List<User> findByProposedAliasNotNull();

}
