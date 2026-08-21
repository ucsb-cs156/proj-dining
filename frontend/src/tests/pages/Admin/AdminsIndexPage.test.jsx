import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";
import AdminsIndexPage from "main/pages/Admin/AdminsIndexPage";
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

describe("AdminsIndexPage tests", () => {
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

  test("renders the list of admins and the cannot-delete note", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/all").reply(200, [
      { email: "admin1@ucsb.edu", isInAdminEmails: false },
      { email: "superadmin@ucsb.edu", isInAdminEmails: true },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Admins")).toBeInTheDocument();
    expect(
      screen.getByTestId("AdminsIndexPage-cell-row-0-col-email"),
    ).toHaveTextContent("admin1@ucsb.edu");
    expect(screen.getByText(/cannot be deleted/)).toBeInTheDocument();
  });

  test("clicking Add Admin opens the modal, and a successful post shows a toast and closes it", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/all").reply(200, []);
    axiosMock
      .onPost("/api/admin/post")
      .reply(200, { email: "newadmin@ucsb.edu" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByTestId("AdminsIndexPage-add-button"));
    expect(screen.getByTestId("RoleEmailAddModal")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "newadmin@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params).toEqual({
      email: "newadmin@ucsb.edu",
    });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "New admin added - email: newadmin@ucsb.edu",
      ),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("RoleEmailAddModal")).not.toBeInTheDocument(),
    );
  });

  test("a failed post shows the server error inside the modal and does not close it", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/all").reply(200, []);
    axiosMock
      .onPost("/api/admin/post")
      .reply(400, { message: "newadmin@ucsb.edu is already an admin" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByTestId("AdminsIndexPage-add-button"));
    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "newadmin@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    expect(
      await screen.findByTestId("RoleEmailAddModal-error"),
    ).toHaveTextContent("newadmin@ucsb.edu is already an admin");
    expect(screen.getByTestId("RoleEmailAddModal")).toBeInTheDocument();
  });

  test("a failed post with no message from the server falls back to a default message", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/all").reply(200, []);
    axiosMock.onPost("/api/admin/post").reply(400, {});

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByTestId("AdminsIndexPage-add-button"));
    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "newadmin@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    expect(
      await screen.findByTestId("RoleEmailAddModal-error"),
    ).toHaveTextContent("Unable to add admin.");
  });

  test("clicking Cancel in the add modal closes it without posting", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByTestId("AdminsIndexPage-add-button"));
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-cancel"));

    await waitFor(() =>
      expect(screen.queryByTestId("RoleEmailAddModal")).not.toBeInTheDocument(),
    );
    expect(axiosMock.history.post.length).toBe(0);
  });
});
