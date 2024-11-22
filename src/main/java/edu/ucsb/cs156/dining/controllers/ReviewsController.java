package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * This is a REST controller for Reviews
 */

@Tag(name = "Reviews")
@RequestMapping("/api/reviews")
@RestController
@Slf4j
public class ReviewsController extends ApiController {

    @Autowired
    ReviewRepository reviewsRepository;

    /**
     * List all reviews
     * 
     * @return an iterable of Review
     */
    @Operation(summary= "List all reviews")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Review> allReviews() {
        Iterable<Review> reviews = reviewsRepository.findAll();
        return reviews;
    }

    /**
     * List all reviews created by a specific user
     * 
     * @return an iterable of Review
     */
    @Operation(summary= "List all reviews created by a specific user")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public Iterable<Review> getReviewsByUser(
        @Parameter(name="userId") @RequestParam long userId) {
        Iterable<Review> reviews = reviewsRepository.findAllByReviewerId(userId);
        return reviews;
    }

    /**
     * List all reviews needing moderation
     * 
     * @return an iterable of Review
     */
    @Operation(summary= "List all reviews needing moderation")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/needsmoderation")
    public Iterable<Review> getReviewsNeedingModeration() {
        Iterable<Review> reviews = reviewsRepository.findAllByStatus("Awaiting Approval");
        return reviews;
    }

    /**
     * Create a new review
     * 
     * @param itemId            id of item in DiningCommonsMenuItem table
     * @param dateServed        date item was served
     * @param stars             rating from 0-5 inclusive
     * @param reviewText        reviewer comments
     * @return the saved review
     */
    @Operation(summary= "Create a new review")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/post")
    public Review postReview(
            @Parameter(name="itemId") @RequestParam long itemId,
            @Parameter(name="dateServed", description="date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS") @RequestParam("dateServed") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateServed,
            @Parameter(name="stars") @RequestParam long stars,
            @Parameter(name="reviewText") @RequestParam String reviewText)
            throws JsonProcessingException {

        // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        // See: https://www.baeldung.com/spring-date-parameters

        LocalDateTime createdDate = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);

        log.info("createdDate={}", createdDate.format(DateTimeFormatter.ISO_DATE_TIME));

        Review reviews = new Review();
        reviews.setReviewerId(getCurrentUser().getUser().getId());
        reviews.setItemId(itemId);
        reviews.setDateServed(dateServed);
        reviews.setStars(stars);
        reviews.setReviewText(reviewText);
        reviews.setStatus("Awaiting Moderation");
        reviews.setCreatedDate(createdDate);
        reviews.setLastEditedDate(createdDate);

        Review savedReview = reviewsRepository.save(reviews);

        return savedReview;
    }

}
