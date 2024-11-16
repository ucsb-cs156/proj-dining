package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.CurrentUser;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The CurrentUserRepository is a repository for CurrentUser entities
 */
@Repository
public interface CurrentUserRepository extends CrudRepository<CurrentUser, String> {
}
