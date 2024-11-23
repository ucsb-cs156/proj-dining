import { render, screen } from "@testing-library/react";
import HomePage from "main/pages/HomePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import mockConsole from "jest-mock-console";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const axiosMock = new AxiosMockAdapter(axios);

describe("HomePage tests", () => {
  describe("tests where backend is working normally", () => {
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

    test("renders without crashing", async () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HomePage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(
        await screen.findByTestId("DiningCommonsTable-header-group-0"),
      ).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HomePage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("DiningCommonsTable-header-group-0");

      expect(
        screen.getByTestId("DiningCommonsTable-header-code-sort-carets"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("DiningCommonsTable-header-name-sort-carets"),
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

  describe("tests where backend is NOT working normally", () => {
    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/diningcommons/all", {}).timeout();
    });

    test("renders empty table without crashing", async () => {
      const queryClient = new QueryClient();

      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HomePage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(
        await screen.findByTestId("DiningCommonsTable-header-group-0"),
      ).toBeInTheDocument();

      const errorMessage = console.error.mock.calls[0][0];
      expect(errorMessage).toMatch(
        "Error communicating with backend via GET on /api/diningcommons/all",
      );
      restoreConsole();
    });
  });
});
