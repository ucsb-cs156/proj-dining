import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ReviewCreatePage from "main/pages/Review/ReviewCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("ReviewCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("ReviewForm-itemId")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /review", async () => {
    const queryClient = new QueryClient();
    const review = {
      id: 3,
      studentId: 12345,
      itemId: 2,
      dateItemServed: "2022-02-02T00:00",
      status: "Awaiting Moderation",
      userIdModerator: null,
      moderatorComments: null,
    };

    axiosMock.onPost("/api/review/post").reply(202, review);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("ReviewForm-itemId")).toBeInTheDocument();
    });

    const itemIdField = screen.getByTestId("ReviewForm-itemId");
    const studentIdField = screen.getByTestId("ReviewForm-studentId");
    const dateItemServedField = screen.getByTestId("ReviewForm-dateItemServed");

    const submitButton = screen.getByTestId("ReviewForm-submit");

    fireEvent.change(itemIdField, { target: { value: "2" } });
    fireEvent.change(studentIdField, { target: { value: "12345" } });
    fireEvent.change(dateItemServedField, {
      target: { value: "2022-02-02T00:00" },
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: "2",
      studentId: "12345",
      dateItemServed: "2022-02-02T00:00",
    });

    expect(mockToast).toBeCalledWith(
      "New review Created - itemId: 2 studentId: 12345"
    );
    expect(mockNavigate).toBeCalledWith({ to: "/review" });
  });
});
