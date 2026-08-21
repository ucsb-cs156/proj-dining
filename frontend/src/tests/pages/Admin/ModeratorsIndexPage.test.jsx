import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";
import ModeratorsIndexPage from "main/pages/Admin/ModeratorsIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("ModeratorsIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setupAdmin = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("renders the list of moderators", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/moderators/all")
      .reply(200, [{ email: "mod1@ucsb.edu", isInAdminEmails: false }]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Moderators")).toBeInTheDocument();
    expect(
      screen.getByTestId("ModeratorsIndexPage-cell-row-0-col-email"),
    ).toHaveTextContent("mod1@ucsb.edu");
    expect(screen.getByTestId("ModeratorsIndexPage-add-button")).toHaveStyle({
      float: "right",
    });
    expect(screen.queryByTestId("RoleEmailAddModal")).not.toBeInTheDocument();
  });

  test("clicking Add Moderator opens the modal, and a successful post shows a toast and closes it", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/moderators/all").reply(200, []);
    axiosMock
      .onPost("/api/admin/moderators/post")
      .reply(200, { email: "newmod@ucsb.edu" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(
      await screen.findByTestId("ModeratorsIndexPage-add-button"),
    );
    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "newmod@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params).toEqual({
      email: "newmod@ucsb.edu",
    });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "New moderator added - email: newmod@ucsb.edu",
      ),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("RoleEmailAddModal")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        axiosMock.history.get.filter(
          (r) => r.url === "/api/admin/moderators/all",
        ).length,
      ).toBe(2),
    );
  });

  test("a failed post shows the server error inside the modal", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/moderators/all").reply(200, []);
    axiosMock
      .onPost("/api/admin/moderators/post")
      .reply(400, { message: "newmod@ucsb.edu is already a moderator" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(
      await screen.findByTestId("ModeratorsIndexPage-add-button"),
    );
    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "newmod@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    expect(
      await screen.findByTestId("RoleEmailAddModal-error"),
    ).toHaveTextContent("newmod@ucsb.edu is already a moderator");
  });

  test("a failed post with no message from the server falls back to a default message", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/moderators/all").reply(200, []);
    axiosMock.onPost("/api/admin/moderators/post").reply(400, {});

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(
      await screen.findByTestId("ModeratorsIndexPage-add-button"),
    );
    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "newmod@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    expect(
      await screen.findByTestId("RoleEmailAddModal-error"),
    ).toHaveTextContent("Unable to add moderator.");
  });

  test("a response with no body at all still falls back to a default message", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/moderators/all").reply(200, []);
    axiosMock.onPost("/api/admin/moderators/post").reply(400, undefined);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(
      await screen.findByTestId("ModeratorsIndexPage-add-button"),
    );
    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "newmod@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    expect(
      await screen.findByTestId("RoleEmailAddModal-error"),
    ).toHaveTextContent("Unable to add moderator.");
  });

  test("a post with no HTTP response at all still falls back to a default message", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/moderators/all").reply(200, []);
    axiosMock.onPost("/api/admin/moderators/post").networkError();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(
      await screen.findByTestId("ModeratorsIndexPage-add-button"),
    );
    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "newmod@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    expect(
      await screen.findByTestId("RoleEmailAddModal-error"),
    ).toHaveTextContent("Unable to add moderator.");
  });

  test("deleting a moderator refetches the moderator list", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/moderators/all")
      .reply(200, [{ email: "mod1@ucsb.edu", isInAdminEmails: false }]);
    axiosMock
      .onDelete("/api/admin/moderators/delete")
      .reply(200, { message: "Moderator with id mod1@ucsb.edu deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(
      await screen.findByTestId(
        "ModeratorsIndexPage-cell-row-0-col-delete-button",
      ),
    );
    fireEvent.click(screen.getByTestId("RoleEmailDeleteModal-confirm"));

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    await waitFor(() =>
      expect(
        axiosMock.history.get.filter(
          (r) => r.url === "/api/admin/moderators/all",
        ).length,
      ).toBe(2),
    );
  });

  test("clicking Cancel in the add modal closes it without posting", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/moderators/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(
      await screen.findByTestId("ModeratorsIndexPage-add-button"),
    );
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-cancel"));

    await waitFor(() =>
      expect(screen.queryByTestId("RoleEmailAddModal")).not.toBeInTheDocument(),
    );
    expect(axiosMock.history.post.length).toBe(0);
  });
});
