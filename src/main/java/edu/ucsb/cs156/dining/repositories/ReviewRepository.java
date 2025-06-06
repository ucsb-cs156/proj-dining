package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.Review;

import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * The ReviewRepository is a repository for Review entities
 */
@Repository
public interface ReviewRepository extends CrudRepository<Review, Long> {


    /**
     * 
     * @param user
     * @return all reviews that have come from a single reviewer, ex say this user has made a few reviews over the past year
     * well then this method will return only the reviews that this user has sent 
     */

    Iterable<Review> findByReviewer(User user);

    Iterable<Review> findByStatus(ModerationStatus moderationStatus);

    @Query("SELECT AVG(r.itemsStars) FROM reviews r WHERE r.item.id = :itemId")
    Optional<Double> findAverageScoreByItemId(@Param("itemId") Long itemId);


}
