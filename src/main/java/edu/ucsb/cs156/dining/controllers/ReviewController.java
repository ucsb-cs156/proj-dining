package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.models.EditedReview;
import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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
import org.springframework.web.server.ResponseStatusException;

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

    @Autowired
    MenuItemRepository menuItemRepository;

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
            @Parameter(name = "itemId") @RequestParam long itemId,
            @Parameter(description = "Comments by the reviewer, can be blank") @RequestParam(required = false) String reviewerComments,
            @Parameter(name = "itemsStars") @RequestParam Long itemsStars,
            @Parameter(name = "dateItemServed", description = "date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)") @RequestParam("dateItemServed") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateItemServed) // For
            throws JsonProcessingException {
        LocalDateTime now = LocalDateTime.now();
        Review review = new Review();
        review.setDateItemServed(dateItemServed);

        // Reviewer comments moderation logic
        if (reviewerComments != null && !reviewerComments.trim().isEmpty()) {
            review.setReviewerComments(reviewerComments);
        } else {
            review.setStatus(ModerationStatus.APPROVED); // auto-approve
        }
        


        // Ensure user inputs rating 1-5
        if (itemsStars < 1 || itemsStars > 5) {
            throw new IllegalArgumentException("Items stars must be between 1 and 5.");
        }

        review.setItemsStars(itemsStars);

        MenuItem reviewedItem = menuItemRepository.findById(itemId).orElseThrow(
                () -> new EntityNotFoundException(MenuItem.class, itemId)
        );
        review.setItem(reviewedItem);
        CurrentUser user = getCurrentUser();
        review.setReviewer(user.getUser());
        log.info("reviews={}", review);
        review = reviewRepository.save(review);
        return review;
    }

    @Operation(summary = "Get a single review by id")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/get")
    public Review getReview(@Parameter(name = "id") @RequestParam Long id) {
        log.info("Attempting to get review with id {}", id);
        
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Review.class, id));
        
        // Check if user has permission to view this review
        User currentUser = getCurrentUser().getUser();
        
        // User can view their own reviews or if they are an admin
        if (currentUser.getId() != review.getReviewer().getId() && !currentUser.getAdmin()) {
            throw new AccessDeniedException("You don't have permission to view this review");
        }
        
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
        Iterable<Review> reviews = reviewRepository.findByReviewer(user.getUser());
        return reviews;
    }

    @Operation(summary = "Edit a review")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PutMapping("/reviewer")
    public Review editReview(@Parameter Long id, @RequestBody @Valid EditedReview incoming) {

        Review oldReview = reviewRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException(Review.class, id)
        );
        User current = getCurrentUser().getUser();
        if(current.getId() != oldReview.getReviewer().getId()) {
            throw new AccessDeniedException("No permission to edit review");
        }

        if(incoming.getItemStars() < 1 || incoming.getItemStars() > 5) {
            throw new IllegalArgumentException("Items stars must be between 1 and 5.");
        }else{
            oldReview.setItemsStars(incoming.getItemStars());
        }

        if (incoming.getReviewerComments() != null &&!incoming.getReviewerComments().trim().isEmpty()) {
            oldReview.setReviewerComments(incoming.getReviewerComments());
        }else{
            oldReview.setReviewerComments(null);
        }

        oldReview.setDateItemServed(incoming.getDateItemServed());

        oldReview.setStatus(ModerationStatus.AWAITING_REVIEW);
        oldReview.setModeratorComments(null);

        Review review = reviewRepository.save(oldReview);

        return review;
    }

    @Operation(summary = "Delete a review")
    @PreAuthorize("hasRole('ROLE_USER')")
    @DeleteMapping("/reviewer")
    public Object deleteReview(@Parameter Long id) {
        Review review = reviewRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException(Review.class, id)
        );

        User current = getCurrentUser().getUser();
        if(current.getId() != review.getReviewer().getId() && !current.getAdmin()) {
            throw new AccessDeniedException("No permission to delete review");
        }

        reviewRepository.delete(review);
        return genericMessage("Review with id %s deleted".formatted(id));
    }

    @Operation(summary = "Moderate a review")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/moderate")
    public Review moderateReview(@Parameter Long id, @Parameter ModerationStatus status, @Parameter String moderatorComments) {
        Review review = reviewRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException(Review.class, id)
        );

        review.setModeratorComments(moderatorComments);
        review.setStatus(status);

        review = reviewRepository.save(review);
        return review;
    }

    @Operation(summary = "See reviews that need moderation")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/needsmoderation")
    public Iterable<Review> needsmoderation() {
        Iterable<Review> reviewsList = reviewRepository.findByStatus(ModerationStatus.AWAITING_REVIEW);
        return reviewsList;
    }
}
