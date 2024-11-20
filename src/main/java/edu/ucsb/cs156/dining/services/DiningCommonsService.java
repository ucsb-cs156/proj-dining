package edu.ucsb.cs156.dining.services;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/** Service object that wraps the UCSB Dining Commons API */
@Service
@Slf4j
public class DiningCommonsService {

  @Autowired private ObjectMapper objectMapper;

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  private RestTemplate restTemplate = new RestTemplate();

  public DiningCommonsService(RestTemplateBuilder restTemplateBuilder) throws Exception {
    restTemplate = restTemplateBuilder.build();
  }

  public static final String NAMES_ENDPOINT =
      "https://api.ucsb.edu/dining/commons/v1/names";

  public static final String MEALS_BY_DATE_ENDPOINT = "https://api.ucsb.edu/dining/menu/v1/";


  public String getDiningCommonsJSON() throws Exception {

    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("ucsb-api-version", "1.0");
    headers.set("ucsb-api-key", this.apiKey);

    HttpEntity<String> entity = new HttpEntity<>("body", headers);

    String url = NAMES_ENDPOINT;

    log.info("url=" + url);

    String retVal = "";
    MediaType contentType = null;
    HttpStatus statusCode = null;

    ResponseEntity<String> re = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
    contentType = re.getHeaders().getContentType();
    statusCode = (HttpStatus) re.getStatusCode();
    retVal = re.getBody();

    log.info("json: {} contentType: {} statusCode: {}", retVal, contentType, statusCode);
    return retVal;
  }

  /**
   * Get the meals for a specific dining commons by date
   * @param date
   * @param diningCommonsCode
   * @return meals by date by dining common
   * @throws Exception
   */
  public String getMealsByDateJSON(LocalDateTime date, String diningCommonsCode) throws Exception {

    // set headers for api requests
    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("ucsb-api-version", "1.0");
    headers.set("ucsb-api-key", this.apiKey);
    HttpEntity<String> entity = new HttpEntity<>("body", headers);

    // set the date in the format that the api expects
    String formattedDate = date.toString();
    log.info("formattedDate: {}", formattedDate);

    // set the url for the api request (https://api.ucsb.edu/dining/menu/v1/2024-10-21T12%3A00%3A00/carrillo)
    String url = MEALS_BY_DATE_ENDPOINT + date.toString() + "/" + diningCommonsCode;


    // get the information from request
    String retVal = "";
    MediaType contentType = null;
    HttpStatus statusCode = null;

    ResponseEntity<String> re = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
    contentType = re.getHeaders().getContentType();
    statusCode = (HttpStatus) re.getStatusCode();
    retVal = re.getBody();

    log.info("json: {} contentType: {} statusCode: {}", retVal, contentType, statusCode);
    return retVal;
  }


  /**
   * Get the meals for a specific dining commons by date
   * @param meal
   * @param date
   * @param diningCommonsCode
   * @return meals by date by dining common
   * @throws Exception
   */
  public String getMenuItemsByMealAndDateJSON(LocalDateTime date, String diningCommonsCode, String meal) throws Exception {

    // set headers for api requests
    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("ucsb-api-version", "1.0");
    headers.set("ucsb-api-key", this.apiKey);
    HttpEntity<String> entity = new HttpEntity<>("body", headers);

    // set the date in the format that the api expects
    String formattedDate = date.toString();
    log.info("formattedDate: {}", formattedDate);

    // set the url for the api request e.g. (https://api.ucsb.edu/dining/menu/v1/2021-02-10/ortega/lunch)
    String url = MEALS_BY_DATE_ENDPOINT + date.toString() + "/" + diningCommonsCode + "/" + meal;


    // get the information from request
    String retVal = "";
    MediaType contentType = null;
    HttpStatus statusCode = null;

    ResponseEntity<String> re = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
    contentType = re.getHeaders().getContentType();
    statusCode = (HttpStatus) re.getStatusCode();
    retVal = re.getBody();

    log.info("json: {} contentType: {} statusCode: {}", retVal, contentType, statusCode);
    return retVal;
  }
}