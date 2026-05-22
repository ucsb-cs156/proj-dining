import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import ModerateReviewModal from "main/components/Reviews/ModerateReviewModal";

describe("ModerateReviewModal (strong tests)", () => {
  const mockToggleShowModal = vi.fn();
  const mockOnSubmitAction = vi.fn();

  const sampleReview = {
    id: 1,
    item: { name: "Burger" },
    reviewerComments: "Really good!",
  };

  const renderModal = (status = "APPROVED", review = sampleReview) => {
    render(
      <div className="modal show" style={{ display: "block" }}>
        <ModerateReviewModal
          showModal={true}
          toggleShowModal={mockToggleShowModal}
          // toggleShowModal={closeModal}
          review={review}
          status={status}
          onSubmitAction={mockOnSubmitAction}
        />
      </div>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders approve mode correctly", () => {
    renderModal("APPROVED");

    expect(screen.getByText("Approve Review")).toBeInTheDocument();
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Burger")).toBeInTheDocument();
    expect(screen.getByText("Really good!")).toBeInTheDocument();
  });

  test("renders reject mode correctly", () => {
    renderModal("REJECTED");

    expect(screen.getByText("Reject Review")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  test("cancel closes modal", async () => {
    const user = userEvent.setup();

    renderModal();

    await user.click(screen.getByTestId("ModerateReviewModal-cancel"));

    expect(mockToggleShowModal).toHaveBeenCalledWith(false);
  });

  test("submit APPROVE sends correct payload", async () => {
    const user = userEvent.setup();

    renderModal("APPROVED");

    await user.type(
      screen.getByPlaceholderText("Optional moderation notes..."),
      "good review"
    );

    await user.click(screen.getByTestId("ModerateReviewModal-submit"));

    await waitFor(() => {
      expect(mockOnSubmitAction).toHaveBeenCalledTimes(1);

      expect(mockOnSubmitAction.mock.calls[0][0]).toEqual({
        review: sampleReview,
        status: "APPROVED",
        moderatorComments: "good review",
      });
    });
  });

  test("submit REJECT sends correct payload", async () => {
    const user = userEvent.setup();

    renderModal("REJECTED");

    await user.type(
      screen.getByPlaceholderText("Optional moderation notes..."),
      "not acceptable"
    );

    await user.click(screen.getByTestId("ModerateReviewModal-submit"));

    await waitFor(() => {
      expect(mockOnSubmitAction).toHaveBeenCalledTimes(1);

      expect(mockOnSubmitAction.mock.calls[0][0]).toEqual({
        review: sampleReview,
        status: "REJECTED",
        moderatorComments: "not acceptable",
      });
    });
  });

  test("does not submit when review is null", async () => {
    const user = userEvent.setup();

    renderModal("APPROVED", null);

    await user.click(screen.getByTestId("ModerateReviewModal-submit"));

    expect(mockOnSubmitAction).not.toHaveBeenCalled();
  });

    test("does not submit when status is null", async () => {
      const user = userEvent.setup();

      renderModal(null);

      await user.click(screen.getByTestId("ModerateReviewModal-submit"));

      expect(mockOnSubmitAction).not.toHaveBeenCalled();
    });

    test("textarea starts empty on open", async () => {
    const user = userEvent.setup();
    renderModal("APPROVED");
    expect(screen.getByPlaceholderText("Optional moderation notes...").value).toBe("");
  });

  test("item and review divs have correct marginBottom style", () => {
    renderModal("APPROVED");

    const itemDiv = screen.getByText("Burger").closest("div");
    const reviewDiv = screen.getByText("Really good!").closest("div");

    expect(itemDiv).toHaveStyle({ marginBottom: "10px" });
    expect(reviewDiv).toHaveStyle({ marginBottom: "10px" });
  });




});

