package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.entities.Reviews;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.entities.UCSBDiningCommons;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.ReviewsRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
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

import org.springframework.security.web.bind.annotation.AuthenticationPrincipal;

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
     * @param status status of the review
     * @return the save review
     */
    @Operation(summary= "Create a new review")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/post")
    public Reviews postReview(
        @Parameter(name="item_id") @RequestParam int item_id,
        @Parameter(name="date_served") @RequestParam String date_served,
        @Parameter(name="status") @RequestParam(required=false) String status
        ) 
        {

        Reviews reviews = new Reviews();
        CurrentUser user = getCurrentUser();
        
        reviews.setStudent_id((int)user.getUser().getId());
        reviews.setItem_id(item_id);
        reviews.setDate_served(date_served);
        reviews.setStatus(status != null ? status : "Awaiting Moderation");
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
