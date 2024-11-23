package edu.ucsb.cs156.dining.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.dining.models.DiningCommon;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.beans.factory.annotation.Value;
import edu.ucsb.cs156.dining.services.wiremock.WiremockService;
import java.util.List;

@RestClientTest(DiningCommonsService.class)
public class DiningCommonsServiceTest {

    @Autowired
    private DiningCommonsService diningCommonsService;

    @Autowired
    private MockRestServiceServer mockServer;

    @Autowired
    private ObjectMapper objectMapper;

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
                    "hasDiningCam": true
                }
            ]
        """;

        mockServer.expect(requestTo(DiningCommonsService.DINING_COMMONS_ENDPOINT))
                .andExpect(header("ucsb-api-key", apiKey))
                .andExpect(header("accept", "application/json"))
                .andRespond(withSuccess(mockResponse, MediaType.APPLICATION_JSON));

        // Act
        List<DiningCommon> result = diningCommonsService.getAllDiningCommons();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        DiningCommon commons = result.get(0);
        assertEquals("Carrillo", commons.getName());
        assertEquals("carrillo", commons.getCode());
        assertFalse(commons.getHasSackMeal());
        assertTrue(commons.getHasTakeOutMeal());
        assertTrue(commons.getHasDiningCam());
    }

    @Test
    public void testGetAllDiningCommons_NullResponse() {
        // Arrange: Mock API response with null body
        mockServer.expect(requestTo(DiningCommonsService.DINING_COMMONS_ENDPOINT))
                  .andExpect(header("ucsb-api-key", apiKey))
                  .andRespond(withNoContent()); // Simulates a 204 No Content response

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            diningCommonsService.getAllDiningCommons();
        });
        assertTrue(exception.getMessage().contains("Error fetching dining commons"));
    }

    @Test
    public void testGetAllDiningCommons_InvalidResponse() {
        // Arrange: Mock API response with invalid JSON
        String invalidResponse = "{ invalid json }";

        mockServer.expect(requestTo(DiningCommonsService.DINING_COMMONS_ENDPOINT))
                .andExpect(header("ucsb-api-key", apiKey))
                .andRespond(withSuccess(invalidResponse, MediaType.APPLICATION_JSON));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            diningCommonsService.getAllDiningCommons();
        });
        assertTrue(exception.getMessage().contains("Error fetching dining commons"));
    }
}
