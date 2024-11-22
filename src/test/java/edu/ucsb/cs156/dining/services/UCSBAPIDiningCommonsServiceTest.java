package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

import edu.ucsb.cs156.dining.entities.UCSBAPIDiningCommons;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@RestClientTest(UCSBAPIDiningCommonsService.class)
public class UCSBAPIDiningCommonsServiceTest {

    @Autowired
    private UCSBAPIDiningCommonsService diningCommonsService;

    @Autowired
    private MockRestServiceServer mockServer;

    @MockBean
    private edu.ucsb.cs156.dining.services.wiremock.WiremockService wiremockService;

    @Value("${app.ucsb.api.consumer_key}")
    private String apiKey;

    @Test
    public void testGetAllDiningCommons_Success() throws Exception {
        // Arrange: Mock successful API response with sample JSON data
        String mockResponse = """
            [
                {
                    "name": "Carrillo",
                    "code": "carrillo",
                    "hasSackMeal": false,
                    "hasTakeOutMeal": true,
                    "hasDiningCam": true,
                    "location": {
                        "latitude": 34.409953,
                        "longitude": -119.85277
                    }
                }
            ]
        """;

        mockServer.expect(requestTo("https://api.ucsb.edu/dining/commons/v1/"))
                .andExpect(header("ucsb-api-key", apiKey))
                .andExpect(header("accept", "application/json"))
                .andRespond(withSuccess(mockResponse, MediaType.APPLICATION_JSON));

        // Act
        List<UCSBAPIDiningCommons> result = diningCommonsService.getAllDiningCommons();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        UCSBAPIDiningCommons commons = result.get(0);
        assertEquals("Carrillo", commons.getName());
        assertEquals("carrillo", commons.getCode());
        assertFalse(commons.getHasSackMeal());
        assertTrue(commons.getHasTakeOutMeal());
        assertTrue(commons.getHasDiningCam());
        assertEquals(34.409953, commons.getLocation().getLatitude());
        assertEquals(-119.85277, commons.getLocation().getLongitude());
    }


    @Test
    public void testGetAllDiningCommons_NullResponse() {
        // Arrange: Mock API response with null body
        mockServer.expect(requestTo("https://api.ucsb.edu/dining/commons/v1/"))
                  .andExpect(header("ucsb-api-key", apiKey))
                  .andRespond(withNoContent()); // Simulates a 204 No Content response

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () -> {
            diningCommonsService.getAllDiningCommons();
        });
        assertEquals("Failed to fetch dining commons data from API", exception.getMessage());
    }
}
