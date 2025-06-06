import { render, screen } from "@testing-library/react";
import ReviewsCreatePage from "main/pages/Reviews/ReviewsCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("ReviewsCreatePage tests", () => {
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
  test("Renders expected content", async () => {
    // arrange

    setupUserOnly();

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/reviews/post/1"]}>
          <Routes>
            <Route path="/reviews/post/:id" element={<ReviewsCreatePage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert

    await screen.findByText("Post a review for Menu Item 1");
    await screen.findByText("Coming Soon!");
  });
});
