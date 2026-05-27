package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** The ReviewRepository is a repository for Review entities */
@Repository
public interface ReviewRepository extends CrudRepository<Review, Long> {

  /**
   * @param user
   * @return all reviews that have come from a single reviewer, ex say this user has made a few
   *     reviews over the past year well then this method will return only the reviews that this
   *     user has sent
   */
  Iterable<Review> findByReviewer(User user);

  Iterable<Review> findByStatus(ModerationStatus moderationStatus);

  Iterable<Review> findByItemAndStatus(MenuItem item, ModerationStatus approved);

  @Query("SELECT COUNT(r) FROM reviews r WHERE r.status = :status")
  long countByStatus(@Param("status") ModerationStatus status);

  @Query("SELECT COUNT(DISTINCT r.item.id) FROM reviews r WHERE r.status = :status")
  long countDistinctItemsByStatus(@Param("status") ModerationStatus status);

  @Query("SELECT COUNT(DISTINCT r.item.diningCommonsCode) FROM reviews r WHERE r.status = :status")
  long countDistinctCommonsByStatus(@Param("status") ModerationStatus status);

  @Query("SELECT MAX(r.dateEdited) FROM reviews r WHERE r.status = :status")
  LocalDateTime findMaxDateEditedByStatus(@Param("status") ModerationStatus status);
}
