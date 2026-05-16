import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import ModerateReviewModal from "main/components/Reviews/ModerateReviewModal";
import { vi } from "vitest";
import "@testing-library/jest-dom";

let capturedOnSuccess;
let capturedAxiosParamsFn;
const mockMutate = vi.fn();

vi.mock("main/utils/useBackend", () => ({
  useBackendMutation: vi.fn((axiosParamsFn, callbacks) => {
    capturedAxiosParamsFn = axiosParamsFn;
    capturedOnSuccess = callbacks.onSuccess;
    return { mutate: mockMutate };
  }),
}));

describe("ModerateReviewModal", () => {
  const mockOnClose = vi.fn();

  const sampleReview = {
    id: 1,
    item: { name: "Burger" },
    reviewerComments: "Really good!",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Rendering ───────────────────────────────────────────────────────────────

  test("does not render when show is false", () => {
    const { container } = render(
      <ModerateReviewModal
        show={false}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("does not render when review is null", () => {
    const { container } = render(
      <ModerateReviewModal
        show={true}
        review={null}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("renders modal when show is true and review is provided", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByText("Approve Review")).toBeInTheDocument();
  });

  // ─── Title changes by status ──────────────────────────────────────────────────

  test("shows 'Approve Review' title when status is APPROVED", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByText("Approve Review")).toBeInTheDocument();
  });

  test("shows 'Reject Review' title when status is REJECTED", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="REJECTED"
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByText("Reject Review")).toBeInTheDocument();
  });

  // ─── Submit button label changes by status ────────────────────────────────────

  test("submit button says 'Approve' when status is APPROVED", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByText("Approve")).toBeInTheDocument();
  });

  test("submit button says 'Reject' when status is REJECTED", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="REJECTED"
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  // ─── Review content displayed ─────────────────────────────────────────────────

  test("displays the item name", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByText("Burger")).toBeInTheDocument();
  });

  test("displays the reviewer comments", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByText("Really good!")).toBeInTheDocument();
  });

  // ─── Cancel / close ───────────────────────────────────────────────────────────

  test("calls onClose when Cancel button is clicked", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  // ─── Comments textarea ────────────────────────────────────────────────────────

  test("moderator comments textarea starts empty", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    expect(
      screen.getByPlaceholderText("Optional moderation notes...").value,
    ).toBe("");
  });

  test("updates comments state when user types", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    const textarea = screen.getByPlaceholderText("Optional moderation notes...");
    fireEvent.change(textarea, { target: { value: "Looks good to me" } });
    expect(textarea.value).toBe("Looks good to me");
  });

  test("clears comments when modal is reopened", () => {
    const { rerender } = render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Optional moderation notes..."),
      { target: { value: "some comment" } },
    );

    rerender(
      <ModerateReviewModal
        show={false}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    rerender(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    expect(
      screen.getByPlaceholderText("Optional moderation notes...").value,
    ).toBe("");
  });

  // ─── Mutation ─────────────────────────────────────────────────────────────────

  test("calls mutation.mutate when Approve is clicked", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );
    fireEvent.click(screen.getByText("Approve"));
    expect(mockMutate).toHaveBeenCalled();
  });

  test("calls mutation.mutate when Reject is clicked", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="REJECTED"
        onClose={mockOnClose}
      />,
    );
    fireEvent.click(screen.getByText("Reject"));
    expect(mockMutate).toHaveBeenCalled();
  });

  test("handleSubmit does nothing if status is undefined", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status={undefined}
        onClose={mockOnClose}
      />,
    );
    fireEvent.click(screen.getByText("Reject"));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("objectToAxiosParams builds correct params", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Optional moderation notes..."),
      { target: { value: "Looks good" } },
    );

    fireEvent.click(screen.getByText("Approve"));
    expect(mockMutate).toHaveBeenCalled();

    expect(capturedAxiosParamsFn()).toEqual({
      url: "/api/reviews/moderate",
      method: "PUT",
      params: {
        id: sampleReview.id,
        status: "APPROVED",
        moderatorComments: "Looks good",
      },
    });
  });

  test("onSuccess clears comments and calls onClose", async () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Optional moderation notes..."),
      { target: { value: "some comment" } },
    );

    capturedOnSuccess();

    await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
  });
});