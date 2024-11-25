// src/tests/pages/UCSBAPIDiningCommons/DiningCommonsPlaceholderPage.test.js

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { QueryClient, QueryClientProvider } from "react-query";

// Import the component to be tested
import DiningCommonsPlaceholderPage from "main/pages/UCSBAPIDiningCommons/UCSBAPIDiningCommonsPlaceholderPage";

// Import fixtures for mocking API responses
// Adjust the import paths based on your project structure
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("DiningCommonsPlaceholderPage tests", () => {
  // Initialize Axios Mock Adapter and QueryClient
  const axiosMock = new AxiosMockAdapter(Axios);
  const queryClient = new QueryClient();

  // Setup function to mock API responses
  const setupUserOnly = () => {
    axiosMock.reset(); // Reset any previous mocks
    axiosMock.resetHistory(); // Reset request history

    // Mock the /api/currentUser endpoint
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    // Mock the /api/systemInfo endpoint
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  // Mock console.error to suppress error logs during tests
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  // Restore console.error after each test
  afterEach(() => {
    axiosMock.reset();
    axiosMock.restore();
    console.error.mockRestore();
  });

  test("renders placeholder text with given diningCommonsCode", async () => {
    // Arrange
    setupUserOnly();
    const testCode = "carrillo";

    // Act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[`/diningcommons/${testCode}/placeholder`]}
        >
          <Routes>
            <Route
              path="/diningcommons/:diningCommonsCode/placeholder"
              element={<DiningCommonsPlaceholderPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Assert
    // Check for the heading
    expect(
      screen.getByText("Placeholder for Dining Commons Page"),
    ).toBeInTheDocument();

    // Wait for the paragraph to appear after async updates
    const paragraph = await screen.findByText(
      `This is the placeholder page for ${testCode}`,
    );
    expect(paragraph).toBeInTheDocument();
  });
});
