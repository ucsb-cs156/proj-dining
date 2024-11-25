package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.services.DiningCommonsService;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.web.bind.annotation.PathVariable;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/diningcommons")
public class DiningCommonsController {

  @Autowired DiningCommonsService diningCommonsService;

  @GetMapping(value = "/all", produces = "application/json")
  public ResponseEntity<String> getAllDiningCommons() throws Exception {

    String body = diningCommonsService.getDiningCommonsJSON();

    return ResponseEntity.ok().body(body);
  }

  @GetMapping(value = "/{date-time}/{dining-commons-code}", produces = "application/json")
  public ResponseEntity<String> getMealsByDateTimeAndDiningCommonsCode(
    @Parameter(name = "date-time", required = true) @PathVariable("date-time") LocalDateTime date_time,
    @Parameter(name = "dining-commons-code", required = true) @PathVariable("dining-commons-code") String dining_commons_code) throws Exception {
        
        String body = diningCommonsService.getMealsByDateJSON(date_time, dining_commons_code);

        return ResponseEntity.ok().body(body);
  }

  @GetMapping(value = "/{date-time}/{dining-commons-code}/{meal}", produces = "application/json")
  public ResponseEntity<String> getMenuItemsByMealDateTimeAndDiningCommonsCode(
    @Parameter(name = "date-time", required = true) @PathVariable("date-time") LocalDateTime date_time,
    @Parameter(name = "dining-commons-code", required = true) @PathVariable("dining-commons-code") String dining_commons_code,
    @Parameter(name = "meal", required = true) @PathVariable("meal") String meal) throws Exception {
        
        String body = diningCommonsService.getMenuItemsByMealAndDate(date_time, dining_commons_code, meal);

        return ResponseEntity.ok().body(body);
  }
}