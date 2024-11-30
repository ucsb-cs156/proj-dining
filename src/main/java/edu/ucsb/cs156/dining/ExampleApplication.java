package edu.ucsb.cs156.dining;

import java.time.ZonedDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.task.DelegatingSecurityContextAsyncTaskExecutor;

import edu.ucsb.cs156.dining.services.wiremock.WiremockService;
import lombok.extern.slf4j.Slf4j;

/**
 * The ExampleApplication class is the main entry point for the application.
 */
@SpringBootApplication
@EnableAsync  // @EnableJpaAuditing(dateTimeProviderRef = "utcDateTimeProvider") doesn't work with mvn tests but works with backend
@EnableScheduling
@Slf4j
public class ExampleApplication {

  @Autowired
  WiremockService wiremockService;

  /**
   * When using the wiremock profile, this method will call the code needed to set up the wiremock services
   */
  @Profile("wiremock")
  @Bean
  public ApplicationRunner wiremockApplicationRunner() {
    return arg -> {
      log.info("wiremock mode");
      wiremockService.init();
      log.info("wiremockApplicationRunner completed");
    };
  }

  /**
   * Hook that can be used to set up any services needed for development
   */
  @Profile("development")
  @Bean
  public ApplicationRunner developmentApplicationRunner() {
    return arg -> {
      log.info("development mode");
      log.info("developmentApplicationRunner completed");
    };
  }

   /**
   * The main method is the entry point for the application.
   * @param args command line arguments, typically unused for Spring Boot applications
   */
  public static void main(String[] args) {
    SpringApplication.run(ExampleApplication.class, args);
  }

  @Bean
  public DateTimeProvider utcDateTimeProvider() {
      return () -> {
        ZonedDateTime now = ZonedDateTime.now();
        return Optional.of(now);
      };
  }
}