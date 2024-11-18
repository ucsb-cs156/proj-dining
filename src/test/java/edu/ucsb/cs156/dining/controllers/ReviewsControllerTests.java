package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import edu.ucsb.cs156.dining.controllers.ReviewsController;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.Reviews;
import edu.ucsb.cs156.dining.repositories.ReviewsRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = ReviewsController.class)
@Import(TestConfig.class)
public class ReviewsControllerTests extends ControllerTestCase {

        @MockBean
        ReviewsRepository reviewsRepository;

        @MockBean
        UserRepository userRepository;

        // Authorization tests for /api/reviews/admin/all
        @Test
        public void logged_out_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_can_get_all() throws Exception {
                mockMvc.perform(get("/api/reviews/all"))
                                .andExpect(status().is(200)); // logged
        }
        // @Test
        // public void logged_out_users_cannot_get_by_id() throws Exception {
        //         mockMvc.perform(get("/api/diningcommons?code=carrillo"))
        //                         .andExpect(status().is(403)); // logged out users can't get by id
        // } 

        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/reviews/post"))
                                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_regular_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/reviews/post"))
                                .andExpect(status().is(403)); // only admins can post
        }
        
}
