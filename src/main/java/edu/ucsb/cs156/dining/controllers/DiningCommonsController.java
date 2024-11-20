package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.models.DiningCommon;
import edu.ucsb.cs156.dining.services.DiningCommonsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "DiningCommonsController")
@RestController
@RequestMapping("/api/public")
@Slf4j
public class DiningCommonsController extends ApiController {

  @Autowired
  private DiningCommonsService diningCommonsService;

  @Operation(summary = "Get all dining commons")
  @GetMapping(value = "/diningcommons/all", produces = "application/json")
  public List<DiningCommon> getAllDiningCommons() {
    try {
      return diningCommonsService.getAllDiningCommons();
    } catch (Exception e) {
      log.error("Error retrieving dining commons", e);
      throw new RuntimeException("Unable to retrieve dining commons", e);
    }
  }
}
