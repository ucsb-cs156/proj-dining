package edu.ucsb.cs156.dining.startup;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;

/** This class contains a `run` method that is called once at application startup time. */
@Slf4j
@Configuration
public class DiningApplicationRunner implements ApplicationRunner {

  @Autowired DiningStartup diningStartup;

  /** Called once at application startup time */
  @Override
  public void run(ApplicationArguments args) throws Exception {
    log.info("DiningApplicationRunner.run called");
    diningStartup.alwaysRunOnStartup();
  }
}
