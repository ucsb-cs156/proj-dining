package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.services.UCSBDiningMenuService;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.UserRepository;

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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.List;

import jakarta.validation.Valid;

@Tag(name = "UCSBDiningMenuController")
@RestController
@RequestMapping("/api/diningcommons")
@Slf4j
public class UCSBDiningMenuController extends ApiController {

  @Autowired UserRepository userRepository;
  @Autowired UCSBDiningMenuService ucsbDiningMenuService;

  @Operation(summary = "Get menu times for the date and the dining commmon provided")
  @GetMapping(value = "/{date-time}/{dining-commons-code}", produces = "application/json")
  public ResponseEntity<String> menutimes(
      @PathVariable("date-time") String datetime,
      @PathVariable("dining-commons-code") String diningcommoncode
  )
    throws Exception {

    String body = ucsbDiningMenuService.getJSON(datetime, diningcommoncode);

    return ResponseEntity.ok().body(body);
  }
}