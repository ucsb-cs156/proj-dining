package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nimbusds.openid.connect.sdk.claims.UserInfo;

import jakarta.validation.Valid;

/**
 * This is a REST controller for Reviews
 */

@Tag(name = "Review")
@RequestMapping("/api/reviews")
@RestController
@Slf4j
public class ReviewController extends ApiController {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(IllegalArgumentException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(errors);
    }

    @Autowired
    ReviewRepository reviewRepository;


    /**
     * This method returns a list of all Reviews.
     * 
     * @return a list of all Reviews
     */
    @Operation(summary = "List all Reviews")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Review> allReviews() {
        log.info("Attempting to log all reviews");
        Iterable<Review> reviews = reviewRepository.findAll();
        log.info("all reviews found, ", reviews);
        return reviews;
    }

    /**
     * This method allows a user to submit a review
     * 
     * @return message that says an review was added to the database
     * @param itemId         id of the item
     * @param dateItemServed localDataTime
     *                       All others params must not be parameters and instead
     *                       derived from data sources that are dynamic (Date), or
     *                       set to be null or some other signifier
     */
    @Operation(summary = "Create a new review")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/post")
    public Review postReview(
        @Parameter(name = "itemId") @RequestParam String itemId,
        @Parameter(description = "Comments by the reviewer, can be blank") @RequestParam(required = false) String reviewerComments,
        @Parameter(name = "itemsStars") @RequestParam Long itemsStars,
        @Parameter(name = "dateItemServed", description = "date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)") @RequestParam("dateItemServed") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateItemServed) // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) See: https://www.baeldung.com/spring-date-parameters

        throws JsonProcessingException {
        LocalDateTime now = LocalDateTime.now();
        Review review = new Review();
        review.setDateItemServed(dateItemServed);
        review.setDateCreated(now);

        // Ensures content of truly empty and sets to null if so
        if ((reviewerComments != null && !reviewerComments.trim().isEmpty())) {
            review.setReviewerComments(reviewerComments);
        }
        
        // Ensure user inputs rating 1-5
        if (itemsStars < 1 || itemsStars > 5) {
            throw new IllegalArgumentException("Items stars must be between 1 and 5.");
        }

        review.setItemsStars(itemsStars);

        review.setItemId(itemId);
        CurrentUser user = getCurrentUser();
        review.setStudentId(user.getUser().getId());
        review.setDateEdited(now);
        log.info("reviews={}", review);
        reviewRepository.save(review);
        return review;
    }

    /**
     * This method allows a user to get a list of reviews that they have previously made.
     * Only user can only get a list of their own reviews, and you cant request another persons reviews
     * @return a list of reviews sent by a given user
     */
    @Operation(summary = "Get all reviews a user has sent: only callable by the user")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/userReviews")
    public Iterable<Review> get_all_review_by_user_id(){
        CurrentUser user = getCurrentUser();
        long userId = user.getUser().getId();
        Iterable<Review> reviews = reviewRepository.findAllByStudentId(userId);
        return reviews;
    }
}
