import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import ReviewsTable from "../../../main/components/Reviews/ReviewsTable";
import { ReviewFixtures } from "../../../fixtures/reviewFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
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
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("Date Served")).toBeInTheDocument();

    expect(
      screen.getByTestId(`Reviewstable-cell-row-0-col-itemId`),
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

    await waitFor(() => {
      expect(
        screen.getByTestId(`Reviewstable-cell-row-0-col-itemId`),
      ).toHaveTextContent("7");
    });

    expect(screen.getByText("Item Name")).toBeInTheDocument();
    expect(
      screen.getByTestId("Reviewstable-cell-row-0-col-itemName"),
    ).toHaveTextContent("Make Your Own Waffle (v)");

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
      .onDelete("/api/reviews")
      .reply(200, { message: "Review deleted" });

    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ itemId: 7 });
  });

  test("Moderator buttons appear and work properly", async () => {
    const approveCallback = jest.fn();
    const rejectCallback = jest.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={true}
          approveCallback={approveCallback}
          rejectCallback={rejectCallback}
        />
        ,
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`Reviewstable-cell-row-0-col-itemId`),
      ).toHaveTextContent("7");
    });

    //approve button
    const approveButton = screen.getByTestId(
      `Reviewstable-cell-row-0-col-Approve-button`,
    );
    expect(approveButton).toBeInTheDocument();
    expect(approveButton).toHaveClass("btn-primary");

    fireEvent.click(approveButton);
    expect(approveCallback).toHaveBeenCalledTimes(1);

    //reject button
    const rejectButton = screen.getByTestId(
      `Reviewstable-cell-row-0-col-Reject-button`,
    );
    expect(rejectButton).toBeInTheDocument();
    expect(rejectButton).toHaveClass("btn-danger");

    fireEvent.click(rejectButton);
    expect(rejectCallback).toHaveBeenCalledTimes(1);
  });
});
