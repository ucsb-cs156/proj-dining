package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.services.UCSBDiningMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "UCSBDiningMenuController")
@RestController
@RequestMapping("/api/diningcommons")
@Slf4j
public class UCSBDiningMenuController extends ApiController {

  @Autowired UCSBDiningMenuService ucsbDiningMenuService;

  @Operation(summary = "Get list of meals serving in given dining common on given date")
  @GetMapping(value = "/{date-time}/{dining-commons-code}", produces = "application/json")
  public ResponseEntity<String> menutimes(
      @Parameter(
              description =
                  "date (in iso format, e.g. YYYY-mm-dd) or date-time (in iso format e.g. YYYY-mm-ddTHH:MM:SS)")
          @PathVariable("date-time")
          String datetime,
      @PathVariable("dining-commons-code") String diningcommoncode)
      throws Exception {

    String body = ucsbDiningMenuService.getJSON(datetime, diningcommoncode);

    return ResponseEntity.ok().body(body);
  }
}
