package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.jobs.TestJob;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.jobs.services.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Launch endpoints for this app's concrete jobs. The generic admin endpoints (list jobs, get logs,
 * delete jobs) come from the lib-jobs library's own controller.
 */
@Tag(name = "Jobs")
@RequestMapping("/api/jobs")
@RestController
@Slf4j
public class JobsController {

  @Autowired private JobService jobService;

  @Operation(summary = "Launch Test Job (a job that sleeps, logs, and optionally fails)")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/launch/testjob")
  public Job launchTestJob(
      @Parameter(name = "fail") @RequestParam Boolean fail,
      @Parameter(name = "sleepMs") @RequestParam Integer sleepMs) {
    TestJob testJob = TestJob.builder().fail(fail).sleepMs(sleepMs).build();
    return jobService.runAsJob(testJob);
  }
}
