package edu.ucsb.cs156.dining.controllers;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = StatisticsController.class)
@Import(TestConfig.class)
public class StatisticsControllerTests extends ControllerTestCase {

  @Autowired private MockMvc mockMvc;

  @MockBean ReviewRepository reviewRepository;

  @MockBean MenuItemRepository menuItemRepository;

  @Test
  public void api_statistics_logged_out_returns_403() throws Exception {
    mockMvc.perform(get("/api/statistics")).andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void api_statistics_user_logged_in_returns_expected_shape() throws Exception {
    LocalDateTime lastUpdated = LocalDateTime.parse("2026-05-26T18:00:00");
    when(reviewRepository.countByStatus(ModerationStatus.APPROVED)).thenReturn(10L);
    when(reviewRepository.countDistinctItemsByStatus(ModerationStatus.APPROVED)).thenReturn(7L);
    when(reviewRepository.countDistinctCommonsByStatus(ModerationStatus.APPROVED)).thenReturn(4L);
    when(reviewRepository.findMaxDateEditedByStatus(ModerationStatus.APPROVED))
        .thenReturn(lastUpdated);

    mockMvc
        .perform(get("/api/statistics"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalApprovedReviews").value(10))
        .andExpect(jsonPath("$.totalMenuItemsReviewed").value(7))
        .andExpect(jsonPath("$.totalCommonsCovered").value(4))
        .andExpect(jsonPath("$.lastUpdated").value("2026-05-26T18:00:00"));

    verify(reviewRepository, times(1)).countByStatus(ModerationStatus.APPROVED);
    verify(reviewRepository, times(1)).countDistinctItemsByStatus(ModerationStatus.APPROVED);
    verify(reviewRepository, times(1)).countDistinctCommonsByStatus(ModerationStatus.APPROVED);
    verify(reviewRepository, times(1)).findMaxDateEditedByStatus(ModerationStatus.APPROVED);
  }

  @WithMockUser(roles = {"USER", "ADMIN"})
  @Test
  public void api_statistics_admin_logged_in_returns_200() throws Exception {
    when(reviewRepository.countByStatus(ModerationStatus.APPROVED)).thenReturn(0L);
    when(reviewRepository.countDistinctItemsByStatus(ModerationStatus.APPROVED)).thenReturn(0L);
    when(reviewRepository.countDistinctCommonsByStatus(ModerationStatus.APPROVED)).thenReturn(0L);
    when(reviewRepository.findMaxDateEditedByStatus(ModerationStatus.APPROVED)).thenReturn(null);

    mockMvc.perform(get("/api/statistics")).andExpect(status().isOk());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void api_statistics_null_lastUpdated_serializes_as_null() throws Exception {
    when(reviewRepository.countByStatus(ModerationStatus.APPROVED)).thenReturn(0L);
    when(reviewRepository.countDistinctItemsByStatus(ModerationStatus.APPROVED)).thenReturn(0L);
    when(reviewRepository.countDistinctCommonsByStatus(ModerationStatus.APPROVED)).thenReturn(0L);
    when(reviewRepository.findMaxDateEditedByStatus(ModerationStatus.APPROVED)).thenReturn(null);

    mockMvc
        .perform(get("/api/statistics"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalApprovedReviews").value(0))
        .andExpect(jsonPath("$.totalMenuItemsReviewed").value(0))
        .andExpect(jsonPath("$.totalCommonsCovered").value(0))
        .andExpect(jsonPath("$.lastUpdated").doesNotExist());
  }
}
