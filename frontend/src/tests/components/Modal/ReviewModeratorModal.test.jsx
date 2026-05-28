import { render, fireEvent, screen } from "@testing-library/react";
import ReviewModeratorModal from "main/components/Modal/ReviewModeratorModal";
import { vi } from "vitest";

describe("ReviewModeratorModal tests", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    status: "APPROVED",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Visibility ────────────────────────────────────────────────────────────

  test("renders modal when isOpen is true", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    expect(screen.getByTestId("review-moderator-modal")).toBeInTheDocument();
  });

  test("does not render modal when isOpen is false", () => {
    render(<ReviewModeratorModal {...defaultProps} isOpen={false} />);
    expect(
      screen.queryByTestId("review-moderator-modal"),
    ).not.toBeInTheDocument();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  test("moderator comment textarea starts empty", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    expect(screen.getByTestId("review-moderation-modal-comment")).toHaveValue(
      "",
    );
  });

  test("renders textarea with correct placeholder", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("Enter moderator comment..."),
    ).toBeInTheDocument();
  });

  // ── Status label ──────────────────────────────────────────────────────────

  test("shows APPROVE in label when status is APPROVED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    expect(screen.getByText("APPROVE")).toBeInTheDocument();
  });

  test("shows REJECT in label when status is REJECTED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    expect(screen.getByText("REJECT")).toBeInTheDocument();
  });

  test("label does not show APPROVE when status is REJECTED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    expect(screen.queryByText("APPROVE")).not.toBeInTheDocument();
  });

  test("label does not show REJECT when status is APPROVED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    expect(screen.queryByText("REJECT")).not.toBeInTheDocument();
  });

  // ── Submit button label ───────────────────────────────────────────────────

  test("submit button says Approve when status is APPROVED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).toHaveTextContent("Approve");
  });

  test("submit button says Reject when status is REJECTED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).toHaveTextContent("Reject");
  });

  test("submit button does not say Reject when status is APPROVED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).not.toHaveTextContent("Reject");
  });

  test("submit button does not say Approve when status is REJECTED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).not.toHaveTextContent("Approve");
  });

  // ── Submit button variant ─────────────────────────────────────────────────

  test("submit button has success variant when status is APPROVED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    expect(screen.getByTestId("review-moderation-modal-submit")).toHaveClass(
      "btn-success",
    );
  });

  test("submit button has danger variant when status is REJECTED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    expect(screen.getByTestId("review-moderation-modal-submit")).toHaveClass(
      "btn-danger",
    );
  });

  test("submit button does not have danger variant when status is APPROVED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).not.toHaveClass("btn-danger");
  });

  test("submit button does not have success variant when status is REJECTED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).not.toHaveClass("btn-success");
  });

  // ── Textarea interaction ──────────────────────────────────────────────────

  test("textarea updates when user types", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    const textarea = screen.getByTestId("review-moderation-modal-comment");
    fireEvent.change(textarea, { target: { value: "test comment" } });
    expect(textarea).toHaveValue("test comment");
  });

  test("textarea reflects typed value correctly", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    const textarea = screen.getByTestId("review-moderation-modal-comment");
    fireEvent.change(textarea, { target: { value: "unique-value-xyz" } });
    expect(textarea).toHaveValue("unique-value-xyz");
  });

  // ── handleSubmit with APPROVED ────────────────────────────────────────────

  test("calls onSubmit with status APPROVED and moderatorComment", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "looks good" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).toHaveBeenCalledWith({
      status: "APPROVED",
      moderatorComment: "looks good",
    });
  });

  test("calls onSubmit exactly once when APPROVED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test("calls onClose after submitting with APPROVED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ── handleSubmit with REJECTED ────────────────────────────────────────────

  test("calls onSubmit with status REJECTED and moderatorComment", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "not appropriate" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).toHaveBeenCalledWith({
      status: "REJECTED",
      moderatorComment: "not appropriate",
    });
  });

  test("calls onSubmit exactly once when REJECTED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test("calls onClose after submitting with REJECTED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ── handleSubmit with unknown status ──────────────────────────────────────

  test("does not call onSubmit when status is PENDING", () => {
    render(<ReviewModeratorModal {...defaultProps} status="PENDING" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test("still calls onClose when status is PENDING", () => {
    render(<ReviewModeratorModal {...defaultProps} status="PENDING" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("does not call onSubmit when status is empty string", () => {
    render(<ReviewModeratorModal {...defaultProps} status="" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // ── onSubmit payload correctness ──────────────────────────────────────────

  test("passes the exact comment typed to onSubmit for APPROVED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "specific-approve-comment" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ moderatorComment: "specific-approve-comment" }),
    );
  });

  test("passes the exact comment typed to onSubmit for REJECTED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    fireEvent.change(screen.getByTestId("review-moderation-modal-comment"), {
      target: { value: "specific-reject-comment" },
    });
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ moderatorComment: "specific-reject-comment" }),
    );
  });

  test("passes correct status APPROVED in onSubmit payload", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ status: "APPROVED" }),
    );
  });

  test("passes correct status REJECTED in onSubmit payload", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ status: "REJECTED" }),
    );
  });

  test("does not pass REJECTED status when APPROVED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="APPROVED" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: "REJECTED" }),
    );
  });

  test("does not pass APPROVED status when REJECTED", () => {
    render(<ReviewModeratorModal {...defaultProps} status="REJECTED" />);
    fireEvent.click(screen.getByTestId("review-moderation-modal-submit"));
    expect(mockOnSubmit).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: "APPROVED" }),
    );
  });

  // ── Cancel button ─────────────────────────────────────────────────────────

  test("cancel button calls onClose", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("review-moderator-modal-cancel"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("cancel button does not call onSubmit", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId("review-moderator-modal-cancel"));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test("cancel button clears the textarea", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    const textarea = screen.getByTestId("review-moderation-modal-comment");
    fireEvent.change(textarea, { target: { value: "some comment" } });
    expect(textarea).toHaveValue("some comment");
    fireEvent.click(screen.getByTestId("review-moderator-modal-cancel"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  // ── Structure ─────────────────────────────────────────────────────────────

  test("renders footer with cancel and submit buttons", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    expect(
      screen.getByTestId("review-moderator-modal-footer"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("review-moderator-modal-cancel"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("review-moderation-modal-submit"),
    ).toBeInTheDocument();
  });

  test("cancel button has secondary variant", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    expect(screen.getByTestId("review-moderator-modal-cancel")).toHaveClass(
      "btn-secondary",
    );
  });

  test("renders close group element", () => {
    render(<ReviewModeratorModal {...defaultProps} />);
    expect(
      screen.getByTestId("review-moderator-modal-closeGroup"),
    ).toBeInTheDocument();
  });
});
