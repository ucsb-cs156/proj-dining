package edu.ucsb.cs156.dining.services;

import edu.ucsb.cs156.dining.entities.UCSBAPIDiningCommons;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/** Service class to interact with UCSB Dining Commons API */
@Service
@Slf4j
public class UCSBAPIDiningCommonsService {

@Value("jb7SJBaLZaEGWGOkJxux41aLAQ4Nbtes")
  private String apiKey;

  private final RestTemplate restTemplate;

  public UCSBAPIDiningCommonsService(RestTemplateBuilder restTemplateBuilder) {
    this.restTemplate = restTemplateBuilder.build();
  }

  private static final String DINING_COMMONS_ENDPOINT =
      "https://api.ucsb.edu/dining/commons/v1/";

  public List<UCSBAPIDiningCommons> getAllDiningCommons() throws Exception {
    HttpHeaders headers = new HttpHeaders();
    headers.set("ucsb-api-key", this.apiKey);
    headers.set("accept", "application/json");

    HttpEntity<String> entity = new HttpEntity<>("body", headers);

    log.info("Fetching all dining commons from API");

    ResponseEntity<UCSBAPIDiningCommons[]> response = restTemplate.exchange(
        DINING_COMMONS_ENDPOINT, HttpMethod.GET, entity, UCSBAPIDiningCommons[].class);

    UCSBAPIDiningCommons[] diningCommonsArray = response.getBody();
    if (diningCommonsArray == null) {
      throw new Exception("Failed to fetch dining commons data from API");
    }

    return List.of(diningCommonsArray);
  }
}
