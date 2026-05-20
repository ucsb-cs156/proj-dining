import { fireEvent, render, screen } from "@testing-library/react";
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
    expect(
      screen.getByText(/Please add moderator comments before/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/this review/i)).toBeInTheDocument();
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
    expect(
      screen.getByText(
        /Please add moderator comments before rejecting this review./i,
      ),
    ).toBeInTheDocument();

    const submitButton = screen.getByTestId("moderation-modal-submit");
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalled();
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
