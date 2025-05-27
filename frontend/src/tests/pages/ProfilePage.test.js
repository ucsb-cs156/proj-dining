import { fireEvent, waitFor, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import ProfilePage from "main/pages/ProfilePage";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: jest.fn(),
}));

describe("ProfilePage tests", () => {
  const queryClient = new QueryClient();
  beforeEach(() => {
    queryClient.clear();
  });
  test("renders correctly for regular logged in user", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findAllByText("Phillip Conrad");
    expect(
      screen.getByText("Welcome, pconrad.cis@gmail.com"),
    ).toBeInTheDocument();
  });

  test("renders correctly for admin user", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Phill Conrad");
    expect(screen.getByText("Welcome, phtcon@ucsb.edu")).toBeInTheDocument();
    expect(screen.getByTestId("role-badge-user")).toBeInTheDocument();
    expect(screen.getByTestId("role-badge-admin")).toBeInTheDocument();
    expect(screen.getByTestId("role-badge-member")).toBeInTheDocument();
  });

  test("handles alias submission successfully and sends correct params", async () => {
    const axiosMock = new AxiosMockAdapter(axios);

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onPost("/api/currentUser/updateAlias").reply(200, {
      proposedAlias: "NewPropAlias",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findAllByText("Phillip Conrad");

    const aliasInput = screen.getByPlaceholderText("Enter your new alias");
    const submitButton = screen.getByText("Update Alias");

    fireEvent.change(aliasInput, { target: { value: "NewPropAlias" } });
    expect(aliasInput.value).toBe("NewPropAlias");
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        "Alias Awaiting Moderation: NewPropAlias",
      ),
    );

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    const sentParams = axiosMock.history.post[0].params;
    expect(sentParams).toEqual({ proposedAlias: "NewPropAlias" });
  });

  test("displays initial alias correctly", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Phillip Conrad");
    expect(screen.getByText("NewAlias")).toBeInTheDocument();
  });

  test("displays validation error when alias is empty", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findAllByText("Phillip Conrad");

    const submitButton = screen.getByText("Update Alias");
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText("Alias is required.");
    expect(errorMessage).toBeInTheDocument();
  });
});
