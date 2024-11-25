package edu.ucsb.cs156.dining.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.entities.DiningMenuAPI;
import edu.ucsb.cs156.dining.repositories.DiningMenuAPIRepository;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cglib.core.Local;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/** Service object that wraps the UCSB Academic Curriculum API */
@Service
@Slf4j
public class DiningMenuAPIService {
  @Value("${app.startDate:2024-01-01T00:00:00-08:00}")
  private OffsetDateTime startDate;

  @Value("${app.endDate:2024-12-31T23:59:59-08:00}")
  private OffsetDateTime endDate;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private DiningMenuAPIRepository diningMenuApiRepository;

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  private RestTemplate restTemplate;

  public DiningMenuAPIService(RestTemplateBuilder restTemplateBuilder) throws Exception {
    this.restTemplate = restTemplateBuilder.build();
  }

  public static final String GET_MEALS =
      "https://api.ucsb.edu/dining/menu/v1/{date-time}/{dining-common-code}";

  public static final String GET_COMMONS =
      "https://api.ucsb.edu/dining/menu/v1/{date-time}";

  public static final String GET_DAYS =
      "https://api.ucsb.edu/dining/menu/v1/";

  public OffsetDateTime getStartDateTime() {
    return startDate;
  }

  public OffsetDateTime getEndDateTime() {
    return endDate;
  }

  public void setStartDateTime(OffsetDateTime startDate) {
    this.startDate = startDate;
  }

  public void setEndDateTime(OffsetDateTime endDate) {
    this.endDate = endDate;
  }

  public List<DiningMenuAPI> getDays() throws Exception {
    List<DiningMenuAPI> days = diningMenuApiRepository.findAll();
    if (days.isEmpty()) {
      days = this.loadAllDays();
    }
    return days;
  }

  public List<DiningMenuAPI> getCommons(OffsetDateTime dateTime) throws Exception {
    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("ucsb-api-version", "1.0");
    headers.set("ucsb-api-key", this.apiKey);

    DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    String formattedDateTime = dateTime.format(formatter);

    String url = GET_COMMONS.replace("{date-time}", formattedDateTime);

    log.info("Fetching commons data from URL: {}", url);

    HttpEntity<String> entity = new HttpEntity<>("body", headers);

    ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

    if (responseEntity.getStatusCode() != HttpStatus.OK) {
        log.error("Error fetching commons data: Status = {}", responseEntity.getStatusCode());
        throw new Exception("Failed to fetch dining commons data");
    }

    String responseBody = responseEntity.getBody();
    List<DiningMenuAPI> commons = objectMapper.readValue(responseBody, new TypeReference<List<DiningMenuAPI>>() {});

    log.info("Fetched {} commons from the API", commons.size());
    return commons;
  }

  public List<DiningMenuAPI> getMeals(OffsetDateTime dateTime, String diningCommonCode) throws Exception {
    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("ucsb-api-version", "1.0");
    headers.set("ucsb-api-key", this.apiKey);

    DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    String formattedDateTime = dateTime.format(formatter);

    String url = GET_MEALS
            .replace("{date-time}", formattedDateTime)
            .replace("{dining-common-code}", diningCommonCode);

    log.info("Fetching meals data from URL: {}", url);

    HttpEntity<String> entity = new HttpEntity<>("body", headers);

    ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

    if (responseEntity.getStatusCode() != HttpStatus.OK) {
        log.error("Error fetching meals data: Status = {}", responseEntity.getStatusCode());
        throw new Exception("Failed to fetch meals data for dining common: " + diningCommonCode);
    }

    String responseBody = responseEntity.getBody();
    List<DiningMenuAPI> meals = objectMapper.readValue(responseBody, new TypeReference<List<DiningMenuAPI>>() {});

    log.info("Fetched {} meals for dining common {} on {}", meals.size(), diningCommonCode, formattedDateTime);
    return meals;
}


  public List<DiningMenuAPI> getAllDaysFromAPI() throws Exception {
    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("ucsb-api-version", "1.0");
    headers.set("ucsb-api-key", this.apiKey);

    HttpEntity<String> entity = new HttpEntity<>("body", headers);

    String url = GET_DAYS;

    log.info("url=" + url);

    String retVal = "";
    MediaType contentType = null;
    HttpStatus statusCode = null;

    ResponseEntity<String> re = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
    contentType = re.getHeaders().getContentType();
    statusCode = (HttpStatus) re.getStatusCode();
    retVal = re.getBody();

    log.info(
        "json: {} contentType: {} statusCode: {} entity: {}",
        retVal,
        contentType,
        statusCode,
        entity);
    List<DiningMenuAPI> day = null;
    day = objectMapper.readValue(retVal, new TypeReference<List<DiningMenuAPI>>() {});
    return day;
  }

  public boolean dateInRange(OffsetDateTime dateTime, OffsetDateTime startDateTest, OffsetDateTime endDateTest) {
    if (dateTime == null) 
    {
      dateTime = OffsetDateTime.now();
    }

    boolean dateGEStart = !dateTime.isBefore(startDateTest);
    boolean dateLEEnd = !dateTime.isAfter(endDateTest);
    return (dateGEStart && dateLEEnd);
  }

  public List<DiningMenuAPI> loadAllDays() throws Exception {
    List<DiningMenuAPI> days = this.getAllDaysFromAPI();
    List<DiningMenuAPI> savedDays = new ArrayList<DiningMenuAPI>();
    days.forEach(
        (day) -> {
          if (dateInRange(day.getDate(), startDate, endDate)) {
            diningMenuApiRepository.save(day);
            savedDays.add(day);
          }
        });
    log.info("savedDays.size={}", savedDays.size());
    return savedDays;
  }
}