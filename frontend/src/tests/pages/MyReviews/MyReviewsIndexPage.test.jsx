import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("MyReviewsIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "Reviewstable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("renders three reviews correctly for regular user", async () => {
    // arrange
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/reviews/userReviews")
      .reply(200, ReviewFixtures.threeReviews);

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-item.id`),
      ).toHaveTextContent("7");
    });
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-item.id`),
    ).toHaveTextContent("8");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-item.id`),
    ).toHaveTextContent("9");
  });

  test("renders empty table when backend unavailable, user only", async () => {
    // arrange
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/reviews/userReviews").timeout();
    const restoreConsole = mockConsole();

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/reviews/userReviews",
    );
    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-item.id`),
    ).not.toBeInTheDocument();
  });

  test("what happens when you click delete, user", async () => {
    // arrange
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/reviews/userReviews")
      .reply(200, ReviewFixtures.threeReviews);
    axiosMock.onDelete("/api/reviews/reviewer").reply(200, "Review deleted");

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-item.id`),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-item.id`),
    ).toHaveTextContent("7");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act
    fireEvent.click(deleteButton);

    // assert
    await waitFor(() => {
      expect(mockToast).toBeCalledWith("Review deleted");
    });
  });
});
