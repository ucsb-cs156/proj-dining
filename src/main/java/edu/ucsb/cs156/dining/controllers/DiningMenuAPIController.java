package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.DiningMenuAPI;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.DiningMenuAPIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
  public List<DiningMenuAPI> getMeals (@RequestParam OffsetDateTime dateTime, @RequestParam String diningCommonsCode) throws Exception {
    return diningMenuAPIService.getMeals(dateTime, diningCommonsCode);
  }

  @Operation(summary = "Get list of dining commons serving meals on given date")
  @GetMapping(value = "/getCommons", produces = "application/json")
  public List<DiningMenuAPI> getCommons( @RequestParam OffsetDateTime dateTime) throws Exception {
    return diningMenuAPIService.getCommons(dateTime);
  }

  @Operation(summary = "Get list of days with meal service")
  @GetMapping(value = "/getDays", produces = "application/json")
  public List<DiningMenuAPI> getDays() throws Exception {
    return diningMenuAPIService.getDays();
  }

  // @Operation(summary = "Load days with meal service into database from API")
  // @PreAuthorize("hasRole('ROLE_ADMIN')")
  // @PostMapping("/loadDays")
  // public List<DiningMenuAPI> loadDays() throws Exception {
  //   List<DiningMenuAPI> savedDays = diningMenuAPIService.loadAllDays();
  //   return savedDays;
  // }
}