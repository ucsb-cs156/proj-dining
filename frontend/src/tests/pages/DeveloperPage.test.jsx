import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import DeveloperPage from "main/pages/DeveloperPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("DeveloperPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingBoth);
  });

  test("renders without crashing and shows expected content", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DeveloperPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Developer Information");
    expect(screen.getByText("Current Deployed Branch")).toBeInTheDocument();
    expect(screen.getByText("Backend Endpoints")).toBeInTheDocument();
    expect(screen.getAllByText("Swagger")[0]).toHaveAttribute(
      "href",
      "/swagger-ui/index.html",
    );
    expect(screen.getByText("System Info")).toBeInTheDocument();

    expect(
      await screen.findByText(systemInfoFixtures.showingBoth.sourceRepo),
    ).toBeInTheDocument();
    expect(
      screen.getByText(systemInfoFixtures.showingBoth.commitId),
    ).toBeInTheDocument();
    expect(
      screen.getByText(systemInfoFixtures.showingBoth.commitMessage),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/property on your dokku deployment/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/dokku config:set my-deployment SOURCE_REPO=/),
    ).toBeInTheDocument();
  });
});
