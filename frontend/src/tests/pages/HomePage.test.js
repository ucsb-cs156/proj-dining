import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import HomePage from "main/pages/HomePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import mockConsole from "jest-mock-console";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

/* describe("HomePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  axiosMock
    .onGet("/api/currentUser")
    .reply(200, apiCurrentUserFixtures.userOnly);
  axiosMock
    .onGet("/api/systemInfo")
    .reply(200, systemInfoFixtures.showingNeither);

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findByText(/Dining Commons/);
    await screen.findByText(/Code/);
    await screen.findByText(/Name/);
    expect(
      await screen.findByTestId("DiningCommonsTable-header-group-0"),
    ).toBeInTheDocument();
  });
}); */

describe("HomePage tests", () => {
  describe("when the backend doesn't return data", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/diningcommons/all", {})
        .reply(200, diningCommonsFixtures.threeDiningCommons);
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HomePage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

    expect(await screen.findByTestId("DiningCommonsTable-header-group-0"));
    });
  });

  describe("tests where backend is working normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/diningcommons/all", {})
        .reply(200, diningCommonsFixtures.threeDiningCommons);
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HomePage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(await screen.findByTestId("DiningCommonsTable-header-group-0"));
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HomePage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("DiningCommonsTable-header-group-0");

      expect(
        await screen.getByTestId("DiningCommonsTable-header-code-sort-carets"),
      ).toBeInTheDocument();
      expect(
        await screen.getByTestId("DiningCommonsTable-header-name-sort-carets"),
      ).toBeInTheDocument();

      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-0-col-code"),
      ).toHaveTextContent("carrillo");
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-0-col-name"),
      ).toHaveTextContent("Carrillo");

      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-1-col-code"),
      ).toHaveTextContent("de-la-guerra");
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-1-col-name"),
      ).toHaveTextContent("De La Guerra");

      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-2-col-code"),
      ).toHaveTextContent("ortega");
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-2-col-name"),
      ).toHaveTextContent("Ortega");
    });
  });
});
