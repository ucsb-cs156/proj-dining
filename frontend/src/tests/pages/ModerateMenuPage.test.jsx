import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import ModerateMenuPage from "main/pages/ModerateMenuPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("ModerateMenuPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setupModerator = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.moderatorUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("renders moderator actions cards with correct link", async () => {
    setupModerator();
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateMenuPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Moderator Actions")).toBeInTheDocument(),
    );

    const reviewsLink = screen.getByRole("button", {
      name: "Go to Moderate Reviews",
    });
    expect(reviewsLink).toHaveAttribute("href", "/moderate/reviews");

    const comingSoonButton = screen.getByRole("button", {
      name: "Coming Soon",
    });
    expect(comingSoonButton).toBeDisabled();
  });
});
