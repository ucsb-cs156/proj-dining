package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.UCSBAPIDiningCommons;
import edu.ucsb.cs156.dining.services.UCSBAPIDiningCommonsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

/** Controller for UCSB Dining Commons API */
@Tag(name = "UCSBDiningCommonsController")
@RestController
@RequestMapping("/api/diningcommons")
@Slf4j
public class UCSBAPIDiningCommonsController {

  @Autowired
  private UCSBAPIDiningCommonsService diningCommonsService;

  @Operation(summary = "Get all dining commons from UCSB API")
  @GetMapping("/all")
  public List<UCSBAPIDiningCommons> getAllDiningCommons() throws Exception {
    return diningCommonsService.getAllDiningCommons();
  }
}
