package edu.ucsb.cs156.dining.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.DiningCommonsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/diningcommons")
public class DiningCommonsController {
  private ObjectMapper mapper = new ObjectMapper();

  @Autowired UserRepository userRepository;

  @Autowired DiningCommonsService diningCommonsService;

  @GetMapping(value = "/all", produces = "application/json")
  public ResponseEntity<String> getAllDiningCommons() throws Exception {

    String body = diningCommonsService.getJSON();

    return ResponseEntity.ok().body(body);
  }
}