package edu.ucsb.cs156.dining.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.models.DiningCommons;
import edu.ucsb.cs156.dining.services.DiningCommonsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@Tag(name = "API to handle get all dining commons from UCSB developer API website")
@RequestMapping("/api/dining")
@RestController
public class DiningCommonsController extends ApiController /* implements ApplicationRunner */ {

  @Autowired ObjectMapper mapper;

  @Autowired DiningCommonsService diningCommonsService;

  @Operation(summary = "Get all Dining Commons")
  @GetMapping(value = "/all", produces = "application/json")
  public Iterable<DiningCommons> allDiningCommons() throws Exception {
    Iterable<DiningCommons> diningCommons = diningCommonsService.get();

    return diningCommons;
  }
}
