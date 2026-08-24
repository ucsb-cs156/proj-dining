package edu.ucsb.cs156.dining.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.models.Entree;
import java.time.Duration;
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

  /*
   * A RestTemplate built with no timeout blocks its calling thread forever on a hung external
   * call. That's a real incident lib-jobs' single-threaded jobsExecutor hit on another app
   * (proj-scaffold): a job stuck this way permanently wedged the executor, with no way to recover
   * short of restarting the app (see lib-jobs DESIGN.md 9 -- cooperative job cancellation only
   * helps a job that reaches another checkpoint, which a truly hung thread never will). Generous
   * but finite: long enough to never trip on legitimate slowness, short enough to guarantee a job
   * can't hang forever.
   */
  private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(10);
  private static final Duration READ_TIMEOUT = Duration.ofSeconds(60);

  private RestTemplate restTemplate = new RestTemplate();

  public UCSBDiningMenuItemsService(RestTemplateBuilder restTemplateBuilder) throws Exception {
    restTemplate =
        restTemplateBuilder.connectTimeout(CONNECT_TIMEOUT).readTimeout(READ_TIMEOUT).build();
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
}
