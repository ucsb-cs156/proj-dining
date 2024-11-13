package edu.ucsb.cs156.dining.services;


import edu.ucsb.cs156.dining.models.SystemInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;

/**
 * This is a service for getting information about the system.
 * 
 * This class relies on property values. For hints on testing, see: <a href="https://www.baeldung.com/spring-boot-testing-configurationproperties">https://www.baeldung.com/spring-boot-testing-configurationproperties</a>
 * 
 */

@Slf4j
@Service("systemInfo")
@ConfigurationProperties
public class SystemInfoServiceImpl extends SystemInfoService {
  
  @Value("${spring.h2.console.enabled:false}")
  private boolean springH2ConsoleEnabled;

  @Value("${app.showSwaggerUILink:false}")
  private boolean showSwaggerUILink;

  @Value("${app.oauth.login:/oauth2/authorization/google}")
  private String oauthLogin;

  /**
   * This method returns the system information.
   * @see edu.ucsb.cs156.dining.models.SystemInfo
   * @return the system information
   */
  public SystemInfo getSystemInfo() {
    SystemInfo si = SystemInfo.builder()
    .springH2ConsoleEnabled(this.springH2ConsoleEnabled)
    .showSwaggerUILink(this.showSwaggerUILink)
    .oauthLogin(this.oauthLogin)
    .build();
  log.info("getSystemInfo returns {}",si);
  return si;
  }

}
