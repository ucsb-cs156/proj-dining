import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import Moderate from "main/pages/Moderate";
import aliasFixtures from "fixtures/aliasFixtures";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

jest.mock("main/utils/useBackend");
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("ModeratePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  const renderPage = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();

    useBackend.mockReturnValue({ data: aliasFixtures.threeAlias, isLoading: false });
    useBackendMutation.mockImplementation((_, { onSuccess, onError }) => ({
      mutate: () => onError(new Error("Request failed with status code 500")),
    }));
  });

  test("renders correctly for admin user", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
    });
    axiosMock.onGet("/api/systemInfo").reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    await screen.findByRole("heading", { level: 2, name: "Moderation Page" });
    expect(screen.getByTestId("AliasTable-header-proposedAlias")).toBeInTheDocument();
    expect(screen.getByTestId("AliasTable-header-approve")).toBeInTheDocument();
    expect(screen.getByTestId("AliasTable-header-reject")).toBeInTheDocument();
  });

  test("redirects non-admin user to homepage", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, { user: { id: 2, admin: false }, roles: [{ authority: "ROLE_USER" }] });
    axiosMock.onGet("/api/systemInfo").reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    await waitFor(() => {
      expect(screen.queryByRole("heading", { level: 2, name: "Moderation Page" })).not.toBeInTheDocument();
    });
  });

  test("redirects if currentUser data is missing or not logged in", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, { loggedIn: false });
    axiosMock.onGet("/api/systemInfo").reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    await waitFor(() => {
      expect(screen.queryByRole("heading", { level: 2, name: "Moderation Page" })).not.toBeInTheDocument();
    });
  });

  test("fetches and displays alias proposals", async () => {
    const proposals = aliasFixtures.threeAlias;
    axiosMock.onGet("/api/currentUser").reply(200, { user: { id: 1, admin: true }, roles: [{ authority: "ROLE_ADMIN" }] });
    axiosMock.onGet("/api/systemInfo").reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    const rows = await screen.findAllByTestId(/AliasTable-row-/);
    expect(rows).toHaveLength(proposals.length);
    proposals.forEach((p, idx) => {
      expect(within(rows[idx]).getByText(p.proposedAlias)).toBeInTheDocument();
    });
  });

  test("useBackend called with correct args", () => {
    axiosMock.onGet("/api/currentUser").reply(200, { user: { id: 1, admin: true }, roles: [{ authority: "ROLE_ADMIN" }] });
    axiosMock.onGet("/api/systemInfo").reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    expect(useBackend).toHaveBeenCalledWith(
      ["/api/admin/usersWithProposedAlias"],
      { method: "GET", url: "/api/admin/usersWithProposedAlias" },
      []
    );
  });

  test("shows error toast when rejecting alias fails", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, { user: { id: 1, admin: true }, roles: [{ authority: "ROLE_ADMIN" }] });
    axiosMock.onGet("/api/systemInfo").reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    const cell = await screen.findByTestId("AliasTable-cell-row-0-col-reject");
    const button = within(cell).getByRole("button", { name: "Reject" });
    fireEvent.click(button);
    expect(toast.error).toHaveBeenCalledWith(
      "Error rejecting alias: Request failed with status code 500"
    );
  });
});
