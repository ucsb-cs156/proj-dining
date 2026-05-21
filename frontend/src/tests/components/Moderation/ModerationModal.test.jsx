import { fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import ModerationModal from "main/components/Moderation/ModerationModal";

const review = {
  id: 123,
  item: { name: "Grilled Cheese" },
};

describe("ModerationModal tests", () => {
  test("renders approve modal with review details and disabled submit when comments are empty", () => {
    const onHide = vi.fn();
    const onModeratorCommentsChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ModerationModal
        show={true}
        onHide={onHide}
        status="APPROVED"
        moderatorComments=""
        onModeratorCommentsChange={onModeratorCommentsChange}
        onSubmit={onSubmit}
        review={review}
      />,
    );

    expect(screen.getByText("Approve Review")).toBeInTheDocument();

    //  expect(
    //    screen.getByText(/Please add moderator comments before/i),
    //  ).toBeInTheDocument();
    //  expect(screen.getByText(/this review/i)).toBeInTheDocument();

    expect(
      screen.getByText(
        /Please add moderator comments before approving this review\./i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/Review ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/123/)).toBeInTheDocument();
    expect(screen.getByText(/Item:/i)).toBeInTheDocument();
    expect(screen.getByText(/Grilled Cheese/i)).toBeInTheDocument();

    const submitButton = screen.getByTestId("moderation-modal-submit");
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByTestId("moderation-modal-comments"), {
      target: { value: "Looks good" },
    });

    expect(onModeratorCommentsChange).toHaveBeenCalledWith("Looks good");
  });

  test("renders reject modal with comment input and calls submit callback", () => {
    const onHide = vi.fn();
    const onModeratorCommentsChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ModerationModal
        show={true}
        onHide={onHide}
        status="REJECTED"
        moderatorComments="Needs changes"
        onModeratorCommentsChange={onModeratorCommentsChange}
        onSubmit={onSubmit}
        review={review}
      />,
    );

    expect(screen.getByText("Reject Review")).toBeInTheDocument();
    const rejectModal = within(screen.getByRole("dialog"));
    expect(
      rejectModal.getByText(
        /Please add moderator comments before rejecting this review\./i,
      ),
    ).toBeInTheDocument();
    const submitButton = screen.getByTestId("moderation-modal-submit");
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveClass("btn-danger");

    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalled();
  });

  test("renders approve and reject buttons with correct bootstrap variants", () => {
    const onHide = vi.fn();
    const onModeratorCommentsChange = vi.fn();
    const onSubmit = vi.fn();

    const { rerender } = render(
      <ModerationModal
        show={true}
        onHide={onHide}
        status="APPROVED"
        moderatorComments="Looks good"
        onModeratorCommentsChange={onModeratorCommentsChange}
        onSubmit={onSubmit}
        review={review}
      />,
    );

    const approveButton = screen.getByTestId("moderation-modal-submit");
    expect(approveButton).toHaveClass("btn-primary");
    expect(approveButton).toHaveTextContent("Approve");

    rerender(
      <ModerationModal
        show={true}
        onHide={onHide}
        status="REJECTED"
        moderatorComments="Needs changes"
        onModeratorCommentsChange={onModeratorCommentsChange}
        onSubmit={onSubmit}
        review={review}
      />,
    );

    const rejectButton = screen.getByTestId("moderation-modal-submit");
    expect(rejectButton).toHaveClass("btn-danger");
    expect(rejectButton).toHaveTextContent("Reject");
  });

  test("disables submit for whitespace-only comments and shows active Approve text", () => {
    const onHide = vi.fn();
    const onModeratorCommentsChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ModerationModal
        show={true}
        onHide={onHide}
        status="APPROVED"
        moderatorComments="   "
        onModeratorCommentsChange={onModeratorCommentsChange}
        onSubmit={onSubmit}
        review={review}
      />,
    );

    const approveModal = within(screen.getByRole("dialog"));

    // expect(
    //   approveModal.getByText(/Please add moderator comments before/i),
    // ).toBeInTheDocument();
    // expect(approveModal.getByText(/this review\./i)).toBeInTheDocument();
    expect(
      approveModal.getByText(
        /Please add moderator comments before approving this review\./i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Approve")).toBeInTheDocument();

    const submitButton = screen.getByTestId("moderation-modal-submit");
    expect(submitButton).toBeDisabled();
  });

  test("shows Unknown when review item name is missing", () => {
    const onHide = vi.fn();
    const onModeratorCommentsChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ModerationModal
        show={true}
        onHide={onHide}
        status="APPROVED"
        moderatorComments=""
        onModeratorCommentsChange={onModeratorCommentsChange}
        onSubmit={onSubmit}
        review={{ id: 321, item: {} }}
      />,
    );

    expect(screen.getByText(/Review ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/321/)).toBeInTheDocument();
    expect(screen.getByText(/Item:/i)).toBeInTheDocument();
    expect(screen.getByText(/Unknown/i)).toBeInTheDocument();
  });
});
