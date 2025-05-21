import { render, screen, waitFor } from "@testing-library/react";
import MyReviewsIndexPage, {
  extractReview,
  useHandlers,
} from "main/pages/MyReviews/MyReviewsIndexPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { reviewFixtures } from "fixtures/reviewFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();

jest.mock("react-toastify", () => {
  const original = jest.requireActual("react-toastify");
  return {
    ...original,
    toast: (...args) => mockToast(...args),
  };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("MyReviewsIndexPage", () => {
  const queryClient = new QueryClient();
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/reviews/my").reply(200, reviewFixtures.threeReviews);
    mockNavigate.mockClear();
    mockToast.mockClear();

    jest.spyOn(require("main/utils/useBackend"), "useBackend").mockReturnValue({
      data: reviewFixtures.threeReviews,
      error: null,
      status: "success",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  
  test("renders reviews in table", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("ReviewTable-cell-row-0-col-score")).toBeInTheDocument()
    );

    expect(screen.getByTestId("ReviewTable-cell-row-0-col-score")).toHaveTextContent("5");
    expect(screen.getByTestId("ReviewTable-cell-row-1-col-itemName")).toHaveTextContent("Pasta");
    expect(screen.getByTestId("ReviewTable-cell-row-2-col-Delete-button")).toBeInTheDocument();
  });

  test("clicking Edit calls navigate with correct review id", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("ReviewTable-cell-row-0-col-score")).toBeInTheDocument()
    );

    const editButton = screen.getByTestId("ReviewTable-cell-row-0-col-Edit-button");
    editButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const arg = mockNavigate.mock.calls[0][0];
    expect(arg).toMatch(/^\/reviews\/edit\/\d+$/);

    const id = arg.split("/").pop();
    expect(Number(id)).toBe(reviewFixtures.threeReviews[0].id);
  });

  test("clicking Delete triggers deleteMutation", async () => {
    const mockDelete = jest.fn();
    jest.spyOn(require("main/utils/useBackend"), "useBackendMutation").mockReturnValue({
      mutate: mockDelete,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
        </MemoryRouter>
      </QueryClientProvider> 
    ); 

    await waitFor(() =>
      expect(screen.getByTestId("ReviewTable-cell-row-0-col-score")).toBeInTheDocument()
    );

    const deleteButton = screen.getByTestId("ReviewTable-cell-row-0-col-Delete-button");
    deleteButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockDelete).toHaveBeenCalled();
  });

  test("clicking Delete triggers toast", async () => {
    const mockDelete = jest.fn((review) => {
      if (mockedOnSuccess) mockedOnSuccess(); // simulate success callback
    });

    let mockedOnSuccess;
    jest.spyOn(require("main/utils/useBackend"), "useBackendMutation").mockImplementation(
      (_configFn, options) => {
        mockedOnSuccess = options.onSuccess;
        return { mutate: mockDelete };
      }
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("ReviewTable-cell-row-0-col-score")).toBeInTheDocument()
    );

    const deleteButton = screen.getByTestId("ReviewTable-cell-row-0-col-Delete-button");
    deleteButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockToast).toHaveBeenCalledWith("Review deleted");
  });

  test("deleteMutation is configured with correct URL and method", async () => {
    const mockDelete = jest.fn();
    let capturedConfig;

    jest.spyOn(require("main/utils/useBackend"), "useBackendMutation").mockImplementation((configFn) => {
      capturedConfig = configFn(reviewFixtures.threeReviews[0]);
      return { mutate: mockDelete };
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("ReviewTable-cell-row-0-col-score")).toBeInTheDocument()
    );

    const deleteButton = screen.getByTestId("ReviewTable-cell-row-0-col-Delete-button");
    deleteButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(capturedConfig).toEqual({
      url: `/api/reviews/${reviewFixtures.threeReviews[0].id}`,
      method: "DELETE",
    });
  });

  test("calls useBackend with correct key and config", () => {
    jest.spyOn(require("main/utils/useBackend"), "useBackend").mockRestore();
    
    const spy = jest.spyOn(require("main/utils/useBackend"), "useBackend")
      .mockReturnValue({
        data: reviewFixtures.threeReviews,
        error: null,
        status: "success",
      });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const [[key, config, queryDeps]] = spy.mock.calls;
    expect(key).toEqual(["/api/reviews/my"]);
    expect(key[0]).not.toEqual("");
    expect(config).toEqual({ method: "GET", url: "/api/reviews/my" });
    expect(queryDeps).toEqual([]);
  });

  test("does not render moderator buttons when moderatorOptions is false", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("ReviewTable-cell-row-0-col-score")).toBeInTheDocument()
    );

    expect(screen.queryByTestId("ReviewTable-header-Approve")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ReviewTable-header-Reject")).not.toBeInTheDocument();
  });


  test("extractReview returns input if row.original not present", () => {
    const input = { id: 2 };
    expect(extractReview(input)).toEqual({ id: 2 });
  });

test("extractReview handles null row property correctly", () => {
  // This will catch the mutation from reviewOrCell?.row?.original to reviewOrCell.row?.original
  const input = null;
  expect(() => extractReview(input)).not.toThrow();
  expect(extractReview(input)).toBe(input);
  
  // Also test with undefined
  const undefinedInput = undefined;
  expect(() => extractReview(undefinedInput)).not.toThrow();
  expect(extractReview(undefinedInput)).toBe(undefinedInput);
});



});
