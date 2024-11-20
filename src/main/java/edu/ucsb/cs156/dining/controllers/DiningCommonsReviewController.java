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
     */

    @Operation(summary= "Create a new dining commons review")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/post")
    public DiningCommonsReview postDiningCommonsReview(
           
            @Parameter(name="studentUserId") @RequestParam long studentuserId,
            @Parameter(name="itemId") @RequestParam long itemId,
            @Parameter(name="itemServedDate", description="date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS") @RequestParam("itemServedDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime itemServedDate,
            @Parameter(name="status") @RequestParam String status,
            @Parameter(name="moderatorUserId") @RequestParam long moderatorUserId,
            @Parameter(name="moderatorComments") @RequestParam String moderatorComments,
            @Parameter(name="createdDate", description="date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS") @RequestParam("createdDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdDate,
            @Parameter(name="lastEditedDate", description="date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS") @RequestParam("lastEditedDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime lastEditedDate)
    
            throws JsonProcessingException {

        log.info("itemServedDate={}", itemServedDate);

        DiningCommonsReview diningCommonsReview = new DiningCommonsReview();
        diningCommonsReview.setStudentUserId(studentuserId);
        diningCommonsReview.setItemId(itemId);
        diningCommonsReview.setItemServedDate(itemServedDate);
        diningCommonsReview.setStatus(status);
        diningCommonsReview.setModeratorUserId(moderatorUserId);
        diningCommonsReview.setModeratorComments(moderatorComments);
        diningCommonsReview.setCreatedDate(createdDate);
        diningCommonsReview.setLastEditedDate(lastEditedDate);

        DiningCommonsReview savedDiningCommonsReview = diningCommonsReviewRepository.save(diningCommonsReview);

        return savedDiningCommonsReview;
    }


    /**
     * List all dining commons reviews -> ADMIN ONLY
     * 
     * @return an iterable of DiningCommonsReview
     */
    @Operation(summary= "List all dining commons reviews")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<DiningCommonsReview> allDiningCommonsReviewAdminOnly() {
        // MAKE IT SO ONLY ADMIN CAN VIEW ALL REVIEWS
        Iterable<DiningCommonsReview> reviews = diningCommonsReviewRepository.findAll();
        return reviews;
    }
}