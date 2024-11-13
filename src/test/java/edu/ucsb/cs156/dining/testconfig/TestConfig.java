package edu.ucsb.cs156.dining.testconfig;

import edu.ucsb.cs156.dining.config.SecurityConfig;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;


import edu.ucsb.cs156.dining.services.CurrentUserService;
import edu.ucsb.cs156.dining.services.GrantedAuthoritiesService;
import org.springframework.context.annotation.Import;

@TestConfiguration
@Import(SecurityConfig.class)
public class TestConfig {

    @Bean
    public CurrentUserService currentUserService() {
        return new MockCurrentUserServiceImpl();
    }

    @Bean
    public GrantedAuthoritiesService grantedAuthoritiesService() {
        return new GrantedAuthoritiesService();
    }

}
