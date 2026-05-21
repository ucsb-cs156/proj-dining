import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";
import ModeratorsCreatePage from "main/pages/Admin/ModeratorsCreatePage";
import * as useBackendModule from "main/utils/useBackend";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    toast: (x) => mockToast(x),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

const useBackendMutationSpy = vi.spyOn(useBackendModule, "useBackendMutation");

describe("ModeratorsCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const renderPage = () => {
    const queryClient = new QueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterEach(() => {
    useBackendMutationSpy.mockClear();
  });

  test("renders without crashing", async () => {
    renderPage();

    await screen.findByText("Add New Moderator");
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /", async () => {
    const moderator = {
      email: "newmoderator@ucsb.edu",
    };

    axiosMock.onPost("/api/admin/moderators/post").reply(202, moderator);

    renderPage();

    const emailInput = await screen.findByLabelText("Email");
    fireEvent.change(emailInput, {
      target: { value: "newmoderator@ucsb.edu" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      email: "newmoderator@ucsb.edu",
    });
    expect(mockToast).toHaveBeenCalledWith(
      "New moderator added - email: newmoderator@ucsb.edu",
    );
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/",
    });
  });

  test("does not redirect when the backend returns an error", async () => {
    axiosMock.onPost("/api/admin/moderators/post").reply(500, {});

    renderPage();

    const emailInput = await screen.findByLabelText("Email");
    fireEvent.change(emailInput, {
      target: { value: "newmoderator@ucsb.edu" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(mockToast).toHaveBeenCalledWith(
      "Axios Error: Error: Request failed with status code 500",
    );
    expect(mockToast).toHaveBeenCalledWith(
      "Error: Request failed with status code 500",
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("storybook mode does not redirect on success", async () => {
    const queryClient = new QueryClient();
    const moderator = {
      email: "storybook@ucsb.edu",
    };

    axiosMock.onPost("/api/admin/moderators/post").reply(202, moderator);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsCreatePage storybook />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const emailInput = await screen.findByLabelText("Email");
    fireEvent.change(emailInput, {
      target: { value: "storybook@ucsb.edu" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("useBackendMutation is called with correct cache query key", async () => {
    renderPage();

    await screen.findByText("Add New Moderator");

    expect(useBackendMutationSpy).toHaveBeenCalledWith(
      expect.any(Function),
      { onSuccess: expect.any(Function) },
      ["/api/admin/moderators/get"],
    );
  });
});
