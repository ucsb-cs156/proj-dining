package edu.ucsb.cs156.dining.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.models.DiningCommon;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/** Service object that wraps the UCSB Dining Commons API */
@Service
@Slf4j
public class DiningCommonsService {

    @Value("${app.ucsb.api.consumer_key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public static final String DINING_COMMONS_ENDPOINT = "https://api.ucsb.edu/dining/commons/v1/";

    public DiningCommonsService(RestTemplateBuilder restTemplateBuilder, ObjectMapper objectMapper) {
        this.restTemplate = restTemplateBuilder.build();
        this.objectMapper = objectMapper;
    }

    public List<DiningCommon> getAllDiningCommons() throws Exception {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("ucsb-api-key", apiKey);

            HttpEntity<String> entity = new HttpEntity<>("body", headers);

            log.info("Fetching data from URL: {}", DINING_COMMONS_ENDPOINT);

            ResponseEntity<String> response = restTemplate.exchange(DINING_COMMONS_ENDPOINT, HttpMethod.GET, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("Failed to fetch dining commons. Status: {}", response.getStatusCode());
                throw new RuntimeException("Error fetching dining commons. Status: " + response.getStatusCode());
            }

            return objectMapper.readValue(response.getBody(), new TypeReference<List<DiningCommon>>() {});
        } catch (Exception e) {
            log.error("Error occurred while fetching dining commons", e);
            throw new RuntimeException("Error fetching dining commons", e);
        }
    }
}