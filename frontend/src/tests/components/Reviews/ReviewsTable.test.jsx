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

    expect(screen.getByText("Item Id")).toBeInTheDocument();
    expect(screen.getByText("Item Name")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("Date Served")).toBeInTheDocument();
    expect(screen.getByText("Dining Commons Code")).toBeInTheDocument();

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

    const editButton = screen.queryByTestId(
      `Reviewstable-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();

    const deleteButton = screen.queryByTestId(
      `Reviewstable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();

    const acceptButton = screen.queryByTestId(
      `Reviewstable-cell-row-0-col-Accept-button`,
    );
    expect(acceptButton).not.toBeInTheDocument();

    const rejectButton = screen.queryByTestId(
      `Reviewstable-cell-row-0-col-Reject-button`,
    );
    expect(rejectButton).not.toBeInTheDocument();
  });

  test("Does not show status column by default", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={false}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByText("Status")).not.toBeInTheDocument();
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
        ,
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`Reviewstable-cell-row-0-col-item.id`),
      ).toHaveTextContent("7");
    });

    //approve button
    const approveButton = screen.getByTestId(
      `Reviewstable-cell-row-0-col-Approve-button`,
    );
    expect(approveButton).toBeInTheDocument();
    expect(approveButton).toHaveClass("btn-primary");

    fireEvent.click(approveButton);

    //reject button
    const rejectButton = screen.getByTestId(
      `Reviewstable-cell-row-0-col-Reject-button`,
    );
    expect(rejectButton).toBeInTheDocument();
    expect(rejectButton).toHaveClass("btn-danger");

    fireEvent.click(rejectButton);
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

  test("Shows moderation status column when requested", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={false}
          showModerationStatus={true}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Status")).toBeInTheDocument();

    // first fixture has status AWAITING_REVIEW -> rendered as 'AWAITING REVIEW'
    expect(
      screen.getByTestId(`Reviewstable-cell-row-0-col-status`),
    ).toHaveTextContent("AWAITING REVIEW");
  });

  test("Shows empty status when status is missing", () => {
    const reviewsMissingStatus = ReviewFixtures.threeReviews.map((r, i) =>
      i === 0 ? { ...r, status: null } : r,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={reviewsMissingStatus}
          userOptions={false}
          moderatorOptions={false}
          showModerationStatus={true}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(
      screen.getByTestId(`Reviewstable-cell-row-0-col-status`),
    ).toHaveTextContent("");
  });
});
