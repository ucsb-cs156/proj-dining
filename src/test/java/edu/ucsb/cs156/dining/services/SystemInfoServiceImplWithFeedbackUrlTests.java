package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.assertEquals;

import edu.ucsb.cs156.dining.models.SystemInfo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

// Tests for SystemInfoServiceImpl when app.feedbackUrl is configured
// For hints on testing, see: https://www.baeldung.com/spring-boot-testing-configurationproperties

@ExtendWith(SpringExtension.class)
@EnableConfigurationProperties(value = SystemInfoServiceImpl.class)
@TestPropertySource(
    locations = "classpath:application-development.properties",
    properties = "app.feedbackUrl=https://docs.google.com/forms/example")
class SystemInfoServiceImplWithFeedbackUrlTests {

  @Autowired private SystemInfoService systemInfoService;

  @Test
  void test_getSystemInfo_withFeedbackUrl() {
    SystemInfo si = systemInfoService.getSystemInfo();
    assertEquals("https://docs.google.com/forms/example", si.getAppFeedbackUrl());
  }
}
