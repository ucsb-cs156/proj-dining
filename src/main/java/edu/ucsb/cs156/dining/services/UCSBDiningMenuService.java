package edu.ucsb.cs156.dining.services;

import com.fasterxml.jackson.core.type.TypeReference;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.ArrayList;
import java.util.Arrays;
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

/** Service object that wraps the UCSB Dining Menu API */
@Service
@Slf4j
public class UCSBDiningMenuService {

    @Value("${app.ucsb.api.consumer_key}")
    private String apiKey;

    private RestTemplate restTemplate = new RestTemplate();

    public UCSBDiningMenuService(RestTemplateBuilder restTemplateBuilder) throws Exception {
        restTemplate = restTemplateBuilder.build();
    }

    public static final String ALL_MEAL_TIMES_AT_A_DINING_COMMON_ENDPOINT =
      "https://api.ucsb.edu/dining/menu/v1/{date-time}/{dining-common-code}";

    public String getJSON(String dateTime, String diningCommonCode) throws Exception {

      HttpHeaders headers = new HttpHeaders();
      headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.set("ucsb-api-version", "1.0");
      headers.set("ucsb-api-key", this.apiKey);

      HttpEntity<String> entity = new HttpEntity<>("body", headers);

      String url = ALL_MEAL_TIMES_AT_A_DINING_COMMON_ENDPOINT;
      url.replace("{date-time}", dateTime);
      url.replace("{dining-common-code}", diningCommonCode);
        

      log.info("url=" + url);

      String retVal = "";
      MediaType contentType = null;
      HttpStatus statusCode = null;

      ResponseEntity<String> re = restTemplate.exchange(url, HttpMethod.GET, entity, String.class, dateTime, diningCommonCode);
      contentType = re.getHeaders().getContentType();
      statusCode = (HttpStatus) re.getStatusCode();
      retVal = re.getBody();

      log.info("json: {} contentType: {} statusCode: {}", retVal, contentType, statusCode);
      return retVal;
    }
}

