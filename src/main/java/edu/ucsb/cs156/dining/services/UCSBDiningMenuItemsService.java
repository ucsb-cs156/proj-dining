package edu.ucsb.cs156.dining.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
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

@Service
@Slf4j
public class UCSBDiningMenuItemsService {

  @Autowired private ObjectMapper objectMapper;

  @Value("${app.ucsb.api.consumer_key}")
  private String apiKey;

  @Value("${app.ucsb.api.host}")
  private String apiHost;

  @Value("${app.name}")
  private String appName;

  @Value("${app.hostname}")
  private String appHostname;

  private RestTemplate restTemplate = new RestTemplate();
  @Autowired private MenuItemRepository menuItemRepository;

  public UCSBDiningMenuItemsService(RestTemplateBuilder restTemplateBuilder) throws Exception {
    restTemplate = restTemplateBuilder.build();
  }

  public static final String ALL_MEAL_ITEMS_AT_A_DINING_COMMON_ENDPOINT =
      "{apiHost}/dining/menu/v1/{date-time}/{dining-common-code}/{meal-code}";

  /**
   * Create a List of Entree from json representation
   *
   * @param dateTime String of date in iso format
   * @param diningCommonCode String of dining common
   * @param mealCode String of meal code
   * @return a list of menu items
   */
  @Cacheable("menuItem")
  public List<Entree> get(String dateTime, String diningCommonCode, String mealCode)
      throws JsonProcessingException {

    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("ucsb-api-key", this.apiKey);
    headers.set("X-Requesting-App", this.appName + "." + this.appHostname);

    HttpEntity<String> entity = new HttpEntity<>(headers);
    String url = ALL_MEAL_ITEMS_AT_A_DINING_COMMON_ENDPOINT;
    url = url.replace("{apiHost}", apiHost);
    url = url.replace("{date-time}", dateTime);
    url = url.replace("{dining-common-code}", diningCommonCode);
    url = url.replace("{meal-code}", mealCode);

    log.info(
        "Fetching menu items for date: {}, dining common: {}, meal: {}",
        dateTime,
        diningCommonCode,
        mealCode);

    ResponseEntity<String> re = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
    String retBody = re.getBody();

    List<Entree> menuItems = objectMapper.readValue(retBody, new TypeReference<List<Entree>>() {});

    return menuItems;
  }

  @Transactional
  public List<MenuItem> getOrCreateMenuItems(
      String diningCommonCode, String mealCode, List<Entree> entrees) {
    List<MenuItem> existingItems =
        menuItemRepository.findExistingEntrees(diningCommonCode, mealCode, entrees);
    Map<String, MenuItem> existingItemsMap =
        existingItems.stream()
            .collect(
                Collectors.toMap(
                    (item) -> item.getStation() + ":" + item.getName(), Function.identity()));

    for (Entree selected : entrees) {
      if (existingItemsMap.containsKey(selected.getStation() + ":" + selected.getName())) {
        continue;
      } else {
        MenuItem created =
            MenuItem.builder()
                .diningCommonsCode(diningCommonCode)
                .mealCode(mealCode)
                .station(selected.getStation())
                .name(selected.getName())
                .build();
        menuItemRepository.save(created);
        existingItems.add(created);
      }
    }

    return existingItems;
  }
}
