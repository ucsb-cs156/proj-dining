import { fireEvent, waitFor, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import ProfilePage from "main/pages/ProfilePage";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: jest.fn(),
}));

const currentUserMock = {
  loggedIn: true,
  user: {
    email: "phtcon@ucsb.edu",
    fullName: "Phillip Conrad",
    alias: "Anonymous User",
    pictureUrl: "profile.jpg",
  },
};

describe("ProfilePage tests", () => {
  const queryClient = new QueryClient();

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

    await screen.findByText("Phillip Conrad");
    expect(screen.getByText("pconrad.cis@gmail.com")).toBeInTheDocument();
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
    expect(screen.getByText("phtcon@ucsb.edu")).toBeInTheDocument();
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
      proposedAlias: "NewAlias",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Phillip Conrad");

    const aliasInput = screen.getByPlaceholderText("Enter your new alias");
    const submitButton = screen.getByText("Update Alias");

    fireEvent.change(aliasInput, { target: { value: "NewAlias" } });
    expect(aliasInput.value).toBe("NewAlias");

    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith("Alias Awaiting Moderation: NewAlias"),
    );

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    const sentParams = axiosMock.history.post[0].params;
    expect(sentParams).toEqual({ proposedAlias: "NewAlias" });
  });

  test("displays initial alias correctly", async () => {
    const axiosMock = new AxiosMockAdapter(axios);

    axiosMock.onGet("/api/currentUser").reply(200, {
      root: {
        user: {
          email: "phtcon@ucsb.edu",
          fullName: "Phillip Conrad",
          alias: "Anonymous User",
          pictureUrl: "profile.jpg",
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Phillip Conrad");
    expect(screen.getByText("Anonymous User")).toBeInTheDocument();
  });

  test("displays 'Not logged in' for unauthenticated user", async () => {
    const axiosMock = new AxiosMockAdapter(axios);

    axiosMock
      .onGet("/api/currentUser/profile")
      .reply(200, { loggedIn: false, root: null });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Not logged in.")).toBeInTheDocument();
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

    await screen.findByText("Phillip Conrad");

    const submitButton = screen.getByText("Update Alias");
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText("Alias is required.");
    expect(errorMessage).toBeInTheDocument();
  });
});
