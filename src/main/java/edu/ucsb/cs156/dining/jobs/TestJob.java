package edu.ucsb.cs156.dining.jobs;

import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import lombok.Builder;
import lombok.Getter;

/**
 * A trivial job for testing the jobs infrastructure from the admin console: logs a line, sleeps,
 * then either fails or logs a goodbye.
 */
@Builder
public class TestJob implements JobContextConsumer {

  @Getter private boolean fail;
  @Getter private int sleepMs;

  @Override
  public void accept(JobContext ctx) throws Exception {
    ctx.log("Hello World! from test job!");
    Thread.sleep(sleepMs);
    if (fail) {
      throw new Exception("Fail!");
    }
    ctx.log("Goodbye from test job!");
  }
}
