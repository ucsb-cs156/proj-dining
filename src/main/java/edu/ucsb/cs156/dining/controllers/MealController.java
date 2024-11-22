package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.models.Meal;
import edu.ucsb.cs156.dining.services.MealService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Controller for Meal */
@Tag(name = "Meal")
@RestController
@RequestMapping("/api/diningcommons")
@Slf4j
public class MealController {

  @Autowired
  private MealService mealService;

  /**
   * Endpoint to fetch all meals served in a particular dining commons on a specific date.
   *
   * @param dateTime the date (in YYYY-MM-DD format)
   * @param diningCommonsCode  the dining commons code
   * @return a list of meals
   * @throws Exception if the API request fails
   */
  @Operation(summary = "Get all meals for a specific date and dining commons")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/{dateTime}/{diningCommonsCode}")
  public List<Meal> getMeals(
      @Parameter(description = " ISO date only (2005-12-06) or ISO date and time (2005-12-06T00:00:00-08:00)") 
      @PathVariable String dateTime,
      @PathVariable String diningCommonsCode) throws Exception {
    log.info("Fetching meals for date: {} and dining commons: {}", dateTime, diningCommonsCode);
    return mealService.getMeals(dateTime, diningCommonsCode);
  }


}