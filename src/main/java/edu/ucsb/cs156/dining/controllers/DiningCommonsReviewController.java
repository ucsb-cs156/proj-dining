package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.DiningCommonsReview;
import edu.ucsb.cs156.dining.entities.UCSBDate;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.DiningCommonsReviewRepository;
import edu.ucsb.cs156.dining.repositories.UCSBDateRepository;
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


/**
 * This is a REST controller for DiningCommonsReview
 */

@Tag(name = "DiningCommonsReview")
@RequestMapping("/api/diningcommonsreview")
@RestController
@Slf4j
public class DiningCommonsReviewController extends ApiController {

    @Autowired
    DiningCommonsReviewRepository diningCommonsReviewRepository;
    
    /**
     * Create a new dining commons review -> all users
     * 
     * @param 
     * 
     * @return the saved dining commons review
     */

    @Operation(summary= "Create a new dining commons review")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public DiningCommonsReview postDiningCommonsReview(
           // FIX PARAMETERS 
             @Parameter(name="quarterYYYYQ") @RequestParam String quarterYYYYQ,
            @Parameter(name="name") @RequestParam String name,
            @Parameter(name="localDateTime", description="date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)") @RequestParam("localDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime localDateTime)
            throws JsonProcessingException {

        log.info("localDateTime={}", localDateTime);

        DiningCommonsReview diningCommonsReview = new DiningCommonsReview();
        diningCommonsReview.setQuarterYYYYQ(quarterYYYYQ);
        // FIX SETTING PARAMETERS

        DiningCommonsReview savedDiningCommonsReview = diningCommonsReviewRepository.save(diningCommonsReview);

        return savedDiningCommonsReview;
    }


    /**
     * List all dining commons reviews -> ADMIN ONLY
     * 
     * @return an iterable of DiningCommonsReview
     */
    @Operation(summary= "List all dining commons reviews")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<DiningCommonsReview> allDiningCommonsReviewAdminOnly() {
        // MAKE IT SO ONLY ADMIN CAN VIEW ALL REVIEWS
        Iterable<DiningCommonsReview> reviews = diningCommonsReviewRepository.findAll();
        return reviews;
    }
}