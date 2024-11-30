package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.entities.Reviews;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.ReviewsRepository;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.apache.commons.lang3.time.DateFormatUtils;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import jakarta.validation.Valid;



/**
 * This is a REST controller for Reviews
 */

@Tag(name = "Reviews")
@RequestMapping("/api/reviews")
@RestController
@Slf4j
public class ReviewsController extends ApiController {

    @Autowired
    ReviewsRepository reviewsRepository;

    @Autowired
    MenuItemRepository menuItemRepository;

    /**
     * THis method returns a list of all reviews.
     * @return a list of all reviews
     */
    @Operation(summary= "List all ucsb reviews of dining commons")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Reviews> allReviews() {
        Iterable<Reviews> reviews = reviewsRepository.findAll();
        return reviews;
    }

   /**
     * This method creates a new review. Accessible only to users with the role "ROLE_ADMIN".
     * @param item_id itemID of the review
     * @param date_served date served 
     * @return the save review
     */
    @Operation(summary= "Create a new review")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/post")
    public Reviews postReview(
        @Parameter(name="item_id") @RequestParam int item_id,
        @Parameter(name="rating") @RequestParam int rating,
        @Parameter(name="comments") @RequestParam String comments,
        @Parameter(name="date_served", description="date (in iso format, e.g. 2024-08-24T11:11:11; see https://en.wikipedia.org/wiki/ISO_8601)") @RequestParam("date_served") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date_served)
            throws JsonProcessingException

        {

        if (rating <= 0 || rating >= 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 0 and 5");
        }

        MenuItem menuItem = menuItemRepository.findById((long)item_id)
        .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "No MenuItem with itemId: " + item_id + " found"));

        Reviews reviews = new Reviews();
        CurrentUser user = getCurrentUser();
        
        reviews.setItem_id(item_id);
        reviews.setRating(rating);
        reviews.setComments(comments);
        reviews.setDate_served(date_served);
        reviews.setStatus("Awaiting Moderation");
        reviews.setUserId(user.getUser().getId());

        Reviews savedReviews = reviewsRepository.save(reviews);

        return savedReviews; 
    }
    
    /**
         * This method returns all reviews from current user.
         * @return all reviews from current user.
         */
        @Operation(summary = "Get reviews from an user")
        @PreAuthorize("hasRole('ROLE_USER')")
        @GetMapping("")
        public Iterable<Reviews> getByCurrUserId() {
            CurrentUser user = getCurrentUser();
            long currUserId = user.getUser().getId();
            Iterable<Reviews> reviews = reviewsRepository.findByUserId(currUserId);
            return reviews;
        }

}
