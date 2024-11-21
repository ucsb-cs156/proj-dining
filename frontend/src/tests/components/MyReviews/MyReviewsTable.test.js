import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { myReviewsFixtures } from "fixtures/myReviewsFixtures";
import MyReviewsTable from "main/components/MyReviews/MyReviewsTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UserTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content for ordinary user without delete", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsTable
            reviews={myReviewsFixtures.threeReviews}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Item",
      "Station",
      "Stars",
      "Review",
      "Status",
      "Moderator Comments",
    ];
    const expectedFields = [
      "id",
      "item",
      "station",
      "stars",
      "review",
      "status",
      "moderatorComments",
    ];
    const testId = "MyReviewsTable";

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
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();

    const approveButton = screen.queryByTestId(
        `${testId}-cell-row-0-col-Approve-button`,
      );
    expect(approveButton).not.toBeInTheDocument();

    const rejectButton = screen.queryByTestId(
        `${testId}-cell-row-0-col-Reject-button`,
      );
    expect(rejectButton).not.toBeInTheDocument();
  });

  test("Has the expected column headers and content for ordinary user with delete", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsTable
            reviews={myReviewsFixtures.threeReviews}
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
      "Review",
      "Status",
      "Moderator Comments",
    ];
    const expectedFields = [
      "id",
      "item",
      "station",
      "stars",
      "review",
      "status",
      "moderatorComments",
    ];
    const testId = "MyReviewsTable";

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
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");

    const approveButton = screen.queryByTestId(
        `${testId}-cell-row-0-col-Approve-button`,
      );
    expect(approveButton).not.toBeInTheDocument();

    const rejectButton = screen.queryByTestId(
        `${testId}-cell-row-0-col-Reject-button`,
      );
    expect(rejectButton).not.toBeInTheDocument();

  });

  test("Has the expected column headers and content for moderator without delete", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsTable
            reviews={myReviewsFixtures.threeReviews}
            moderatorOptions={true}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Item",
      "Station",
      "Stars",
      "Review",
      "Status",
      "Moderator Comments",
    ];
    const expectedFields = [
      "id",
      "item",
      "station",
      "stars",
      "review",
      "status",
      "moderatorComments",
    ];
    const testId = "MyReviewsTable";

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
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();

    const approveButton = screen.queryByTestId(
        `${testId}-cell-row-0-col-Approve-button`,
      );
    expect(approveButton).toBeInTheDocument();
    expect(approveButton).toHaveClass("btn-success");
    

    const rejectButton = screen.queryByTestId(
        `${testId}-cell-row-0-col-Reject-button`,
      );
    expect(rejectButton).toBeInTheDocument();
    expect(rejectButton).toHaveClass("btn-danger");
  });

  test("Has the expected column headers and content for moderator with delete", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsTable
            reviews={myReviewsFixtures.threeReviews}
            moderatorOptions={true}
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
      "Review",
      "Status",
      "Moderator Comments",
    ];
    const expectedFields = [
      "id",
      "item",
      "station",
      "stars",
      "review",
      "status",
      "moderatorComments",
    ];
    const testId = "MyReviewsTable";

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
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    const approveButton = screen.queryByTestId(
        `${testId}-cell-row-0-col-Approve-button`,
      );
    expect(approveButton).toBeInTheDocument();
    expect(approveButton).toHaveClass("btn-success");

    const rejectButton = screen.queryByTestId(
        `${testId}-cell-row-0-col-Reject-button`,
      );
    expect(rejectButton).toBeInTheDocument();
    expect(rejectButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to the edit page", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsTable
            reviews={myReviewsFixtures.threeReviews}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`MyReviewsTable-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const editButton = screen.getByTestId(
      `MyReviewsTable-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/myreviews/edit/1"),
    );
  });

  test("Delete button calls delete callback", async () => {
    // arrange
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/myreviews")
      .reply(200, { message: "Review deleted" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsTable
            reviews={myReviewsFixtures.threeReviews}
            deleteColumn={true}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered

    await waitFor(() => {
      expect(
        screen.getByTestId(`MyReviewsTable-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const deleteButton = screen.getByTestId(
      `MyReviewsTable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
