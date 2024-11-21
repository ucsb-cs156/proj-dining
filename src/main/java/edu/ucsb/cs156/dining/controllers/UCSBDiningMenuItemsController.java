package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.services.UCSBDiningMenuItemsService;
import edu.ucsb.cs156.dining.models.Entree;

import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.List;

import jakarta.validation.Valid;

@Tag(name = "UCSBDiningMenuItems")
@RestController
@RequestMapping("/api/diningcommons")
@Slf4j
public class UCSBDiningMenuItemsController extends ApiController {

  @Autowired UCSBDiningMenuItemsService ucsbDiningMenuItemsService;

  @Operation(summary = "Get list of entrees being served at given meal, dining common, and day")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping(value = "/{date-time}/{dining-commons-code}/{meal-code}", produces = "application/json")
  public ResponseEntity<List<Entree>> get_menu_items(
      @Parameter(description= "date (in iso format, e.g. YYYY-mm-dd) or date-time (in iso format e.g. YYYY-mm-ddTHH:MM:SS)") 
      @PathVariable("date-time") String datetime,
      @PathVariable("dining-commons-code") String diningcommoncode,
      @PathVariable("meal-code") String mealcode
  )
    throws Exception {

    List<Entree> body = ucsbDiningMenuItemsService.get(datetime, diningcommoncode, mealcode);

    return ResponseEntity.ok().body(body);
  }
}