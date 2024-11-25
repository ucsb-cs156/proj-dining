import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import HomePage from "main/pages/HomePage";

// Mock the `useBackend` hook
jest.mock("main/utils/useBackend", () => ({
  useBackend: jest.fn(),
}));

import { useBackend } from "main/utils/useBackend";

describe("HomePage tests", () => {
  const queryClient = new QueryClient();

  test("calls useBackend with correct arguments and renders dining commons", async () => {
    // Arrange: Mock `useBackend` return value
    useBackend.mockReturnValue({
      data: [
        {
          name: "Carrillo",
          code: "carrillo",
          location: { latitude: 34.409953, longitude: -119.85277 },
          hasSackMeal: false,
          hasTakeOutMeal: false,
          hasDiningCam: true,
        },
        {
          name: "De La Guerra",
          code: "de-la-guerra",
          location: { latitude: 34.409811, longitude: -119.845026 },
          hasSackMeal: false,
          hasTakeOutMeal: false,
          hasDiningCam: true,
        },
      ],
      error: null,
    });

    // Act: Render the HomePage component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Assert: Verify that `useBackend` was called with the correct arguments
    expect(useBackend).toHaveBeenCalledWith(
      ["/api/diningcommons/all"],
      { method: "GET", url: "/api/diningcommons/all" },
      [],
    );

    // Wait for the table to render and verify its content
    await waitFor(() => {
      expect(screen.getByText("Dining Commons")).toBeInTheDocument();
      expect(screen.getByText("Carrillo")).toBeInTheDocument();
      expect(screen.getByText("De La Guerra")).toBeInTheDocument();
    });
  });
});
