package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.Review;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The ReviewRepository is a repository for Review entities
 */
@Repository
public interface ReviewRepository extends CrudRepository<Review, Long> {
}
