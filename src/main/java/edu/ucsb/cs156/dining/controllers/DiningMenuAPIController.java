package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.DiningMenuAPIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.OffsetDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "DiningMenuAPIController")
@RestController
@RequestMapping("/api/dining")
@Slf4j
public class DiningMenuAPIController extends ApiController {

  @Autowired UserRepository userRepository;
  @Autowired DiningMenuAPIService diningMenuAPIService;

  @Operation(summary = "Get list of meals served in given dining commons on given date")
  @GetMapping(value = "/getMeals", produces = "application/json")
  public ResponseEntity<String> getMeals (@RequestParam OffsetDateTime dateTime, @RequestParam String diningCommonsCode) throws Exception {
    String body = diningMenuAPIService.getMeals(dateTime, diningCommonsCode);
    return ResponseEntity.ok().body(body);
  }

  @Operation(summary = "Get list of dining commons serving meals on given date")
  @GetMapping(value = "/getCommons", produces = "application/json")
  public ResponseEntity<String> getCommons( @RequestParam OffsetDateTime dateTime) throws Exception { 
    String body = diningMenuAPIService.getCommons(dateTime);
    return ResponseEntity.ok().body(body);
  }

  @Operation(summary = "Get list of days with meal service")
  @GetMapping(value = "/getDays", produces = "application/json")
  public ResponseEntity<String> getDays() throws Exception {
    String body = diningMenuAPIService.getDays();
    return ResponseEntity.ok().body(body);
  }
}