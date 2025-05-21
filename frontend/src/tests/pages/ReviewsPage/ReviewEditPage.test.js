import { render, screen } from "@testing-library/react";
import ReviewEditPage from "main/pages/ReviewsPage/ReviewEditPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("ReviewEditPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const queryClient = new QueryClient();
  test("Renders expected content with correct ID", async () => {
    setupUserOnly();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/reviews/edit/42"]}>
          <Routes>
            <Route path="/reviews/edit/:id" element={<ReviewEditPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Edit review with id 42");
    expect(screen.getByText("Coming soon!")).toBeInTheDocument();
  });
}); 