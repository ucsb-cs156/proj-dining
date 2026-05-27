package edu.ucsb.cs156.dining.startup;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.ApplicationArguments;

class DiningApplicationRunnerTests {

  private DiningApplicationRunner diningApplicationRunner;

  @Mock private DiningStartup diningStartup;

  @Mock private ApplicationArguments mockArgs;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    diningApplicationRunner = new DiningApplicationRunner();
    diningApplicationRunner.diningStartup = diningStartup; // Manually inject mock
  }

  @Test
  void test_run_calls_AlwaysRunOnStartup() throws Exception {
    diningApplicationRunner.run(mockArgs);
    verify(diningStartup, times(1)).alwaysRunOnStartup();
  }
}
