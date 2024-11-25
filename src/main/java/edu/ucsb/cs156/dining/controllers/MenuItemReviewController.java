package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.MenuItemReview;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.MenuItemReviewRepository;
import edu.ucsb.cs156.dining.services.CurrentUserService;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
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
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import jakarta.validation.Valid;
import java.time.LocalDateTime;


/**
 * This is a REST controller for MenuItemReview
 */

@Tag(name = "MenuItemReview")
@RequestMapping("/api/menuitemreviews")
@RestController
@Slf4j
public class MenuItemReviewController extends ApiController {

    @Autowired
    MenuItemReviewRepository menuItemReviewRepository;

    @Autowired
    MenuItemRepository menuItemRepository;

    @Autowired
    private CurrentUserService currentUserService;
    
    /**
     * Create a new menu item review -> all users
     */

    @Operation(summary= "Create a new menu item review")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/post")
    public MenuItemReview postMenuItemReview(
            @Parameter(name="itemId") @RequestParam long itemId,
            @Parameter(name="itemServedDate", description="date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS") @RequestParam("itemServedDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime itemServedDate,
            @Parameter(name="rating", description="Leave a rating numerbed 1-5") @RequestParam int rating,
            @Parameter(name="reviewText") @RequestParam String reviewText)
    
            throws JsonProcessingException {

            MenuItem menuItem = menuItemRepository.findById(itemId).orElseThrow(() -> 
                new ResponseStatusException(HttpStatus.NOT_FOUND, "MenuItem with ID " + itemId + " not found"));

        log.info("itemServedDate={}", itemServedDate);

        long studentUserId = currentUserService.getCurrentUser().getUser().getId();

        MenuItemReview menuItemReview = new MenuItemReview();
        menuItemReview.setStudentUserId(studentUserId);
        menuItemReview.setMenuItem(menuItem);
        menuItemReview.setItemServedDate(itemServedDate);
        menuItemReview.setStatus("Awaiting Moderation");
        menuItemReview.setRating(rating);
        menuItemReview.setReviewText(reviewText);

        LocalDateTime now = LocalDateTime.now();
        menuItemReview.setCreatedDate(now);
        menuItemReview.setLastEditedDate(now);

        MenuItemReview savedMenuItemReview = menuItemReviewRepository.save(menuItemReview);

        return savedMenuItemReview;
    }


    /**
     * List all menu item reviews with status "Awaiting Moderation" -> ADMIN ONLY
     */
    @Operation(summary= "List all menu item reviews")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<MenuItemReview> allAwawitingModerationMenuItemReviewAdminOnly() {
        Iterable<MenuItemReview> reviews = menuItemReviewRepository.findByStatus("Awaiting Moderation");
        return reviews;
    }
}