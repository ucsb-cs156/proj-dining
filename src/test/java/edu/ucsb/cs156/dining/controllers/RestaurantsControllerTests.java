package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import edu.ucsb.cs156.dining.ControllerTestCase;
import edu.ucsb.cs156.dining.entities.Restaurant;
import edu.ucsb.cs156.dining.repositories.RestaurantRepository;

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

@WebMvcTest(controllers = RestaurantsController.class)
@Import(TestConfig.class)
public class RestaurantsControllerTests extends ControllerTestCase {

        @MockBean
        RestaurantRepository restaurantRepository;

        @MockBean
        UserRepository userRepository;

        // Authorization tests for /api/phones/admin/all

        @Test
        public void logged_out_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/restaurants/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_can_get_all() throws Exception {
                mockMvc.perform(get("/api/restaurants/all"))
                                .andExpect(status().is(200)); // logged
        }

        @Test
        public void logged_out_users_cannot_get_by_id() throws Exception {
                mockMvc.perform(get("/api/restaurants?id=7"))
                                .andExpect(status().is(403)); // logged out users can't get by id
        }

        // Authorization tests for /api/phones/post
        // (Perhaps should also have these for put and delete)

        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/restaurants/post"))
                                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_regular_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/restaurants/post"))
                                .andExpect(status().is(403)); // only admins can post
        }

        // // Tests with mocks for database actions

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

                // arrange

                Restaurant restaurant = Restaurant.builder()
                                .name("Taco Bell")
                                .description("Mexican")
                                .build();

                when(restaurantRepository.findById(eq(7L))).thenReturn(Optional.of(restaurant));  // Check not sure why id is 7

                // act
                MvcResult response = mockMvc.perform(get("/api/restaurants?id=7"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(restaurantRepository, times(1)).findById(eq(7L));
                String expectedJson = mapper.writeValueAsString(restaurant);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

                // arrange

                when(restaurantRepository.findById(eq(7L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(get("/api/restaurants?id=7"))
                                .andExpect(status().isNotFound()).andReturn();

                // assert

                verify(restaurantRepository, times(1)).findById(eq(7L));
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("Restaurant with id 7 not found", json.get("message"));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_user_can_get_all_restaurants() throws Exception {

                // arrange

                Restaurant restaurant1 = Restaurant.builder()
                                .name("Taco Bell")
                                .description("Mexican")
                                .build();

                Restaurant restaurant2 = Restaurant.builder()
                                .name("McDonalds")
                                .description("American")
                                .build();

                ArrayList<Restaurant> expectedRestaurants = new ArrayList<>();
                expectedRestaurants.addAll(Arrays.asList(restaurant1, restaurant2));

                when(restaurantRepository.findAll()).thenReturn(expectedRestaurants);

                // act
                MvcResult response = mockMvc.perform(get("/api/restaurants/all"))
                                .andExpect(status().isOk()).andReturn();

                // assert

                verify(restaurantRepository, times(1)).findAll();
                String expectedJson = mapper.writeValueAsString(expectedRestaurants);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_restaurant() throws Exception {
                // arrange

                Restaurant restaurant1 = Restaurant.builder()
                                .name("Chipotle")
                                .description("Mexican")
                                .build();

                when(restaurantRepository.save(eq(restaurant1))).thenReturn(restaurant1);

                // act
                MvcResult response = mockMvc.perform(
                                post("/api/restaurants/post?name=Chipotle&description=Mexican")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(restaurantRepository, times(1)).save(restaurant1);
                String expectedJson = mapper.writeValueAsString(restaurant1);
                String responseString = response.getResponse().getContentAsString();
                assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_delete_a_restaurant() throws Exception {
                // arrange

                Restaurant restaurant = Restaurant.builder()
                                .name("Taco Bell")
                                .description("Mexican")
                                .build();

                when(restaurantRepository.findById(eq(15L))).thenReturn(Optional.of(restaurant));

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/restaurants?id=15")
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(restaurantRepository, times(1)).findById(15L);
                verify(restaurantRepository, times(1)).delete(any());

                Map<String, Object> json = responseToJson(response);
                assertEquals("Restaurant with id 15 deleted", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_tries_to_delete_non_existant_restaurant_and_gets_right_error_message()
                        throws Exception {
                // arrange

                when(restaurantRepository.findById(eq(15L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                delete("/api/restaurants?id=15")
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(restaurantRepository, times(1)).findById(15L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("Restaurant with id 15 not found", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_edit_an_existing_restaurant() throws Exception {
                // arrange

                Restaurant restaurantOrig = Restaurant.builder().id(67L)
                                .name("Chipotle")
                                .description("Mexican")
                                .build();

                Restaurant restaurantEdited = Restaurant.builder().id(67L)
                                .name("Taco Bell")
                                .description("American")
                                .build();

                String requestBody = mapper.writeValueAsString(restaurantEdited);

                when(restaurantRepository.findById(eq(67L))).thenReturn(Optional.of(restaurantOrig));

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/restaurants?id=67")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                // assert
                verify(restaurantRepository, times(1)).findById(67L);
                verify(restaurantRepository, times(1)).save(restaurantEdited); // should be saved with correct user
                String responseString = response.getResponse().getContentAsString();
                assertEquals(requestBody, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_edit_restaurant_that_does_not_exist() throws Exception {
                // arrange

                Restaurant editedRestaurant = Restaurant.builder()
                                .name("Red Smoke Grill")
                                .description("American")
                               
                                .build();


                String requestBody = mapper.writeValueAsString(editedRestaurant);

                when(restaurantRepository.findById(eq(67L))).thenReturn(Optional.empty());

                // act
                MvcResult response = mockMvc.perform(
                                put("/api/restaurants?id=67")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .characterEncoding("utf-8")
                                                .content(requestBody)
                                                .with(csrf()))
                                .andExpect(status().isNotFound()).andReturn();

                // assert
                verify(restaurantRepository, times(1)).findById(67L);
                Map<String, Object> json = responseToJson(response);
                assertEquals("Restaurant with id 67 not found", json.get("message"));

        }
}
