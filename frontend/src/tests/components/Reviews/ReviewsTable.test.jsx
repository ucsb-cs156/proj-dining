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

  let axiosMock;

  beforeAll(() => {
    axiosMock = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    axiosMock.reset();
    mockedNavigate.mockClear();
  });

  const renderModerator = () => {
    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);
    axiosMock.onPut("/api/reviews/moderate").reply(200);

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={true}
        />
      </QueryClientProvider>,
    );
  };

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

  test("moderator buttons do not appear when userOptions=true moderatorOptions=false", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={true}
          moderatorOptions={false}
        />
      </QueryClientProvider>,
    );
    expect(
      screen.queryByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("Reviewstable-cell-row-0-col-Reject-button"),
    ).not.toBeInTheDocument();
  });

  test("user buttons do not appear when userOptions=false moderatorOptions=true", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("Reviewstable-cell-row-0-col-Edit-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("Reviewstable-cell-row-0-col-Delete-button"),
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

  // ── Modal

  test("modal is not visible on initial render", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("review-moderator-modal"),
    ).not.toBeInTheDocument();
  });

  test("clicking Approve opens modal with APPROVED status", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );

    expect(screen.getByTestId("review-moderator-modal")).toBeInTheDocument();
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).toHaveTextContent("Approve");
    expect(screen.getByTestId("review-moderation-modal-submit")).toHaveClass(
      "btn-success",
    );
  });

  test("clicking Reject opens modal with REJECTED status", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
    );

    expect(screen.getByTestId("review-moderator-modal")).toBeInTheDocument();
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).toHaveTextContent("Reject");
    expect(screen.getByTestId("review-moderation-modal-submit")).toHaveClass(
      "btn-danger",
    );
  });

  test("cancel button closes the modal", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    expect(screen.getByTestId("review-moderator-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("review-moderator-modal-cancel"));
    await waitFor(() => {
      expect(
        screen.queryByTestId("review-moderator-modal"),
      ).not.toBeInTheDocument();
    });
  });

  test("after cancel, clicking Approve opens modal again with correct status", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });

    // open then cancel
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    fireEvent.click(screen.getByTestId("review-moderator-modal-cancel"));
    await waitFor(() => {
      expect(
        screen.queryByTestId("review-moderator-modal"),
      ).not.toBeInTheDocument();
    });

    // open again — pendingStatus must be reset to null then set to APPROVED again
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).toHaveTextContent("Approve");
  });

  test("after cancel, clicking Reject opens modal again with correct status", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
      ).toBeInTheDocument();
    });

    // open then cancel
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
    );
    fireEvent.click(screen.getByTestId("review-moderator-modal-cancel"));
    await waitFor(() => {
      expect(
        screen.queryByTestId("review-moderator-modal"),
      ).not.toBeInTheDocument();
    });

    // open again — pendingStatus must be reset to null then set to REJECTED again
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
    );
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).toHaveTextContent("Reject");
  });

  test("handleSubmit sends correct payload for approve", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "Looks good" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toMatchObject({
        status: "APPROVED",
        moderatorComments: "Looks good",
      });
    });
  });

  test("approve payload does not contain status REJECTED", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "Looks good" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });
    expect(axiosMock.history.put[0].params.status).toBe("APPROVED");
    expect(axiosMock.history.put[0].params.status).not.toBe("REJECTED");
  });

  test("handleSubmit sends correct payload for reject", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
    );
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "Not appropriate" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toMatchObject({
        status: "REJECTED",
        moderatorComments: "Not appropriate",
      });
    });
  });

  test("reject payload does not contain status APPROVED", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
    );
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "Not appropriate" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });
    expect(axiosMock.history.put[0].params.status).toBe("REJECTED");
    expect(axiosMock.history.put[0].params.status).not.toBe("APPROVED");
  });

  test("modal closes after approve submit", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    expect(screen.getByTestId("review-moderator-modal")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "Looks good" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));

    await waitFor(() => {
      expect(
        screen.queryByTestId("review-moderator-modal"),
      ).not.toBeInTheDocument();
    });
  });

  test("modal closes after reject submit", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
    );
    expect(screen.getByTestId("review-moderator-modal")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "Not appropriate" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));

    await waitFor(() => {
      expect(
        screen.queryByTestId("review-moderator-modal"),
      ).not.toBeInTheDocument();
    });
  });

  test("moderatorComments value is passed from modal comment field for approve", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "specific-approve-comment" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params.moderatorComments).toBe(
        "specific-approve-comment",
      );
    });
  });

  test("moderatorComments value is passed from modal comment field for reject", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
      ).toBeInTheDocument();
    });
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Reject-button"),
    );
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "specific-reject-comment" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params.moderatorComments).toBe(
        "specific-reject-comment",
      );
    });
  });

  test("renders moderatorComments column header", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={false}
        />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Moderator Comment")).toBeInTheDocument();
    expect(
      screen.getByTestId("Reviewstable-cell-row-0-col-moderatorComments"),
    ).toBeInTheDocument();
  });

  test("moderatorComments cell renders the value correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTable
          reviews={ReviewFixtures.threeReviews}
          userOptions={false}
          moderatorOptions={false}
        />
      </QueryClientProvider>,
    );
    const cell = screen.getByTestId(
      "Reviewstable-cell-row-1-col-moderatorComments",
    );
    expect(cell).toHaveTextContent("Inappropriate content");
  });

  test("textarea is empty when modal is reopened after cancel", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });

    // open modal and type a comment
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "some comment" },
    });
    expect(screen.getByTestId("review-moderation-modal-comment")).toHaveValue(
      "some comment",
    );

    // cancel closes modal
    fireEvent.click(screen.getByTestId("review-moderator-modal-cancel"));
    await waitFor(() => {
      expect(
        screen.queryByTestId("review-moderator-modal"),
      ).not.toBeInTheDocument();
    });

    // reopen modal — textarea must be empty (kills setModeratorComment("") mutant)
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    expect(screen.getByTestId("review-moderation-modal-comment")).toHaveValue(
      "",
    );
  });

  test("textarea is empty when modal is reopened after Approve", async () => {
    renderModerator();
    await waitFor(() => {
      expect(
        screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
      ).toBeInTheDocument();
    });

    // open modal and type a comment
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "some comment" },
    });
    expect(screen.getByTestId("review-moderation-modal-comment")).toHaveValue(
      "some comment",
    );

    // Approve closes modal
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    await waitFor(() => {
      expect(
        screen.queryByTestId("review-moderator-modal"),
      ).not.toBeInTheDocument();
    });

    // reopen modal — textarea must be empty (kills setModeratorComment("") mutant)
    fireEvent.click(
      screen.getByTestId("Reviewstable-cell-row-0-col-Approve-button"),
    );
    expect(screen.getByTestId("review-moderation-modal-comment")).toHaveValue(
      "",
    );
  });
});
