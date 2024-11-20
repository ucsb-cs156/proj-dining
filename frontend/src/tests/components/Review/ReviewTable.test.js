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

describe("UserTable tests", () => {
  const queryClient = new QueryClient();

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
            moderatorOptions={false} // Pass false
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
      "Item",
      "Station",
      "Stars",
      "Review Text",
      "Status",
      "Moderator Comments",
    ];
    const expectedFields = [
      "id",
      "item",
      "station",
      "stars",
      "reviewText",
      "status",
      "modComments",
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

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();
  });

  test("Has the expected colum headers and content for adminUser", () => {
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
      "Item",
      "Station",
      "Stars",
      "Review Text",
      "Status",
      "Moderator Comments",
    ];
    const expectedFields = [
      "id",
      "item",
      "station",
      "stars",
      "reviewText",
      "status",
      "modComments",
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

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to the edit page for admin user", async () => {
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

    await waitFor(() => {
      expect(
        screen.getByTestId(`ReviewTable-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const editButton = screen.getByTestId(
      `ReviewTable-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/myreviews/edit/1"),
    );
  });

  test("Delete button calls delete callback", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/myreviews")
      .reply(200, { message: "Review deleted" });

    // act - render the component
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

    // assert - check that the expected content is rendered

    await waitFor(() => {
      expect(
        screen.getByTestId(`ReviewTable-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const deleteButton = screen.getByTestId(
      `ReviewTable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
