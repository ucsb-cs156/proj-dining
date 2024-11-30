import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { reviewFixtures } from "fixtures/reviewFixtures";
import ReviewTable from "main/components/Review/ReviewTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("ReviewTable tests", () => {
  const queryClient = new QueryClient();

  test("Approve button triggers callback", () => {
    console.log = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewTable
            reviews={reviewFixtures.threeReviews}
            currentUser={currentUserFixtures.userOnly}
            moderatorOptions={true}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Approve-button",
    );
    fireEvent.click(approveButton);

    expect(console.log).toHaveBeenCalledWith("Approved review with id: 1");
  });

  test("Reject button triggers callback", () => {
    console.log = jest.fn(); // Mock console.log

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewTable
            reviews={reviewFixtures.threeReviews}
            currentUser={currentUserFixtures.userOnly}
            moderatorOptions={true}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const rejectButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Reject-button",
    );
    fireEvent.click(rejectButton);

    expect(console.log).toHaveBeenCalledWith("Rejected review with id: 1");
  });

  test("Shows Approve and Reject buttons when moderatorOptions is true", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewTable
            reviews={reviewFixtures.threeReviews}
            currentUser={currentUser}
            moderatorOptions={true}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Approve-button",
    );
    const rejectButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Reject-button",
    );

    expect(approveButton).toBeInTheDocument();
    expect(approveButton).toHaveClass("btn-success");
    expect(rejectButton).toBeInTheDocument();
    expect(rejectButton).toHaveClass("btn-danger");
  });

  test("Does not show Approve and Reject buttons when moderatorOptions is false", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewTable
            reviews={reviewFixtures.threeReviews}
            currentUser={currentUser}
            moderatorOptions={false}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveButton = screen.queryByTestId(
      "ReviewTable-cell-row-0-col-Approve-button",
    );
    const rejectButton = screen.queryByTestId(
      "ReviewTable-cell-row-0-col-Reject-button",
    );

    expect(approveButton).not.toBeInTheDocument();
    expect(rejectButton).not.toBeInTheDocument();
  });

  test("Has the expected column headers and content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewTable
            reviews={reviewFixtures.threeReviews}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Reviewer ID",
      "Item ID",
      "Date Served",
      "Stars",
      "Review Text",
      "Status",
      "Mod ID",
      "Moderator Comments",
      "Created Date",
      "Last Edited Date",
    ];

    const expectedFields = [
      "id",
      "reviewerId",
      "itemId",
      "dateServed",
      "stars",
      "reviewText",
      "status",
      "modId",
      "modComments",
      "createdDate",
      "lastEditedDate",
    ];

    const testId = "ReviewTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();
  });

  test("Has the expected column headers and content for adminUser", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewTable
            reviews={reviewFixtures.threeReviews}
            currentUser={currentUser}
            deleteColumn={true}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Reviewer ID",
      "Item ID",
      "Date Served",
      "Stars",
      "Review Text",
      "Status",
      "Mod ID",
      "Moderator Comments",
      "Created Date",
      "Last Edited Date",
    ];

    const expectedFields = [
      "id",
      "reviewerId",
      "itemId",
      "dateServed",
      "stars",
      "reviewText",
      "status",
      "modId",
      "modComments",
      "createdDate",
      "lastEditedDate",
    ];

    const testId = "ReviewTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Delete button calls delete callback", async () => {
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/reviews")
      .reply(200, { message: "Review deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewTable
            reviews={reviewFixtures.threeReviews}
            currentUser={currentUser}
            deleteColumn={true}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Delete-button",
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
    expect(axiosMock.history.delete[0].url).toBe("/api/reviews");
  });

  test("Does not show Delete button when deleteColumn is false", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewTable
            reviews={reviewFixtures.threeReviews}
            currentUser={currentUser}
            deleteColumn={false}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.queryByTestId(
      "ReviewTable-cell-row-0-col-Delete-button",
    );
    expect(deleteButton).not.toBeInTheDocument();
  });
});
