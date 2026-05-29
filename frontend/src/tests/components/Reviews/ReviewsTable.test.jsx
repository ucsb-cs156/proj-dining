import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import ReviewsTable from "main/components/Reviews/ReviewsTable";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("ReviewsTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the base column headers and content", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={false}
        />
        ,
      </QueryClientProvider>,
    );
    expect(screen.getByText("Moderation Status")).toBeInTheDocument();
    expect(screen.getByText("Item Id")).toBeInTheDocument();
    expect(screen.getByText("Item Name")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("Date Served")).toBeInTheDocument();
    expect(screen.getByText("Dining Commons Code")).toBeInTheDocument();

    expect(
      screen.getByTestId(`Reviewstable-cell-row-0-col-status`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`Reviewstable-cell-row-0-col-item.id`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`Reviewstable-cell-row-0-col-item.name`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`Reviewstable-cell-row-0-col-itemsStars`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`Reviewstable-cell-row-0-col-reviewerComments`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`Reviewstable-cell-row-0-col-dateItemServed`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`Reviewstable-cell-row-0-col-item.diningCommonsCode`),
    ).toBeInTheDocument();

    const statusCell = screen.getByTestId("Reviewstable-cell-row-0-col-status");
    const expectedStatus = ReviewFixtures.threeReviews[0].status;
    expect(statusCell).toHaveTextContent(expectedStatus);

    const editButton = screen.queryByTestId(
      `Reviewstable-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();

    const deleteButton = screen.queryByTestId(
      `Reviewstable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();

    const approveButton = screen.queryByTestId(
      `Reviewstable-cell-row-0-col-Approve-button`,
    );
    expect(approveButton).not.toBeInTheDocument();

    const rejectButton = screen.queryByTestId(
      `Reviewstable-cell-row-0-col-Reject-button`,
    );
    expect(rejectButton).not.toBeInTheDocument();
  });

  test("Regular user buttons appear and work properly", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={true}
          moderatorOptions={false}
        />
        ,
      </QueryClientProvider>,
    );

    //edit button
    const editButton = screen.getByTestId(
      `Reviewstable-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/reviews/edit/1"),
    );

    //delete button
    const deleteButton = screen.getByTestId(
      `Reviewstable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/reviews/reviewer")
      .reply(200, { message: "Review deleted" });

    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });

  test("Moderator buttons appear and work properly", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={true}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`Reviewstable-cell-row-0-col-Approve-button`),
      ).toBeInTheDocument();
    });

    const approveButton = screen.getByTestId(
      `Reviewstable-cell-row-0-col-Approve-button`,
    );
    expect(approveButton).toBeInTheDocument();
    expect(approveButton).toHaveClass("btn-primary");

    fireEvent.click(approveButton);

    const rejectButton = screen.getByTestId(
      `Reviewstable-cell-row-0-col-Reject-button`,
    );
    expect(rejectButton).toBeInTheDocument();
    expect(rejectButton).toHaveClass("btn-danger");

    fireEvent.click(rejectButton);
  });

  test("moderation modal is hidden on initial render", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={true}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByText("Approve Review")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject Review")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("moderation-modal-comments"),
    ).not.toBeInTheDocument();
  });

  test("Renders stars icons and formatted date correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={false}
        />
      </QueryClientProvider>,
    );

    const scoreCell = screen.getByTestId(
      `Reviewstable-cell-row-0-col-itemsStars`,
    );
    expect(scoreCell).toHaveTextContent("⭐⭐⭐⭐");

    const review = ReviewFixtures.threeReviews[0];
    const formattedDate = new Date(review.dateItemServed).toLocaleDateString(
      "en-US",
    );
    const dateCell = screen.getByTestId(
      `Reviewstable-cell-row-0-col-dateItemServed`,
    );
    expect(dateCell).toHaveTextContent(formattedDate);
  });

  test("opens moderation modal and submits approve review comments", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/reviews/moderate").reply(200, {
      message: "Review moderated",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={true}
        />
      </QueryClientProvider>,
    );

    const approveButton = await screen.findByTestId(
      `Reviewstable-cell-row-0-col-Approve-button`,
    );
    fireEvent.click(approveButton);

    expect(screen.getByText("Approve Review")).toBeInTheDocument();

    const commentsField = screen.getByTestId("moderation-modal-comments");
    const submitButton = screen.getByTestId("moderation-modal-submit");

    expect(submitButton).toBeDisabled();
    fireEvent.change(commentsField, {
      target: { value: "Looks good" },
    });
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].url).toBe("/api/reviews/moderate");
    expect(axiosMock.history.put[0].params).toEqual({
      id: 1,
      status: "APPROVED",
      moderatorComments: "Looks good",
    });
  });

  test("opens reject modal and closes without submitting", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/reviews/moderate").reply(200, {
      message: "Review moderated",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={true}
        />
      </QueryClientProvider>,
    );

    const rejectButton = await screen.findByTestId(
      `Reviewstable-cell-row-0-col-Reject-button`,
    );
    fireEvent.click(rejectButton);

    expect(screen.getByText("Reject Review")).toBeInTheDocument();
    expect(screen.getByTestId("moderation-modal-submit")).toHaveClass(
      "btn-danger",
    );

    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() =>
      expect(screen.queryByText("Reject Review")).not.toBeInTheDocument(),
    );
    expect(axiosMock.history.put.length).toBe(0);
  });

  test("opens reject modal and submits reject review comments", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPut("/api/reviews/moderate").reply(200, {
      message: "Review moderated",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={true}
        />
      </QueryClientProvider>,
    );

    const rejectButton = await screen.findByTestId(
      `Reviewstable-cell-row-0-col-Reject-button`,
    );
    fireEvent.click(rejectButton);

    const commentsField = screen.getByTestId("moderation-modal-comments");
    const submitButton = screen.getByTestId("moderation-modal-submit");

    fireEvent.change(commentsField, {
      target: { value: "Not acceptable" },
    });
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].url).toBe("/api/reviews/moderate");
    expect(axiosMock.history.put[0].params).toEqual({
      id: 1,
      status: "REJECTED",
      moderatorComments: "Not acceptable",
    });
  });

  test("approve modal receives the selected review", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={true}
        />
      </QueryClientProvider>,
    );

    const approveButton = await screen.findByTestId(
      `Reviewstable-cell-row-0-col-Approve-button`,
    );
    fireEvent.click(approveButton);

    expect(screen.getByText("Approve Review")).toBeInTheDocument();
    expect(
      screen.getByText(ReviewFixtures.threeReviews[0].reviewerComments),
    ).toBeInTheDocument();
  });
});
