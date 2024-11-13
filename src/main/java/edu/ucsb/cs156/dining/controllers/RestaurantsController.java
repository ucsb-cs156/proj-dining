package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.Restaurant;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.RestaurantRepository;
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

import jakarta.validation.Valid;

/**
 * This is a REST controller for Restaurants
 */

@Tag(name = "Restaurants")
@RequestMapping("/api/restaurants")
@RestController
public class RestaurantsController extends ApiController {

    @Autowired
    RestaurantRepository restaurantRepository;

    /**
     * This method returns a list of all restaurants.
     * @return a list of all restaurants
     */
    @Operation(summary = "List all restaurants")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<Restaurant> allRestaurants() {
        Iterable<Restaurant> restaurants = restaurantRepository.findAll();
        return restaurants;
    }

    /**
     * This method returns a single restaurant.
     * @param id id of the restaurant to get
     * @return a single restaurant
     */
    @Operation(summary = "Get a single restaurant")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public Restaurant getById(
            @Parameter(name = "id") @RequestParam Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Restaurant.class, id));

        return restaurant;
    }

    /**
     * This method creates a new restaurant. Accessible only to users with the role "ROLE_ADMIN".
     * @param name name of the restaurant
     * @param description description of the restaurant
     * @return the save restaurant (with it's id field set by the database)
     */
    @Operation(summary = "Create a new restaurant")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public Restaurant postRestaurant(
            @Parameter(name = "name") @RequestParam String name,
            @Parameter(name = "description") @RequestParam String description) {
        Restaurant restaurant = new Restaurant();

        restaurant.setName(name);
        restaurant.setDescription(description);
        
        Restaurant savedrestaurant = restaurantRepository.save(restaurant);
        return savedrestaurant;
    }

    /**
     * Deletes a restaurant. Accessible only to users with the role "ROLE_ADMIN".
     * @param id id of the restaurant to delete
     * @return a message indicating that the restaurant was deleted
     */
    @Operation(summary = "Delete a Restaurant")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteRestaurant(
            @Parameter(name = "id") @RequestParam Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Restaurant.class, id));

        restaurantRepository.delete(restaurant);
        return genericMessage("Restaurant with id %s deleted".formatted(id));
    }

    /**
     * Update a single restaurant. Accessible only to users with the role "ROLE_ADMIN".
     * @param id id of the restaurant to update
     * @param incoming the new restaurant contents
     * @return the updated restaurant object
     */
    @Operation(summary = "Update a single restaurant")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public Restaurant updateRestaurant(
            @Parameter(name = "id") @RequestParam Long id,
            @RequestBody @Valid Restaurant incoming) {

        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Restaurant.class, id));

        restaurant.setName(incoming.getName());
        restaurant.setDescription(incoming.getDescription());

        restaurantRepository.save(restaurant);

        return restaurant;
    }
}