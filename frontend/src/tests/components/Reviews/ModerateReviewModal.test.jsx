import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";

import ModerateReviewModal from "main/components/Reviews/ModerateReviewModal";
import { useBackendMutation } from "main/utils/useBackend";

let capturedOnSuccess;
let capturedAxiosParamsFn;

const mockMutate = vi.fn();

vi.mock("main/utils/useBackend", () => ({
  useBackendMutation: vi.fn((axiosParamsFn, callbacks) => {
    capturedAxiosParamsFn = axiosParamsFn;
    capturedOnSuccess = callbacks.onSuccess;

    return {
      mutate: mockMutate,
    };
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

  describe("rendering", () => {
    test("renders approve title and button for APPROVED status", () => {
      render(
        <ModerateReviewModal
          show={true}
          review={sampleReview}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("Approve Review")).toBeInTheDocument();
      expect(screen.getByText("Approve")).toBeInTheDocument();
    });

    test("renders reject title and button for REJECTED status", () => {
      render(
        <ModerateReviewModal
          show={true}
          review={sampleReview}
          status="REJECTED"
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("Reject Review")).toBeInTheDocument();
      expect(screen.getByText("Reject")).toBeInTheDocument();

      expect(screen.queryByText("Approve")).not.toBeInTheDocument();
      expect(screen.queryByText("Approve Review")).not.toBeInTheDocument();
    });

    test("renders item name and reviewer comments", () => {
      render(
        <ModerateReviewModal
          show={true}
          review={sampleReview}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("Burger")).toBeInTheDocument();
      expect(screen.getByText("Really good!")).toBeInTheDocument();
    });

    test("renders safely when review is null", () => {
      render(
        <ModerateReviewModal
          show={true}
          review={null}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("Approve Review")).toBeInTheDocument();
    });

    test("renders safely when review.item is undefined", () => {
      const reviewWithoutItem = {
        ...sampleReview,
        item: undefined,
      };

      render(
        <ModerateReviewModal
          show={true}
          review={reviewWithoutItem}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("Approve Review")).toBeInTheDocument();
    });

    test("item and review sections have marginBottom styling", () => {
      render(
        <ModerateReviewModal
          show={true}
          review={sampleReview}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      const itemDiv = screen.getByText("Burger").closest("div");
      const reviewDiv = screen.getByText("Really good!").closest("div");

      expect(itemDiv).toHaveStyle({ marginBottom: "10px" });
      expect(reviewDiv).toHaveStyle({ marginBottom: "10px" });
    });
  });

  describe("textarea behavior", () => {
    test("textarea starts empty", () => {
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

    test("updates textarea when user types", () => {
      render(
        <ModerateReviewModal
          show={true}
          review={sampleReview}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      const textarea = screen.getByPlaceholderText(
        "Optional moderation notes...",
      );

      fireEvent.change(textarea, {
        target: { value: "Looks good to me" },
      });

      expect(textarea.value).toBe("Looks good to me");
    });

    test("clears comments when modal reopens", () => {
      const { rerender } = render(
        <ModerateReviewModal
          show={true}
          review={sampleReview}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      const textarea = screen.getByPlaceholderText(
        "Optional moderation notes...",
      );

      fireEvent.change(textarea, {
        target: { value: "some comment" },
      });

      expect(textarea.value).toBe("some comment");

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

      expect(textarea.value).toBe("");
    });

    test("does not clear comments when props rerender with show=true", () => {
      const { rerender } = render(
        <ModerateReviewModal
          show={true}
          review={sampleReview}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      const textarea = screen.getByPlaceholderText(
        "Optional moderation notes...",
      );

      fireEvent.change(textarea, {
        target: { value: "my comment" },
      });

      rerender(
        <ModerateReviewModal
          show={true}
          review={sampleReview}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      expect(textarea.value).toBe("my comment");
    });
  });

  describe("buttons and submit behavior", () => {
    test("calls onClose when Cancel clicked", () => {
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

    test("calls mutation.mutate when Approve clicked", () => {
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

    test("calls mutation.mutate when Reject clicked", () => {
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

    test("does not mutate when review is null", () => {
      render(
        <ModerateReviewModal
          show={true}
          review={null}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      fireEvent.click(screen.getByText("Approve"));

      expect(mockMutate).not.toHaveBeenCalled();
    });

    test("does not mutate when status is null", () => {
      render(
        <ModerateReviewModal
          show={true}
          review={sampleReview}
          status={null}
          onClose={mockOnClose}
        />,
      );

      fireEvent.click(screen.getByText("Reject"));

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe("axios params", () => {
    test("builds correct params for approved review", () => {
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
        {
          target: { value: "Looks good" },
        },
      );

      expect(capturedAxiosParamsFn()).toEqual({
        url: "/api/reviews/moderate",
        method: "PUT",
        params: {
          id: 1,
          status: "APPROVED",
          moderatorComments: "Looks good",
        },
      });
    });

    test("uses correct review id", () => {
      const differentReview = {
        ...sampleReview,
        id: 42,
      };

      render(
        <ModerateReviewModal
          show={true}
          review={differentReview}
          status="REJECTED"
          onClose={mockOnClose}
        />,
      );

      expect(capturedAxiosParamsFn()).toEqual({
        url: "/api/reviews/moderate",
        method: "PUT",
        params: {
          id: 42,
          status: "REJECTED",
          moderatorComments: "",
        },
      });
    });

    test("returns empty object when review is null", () => {
      render(
        <ModerateReviewModal
          show={true}
          review={null}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      expect(capturedAxiosParamsFn()).toEqual({});
    });
  });

  describe("mutation hook", () => {
    test("useBackendMutation called with correct query key", () => {
      render(
        <ModerateReviewModal
          show={true}
          review={sampleReview}
          status="APPROVED"
          onClose={mockOnClose}
        />,
      );

      expect(useBackendMutation).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Object),
        ["/api/reviews/needsmoderation"],
      );
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

      const textarea = screen.getByPlaceholderText(
        "Optional moderation notes...",
      );

      fireEvent.change(textarea, {
        target: { value: "some comment" },
      });

      expect(textarea.value).toBe("some comment");

      capturedOnSuccess();

      await waitFor(() => {
        expect(textarea.value).toBe("");
      });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test("objectToAxiosParams hits !review branch", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={null}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    const result = capturedAxiosParamsFn();

    expect(result).toEqual({});
  });

  test("handleSubmit hits !review branch", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={null}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByText("Approve"));

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("handleSubmit hits !status branch", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status={null}
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByText("Reject"));

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("handleSubmit hits successful mutation branch", () => {
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

  test("objectToAxiosParams returns empty object when review is null", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={null}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    expect(capturedAxiosParamsFn()).toEqual({});
  });

  test("objectToAxiosParams does not return empty object when review exists", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    expect(capturedAxiosParamsFn()).not.toEqual({});
    expect(capturedAxiosParamsFn().params.id).toBe(1);
  });

  test("handleSubmit prevents mutation when review is null", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={null}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByText("Approve"));

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("handleSubmit prevents mutation when status is null", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status={null}
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByText("Reject"));

    expect(mockMutate).not.toHaveBeenCalled();
  });

  test("handleSubmit calls mutation when review and status exist", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByText("Approve"));

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  test("comments state initializes as empty string", () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={mockOnClose}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      "Optional moderation notes...",
    );

    expect(textarea.value).toBe("");
  });

  test("does NOT reset comments when show remains true", () => {
    const { rerender } = render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      "Optional moderation notes...",
    );

    fireEvent.change(textarea, {
      target: { value: "persistent comment" },
    });

    expect(textarea.value).toBe("persistent comment");

    // rerender with SAME show=true
    rerender(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    // THIS is what kills the mutant
    expect(textarea.value).toBe("persistent comment");
  });

  test("clears comments only when show transitions false -> true", () => {
    const { rerender } = render(
      <ModerateReviewModal
        show={false}
        review={sampleReview}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    // open modal
    rerender(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      "Optional moderation notes...",
    );

    fireEvent.change(textarea, {
      target: { value: "A" },
    });

    expect(textarea.value).toBe("A");

    // rerender WITHOUT changing show
    rerender(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    // must NOT reset
    expect(textarea.value).toBe("A");

    // close
    rerender(
      <ModerateReviewModal
        show={false}
        review={sampleReview}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    // reopen
    rerender(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    // now reset should happen
    expect(textarea.value).toBe("");
  });

  test("does not reset comments when show changes true -> true (no transition)", () => {
    const { rerender } = render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      "Optional moderation notes...",
    );

    fireEvent.change(textarea, {
      target: { value: "X" },
    });

    expect(textarea.value).toBe("X");

    // IMPORTANT: no state transition
    rerender(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    // hard invariant
    expect(textarea.value).toBe("X");
  });

  test("does not reset comments when unrelated props change but show stays true", () => {
    const { rerender } = render(
      <ModerateReviewModal
        show={true}
        review={{ ...sampleReview, id: 1 }}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      "Optional moderation notes...",
    );

    fireEvent.change(textarea, { target: { value: "keep" } });

    rerender(
      <ModerateReviewModal
        show={true}
        review={{ ...sampleReview, id: 2 }}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    expect(textarea.value).toBe("keep");
  });

  test("comments are cleared after modal opens", async () => {
    render(
      <ModerateReviewModal
        show={true}
        review={sampleReview}
        status="APPROVED"
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Optional moderation notes...").value,
      ).toBe("");
    });
  });
});
