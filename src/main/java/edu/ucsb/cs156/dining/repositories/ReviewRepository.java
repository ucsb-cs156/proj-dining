package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.Review;

import edu.ucsb.cs156.dining.entities.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

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

}
