import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import ModerateReviews from "main/pages/ModerateReviewsPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

describe("ModerateReviewsPage", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const tableTestId = "Reviewstable";

  const mockModeratorSession = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.moderatorUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const mockAdminSession = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const mockRegularUserSession = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("moderator sees moderation actions and no dialog on load", async () => {
    mockModeratorSession();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${tableTestId}-cell-row-0-col-item.id`),
      ).toHaveTextContent("7");
    });
    expect(screen.getByText("Reviewer Email")).toBeInTheDocument();
    expect(
      screen.getByTestId(`${tableTestId}-cell-row-0-col-reviewer.email`),
    ).toBeInTheDocument();
    expect(screen.getByText("phtcon@ucsb.edu")).toBeInTheDocument();
    expect(
      screen.getByTestId(`${tableTestId}-cell-row-0-col-Approve-button`),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(`${tableTestId}-cell-row-1-col-Reject-button`),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId("ModeratorCommentsModal-title"),
    ).not.toBeInTheDocument();
  });

  test("admin sees approve and reject controls on the table", async () => {
    mockAdminSession();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${tableTestId}-cell-row-0-col-Approve-button`),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Reviewer Email")).toBeInTheDocument();
    expect(
      screen.getByTestId(`${tableTestId}-cell-row-0-col-reviewer.email`),
    ).toBeInTheDocument();
    expect(screen.getByText("phtcon@ucsb.edu")).toBeInTheDocument();
    expect(
      screen.getByTestId(`${tableTestId}-cell-row-1-col-Reject-button`),
    ).toBeInTheDocument();
  });

  test("standard user does not get moderator controls", async () => {
    mockRegularUserSession();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId(`${tableTestId}-cell-row-0-col-item.id`),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${tableTestId}-cell-row-0-col-Approve-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${tableTestId}-cell-row-0-col-Reject-button`),
    ).not.toBeInTheDocument();
  });

  test("end-to-end approve from page sends moderation PUT", async () => {
    mockModeratorSession();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    axiosMock.onPut("/api/reviews/moderate").reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${tableTestId}-cell-row-0-col-Approve-button`),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByTestId(`${tableTestId}-cell-row-0-col-Approve-button`),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("ModeratorCommentsModal-title"),
      ).toHaveTextContent("Approve Review");
      expect(screen.getByTestId("ModeratorCommentsModal-comments")).toHaveValue(
        "",
      );
    });

    fireEvent.change(screen.getByTestId("ModeratorCommentsModal-comments"), {
      target: { value: "Approved after review" },
    });

    fireEvent.click(screen.getByTestId("ModeratorCommentsModal-submit"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    const putRequest = axiosMock.history.put[0];
    expect(putRequest.params.status).toBe("APPROVED");
    expect(putRequest.params.moderatorComments).toBe("Approved after review");
    expect(putRequest.params.id).toBeDefined();
  });

  test("cancel on the page closes the comments dialog", async () => {
    mockModeratorSession();

    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${tableTestId}-cell-row-0-col-Approve-button`),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByTestId(`${tableTestId}-cell-row-0-col-Approve-button`),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("ModeratorCommentsModal-title"),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("ModeratorCommentsModal-cancel"));

    await waitFor(() => {
      expect(
        screen.queryByTestId("ModeratorCommentsModal-title"),
      ).not.toBeInTheDocument();
    });
  });

  test("failed needsmoderation GET logs method and hides actions", async () => {
    mockModeratorSession();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    axiosMock.onGet("/api/reviews/needsmoderation").reply(500);
    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/reviews/needsmoderation",
    );
    restoreConsole();

    expect(
      screen.queryByTestId(`${tableTestId}-cell-row-0-col-Approve-button`),
    ).not.toBeInTheDocument();
  });

  test("successful moderation triggers a second fetch of pending reviews", async () => {
    mockModeratorSession();

    const queryClient = new QueryClient();

    const singleReviewList = [ReviewFixtures.threeReviews[0]];
    let fetchCount = 0;

    axiosMock.onGet("/api/reviews/needsmoderation").reply(() => {
      fetchCount += 1;
      return [
        200,
        fetchCount === 1 ? ReviewFixtures.threeReviews : singleReviewList,
      ];
    });

    axiosMock.onPut("/api/reviews/moderate").reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${tableTestId}-cell-row-1-col-item.id`),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByTestId(`${tableTestId}-cell-row-0-col-Approve-button`),
    );

    await waitFor(() => {
      expect(screen.getByTestId("ModeratorCommentsModal-comments")).toHaveValue(
        "",
      );
    });

    fireEvent.change(screen.getByTestId("ModeratorCommentsModal-comments"), {
      target: { value: "Done" },
    });

    fireEvent.click(screen.getByTestId("ModeratorCommentsModal-submit"));

    await waitFor(() => {
      expect(fetchCount).toBe(2);
      expect(
        screen.queryByTestId(`${tableTestId}-cell-row-1-col-item.id`),
      ).not.toBeInTheDocument();
    });
  });
});
