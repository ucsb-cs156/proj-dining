package edu.ucsb.cs156.dining.startup;

import com.google.common.base.Objects;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePropertySource;

@Order(Ordered.LOWEST_PRECEDENCE)
@Slf4j
public class QAProfileEnabler implements EnvironmentPostProcessor {

  @Override
  public void postProcessEnvironment(
      ConfigurableEnvironment environment, SpringApplication application) {
    if (Objects.equal(System.getenv("QA"), "true")) {
      environment.addActiveProfile("QA");
      try {
        Resource resource = new ClassPathResource("application-qa.properties");
        if (resource.exists()) {
          ResourcePropertySource propertySource =
              new ResourcePropertySource("application-qa", resource);
          environment.getPropertySources().addFirst(propertySource);
        }
      } catch (IOException e) {
        // Handle exception appropriately
        log.error("QA data file is missing. Please check that application-qa.properties exists.");
      }
    }
  }
}
