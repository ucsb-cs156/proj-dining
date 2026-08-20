package edu.ucsb.cs156.dining.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.jobs.TestJob;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import edu.ucsb.cs156.jobs.services.JobService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = JobsController.class)
@Import(TestConfig.class)
public class JobsControllerTests extends ControllerTestCase {

  @MockBean JobService jobService;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_launch_test_job() throws Exception {
    // arrange

    Job jobStarted =
        Job.builder()
            .createdById(1L)
            .createdByEmail("cgaucho@ucsb.edu")
            .jobName("TestJob")
            .status("running")
            .build();

    when(jobService.runAsJob(any(JobContextConsumer.class))).thenReturn(jobStarted);

    // act

    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/testjob?fail=false&sleepMs=2000").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert

    ArgumentCaptor<JobContextConsumer> captor = ArgumentCaptor.forClass(JobContextConsumer.class);
    verify(jobService).runAsJob(captor.capture());
    TestJob testJob = assertInstanceOf(TestJob.class, captor.getValue());
    assertFalse(testJob.getFail());
    assertEquals(2000, testJob.getSleepMs());

    String expectedJson = mapper.writeValueAsString(jobStarted);
    assertEquals(expectedJson, response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regular_users_cannot_launch_test_job() throws Exception {
    mockMvc
        .perform(post("/api/jobs/launch/testjob?fail=false&sleepMs=0").with(csrf()))
        .andExpect(status().is(403));
  }

  @Test
  public void logged_out_users_cannot_launch_test_job() throws Exception {
    mockMvc
        .perform(post("/api/jobs/launch/testjob?fail=false&sleepMs=0").with(csrf()))
        .andExpect(status().is(403));
  }
}
