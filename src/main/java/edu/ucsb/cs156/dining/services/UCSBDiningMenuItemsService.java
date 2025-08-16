package edu.ucsb.cs156.dining.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.models.Entree;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class UCSBDiningMenuItemsService {

  @Autowired private ObjectMapper objectMapper;

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  private RestTemplate restTemplate = new RestTemplate();

  public UCSBDiningMenuItemsService(RestTemplateBuilder restTemplateBuilder) throws Exception {
    restTemplate = restTemplateBuilder.build();
  }

  public static final String ALL_MEAL_ITEMS_AT_A_DINING_COMMON_ENDPOINT =
      "https://api.ucsb.edu/dining/menu/v1/{date-time}/{dining-common-code}/{meal-code}";

  /**
   * Create a List of Entree from json representation
   *
   * @param dateTime String of date in iso format
   * @param diningCommonCode String of dining common
   * @param mealCode String of meal code
   * @return a list of menu items
   */
  public List<Entree> get(String dateTime, String diningCommonCode, String mealCode)
      throws JsonProcessingException {

    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("ucsb-api-key", this.apiKey);

    HttpEntity<String> entity = new HttpEntity<>(headers);
    String url = ALL_MEAL_ITEMS_AT_A_DINING_COMMON_ENDPOINT;
    url = url.replace("{date-time}", dateTime);
    url = url.replace("{dining-common-code}", diningCommonCode);
    url = url.replace("{meal-code}", mealCode);

    ResponseEntity<String> re = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
    String retBody = re.getBody();

    List<Entree> menuItems = objectMapper.readValue(retBody, new TypeReference<List<Entree>>() {});

    return menuItems;
  }
}
