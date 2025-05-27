package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

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
    
}
