package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.Review;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The ReviewRepository is a repository for Review entities
 */
@Repository
public interface ReviewRepository extends CrudRepository<Review, Long> {
  /**
   * This method returns all Review entities with a given reviewerId.
   * @param reviewerId id of a reviewer (given in user table)
   * @return all Review entities with a given reviewerId
   */
  Iterable<Review> findAllByReviewerId(long reviewerId);

  /**
   * This method returns all Review entities with a given moderation status.
   * @param status "Awaiting Approval", "Approved", "Rejected"
   * @return all Review entities with a given status
   */
  Iterable<Review> findAllByStatus(String status);

}
