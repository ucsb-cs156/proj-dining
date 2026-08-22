package edu.ucsb.cs156.dining.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.models.DiningCommons;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

// Reworked from proj-course's UCSBSubjectsService.java :
// https://github.com/ucsb-cs156/proj-courses/blob/main/src/main/java/edu/ucsb/cs156/courses/services/UCSBSubjectsService.java

// Uses UCSB's developer api for dining commons.
// https://developer.ucsb.edu/apis/dining/dining-commons

// Service for the dining commons page.
// This service particularly utilizes an endpoint for getting all dining commons from the above api.

@Slf4j
@Service("DiningCommons")
public class DiningCommonsService {

  @Autowired private ObjectMapper mapper;

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  @Value("${app.ucsb.api.host}")
  private String apiHost;

  @Value("${app.name}")
  private String appName;

  @Value("${app.hostname}")
  private String appHostname;

  public static final String ENDPOINT = "{apiHost}/dining/commons/v1/";

  private final RestTemplate restTemplate;

  public DiningCommonsService(RestTemplateBuilder restTemplateBuilder) {
    restTemplate = restTemplateBuilder.build();
  }

  @Cacheable("diningCommons")
  public List<DiningCommons> get() throws JsonProcessingException {

    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("ucsb-api-key", this.apiKey);
    headers.set("X-Requesting-App", this.appName + "." + this.appHostname);

    log.info("Fetching dining commons from UCSB API");

    String url = ENDPOINT.replace("{apiHost}", apiHost);

    HttpEntity<String> entity = new HttpEntity<>(headers);
    ResponseEntity<String> re = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

    String retBody = re.getBody();
    List<DiningCommons> commons =
        mapper.readValue(retBody, new TypeReference<List<DiningCommons>>() {});

    return commons;
  }
}
