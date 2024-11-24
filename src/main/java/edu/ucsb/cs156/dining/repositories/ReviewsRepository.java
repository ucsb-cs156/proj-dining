package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.Reviews;

import org.springframework.beans.propertyeditors.StringArrayPropertyEditor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * The ReviewsRepository is a repository for DiningCommons Reviews entities
 */
@Repository
public interface ReviewsRepository extends CrudRepository<Reviews, Long> {
    Iterable<Reviews> findByUserId(Long userId);
}