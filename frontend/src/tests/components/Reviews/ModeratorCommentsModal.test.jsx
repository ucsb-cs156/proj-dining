import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ModeratorCommentsModal from "main/components/Reviews/ModeratorCommentsModal";

describe("ModeratorCommentsModal tests", () => {
  test("renders Approve title when status is APPROVED", () => {
    const onHide = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ModeratorCommentsModal
        show={true}
        onHide={onHide}
        status="APPROVED"
        onSubmit={onSubmit}
      />,
    );

    expect(
      screen.getByTestId("ModeratorCommentsModal-title"),
    ).toHaveTextContent("Approve Review");
    expect(
      screen.getByTestId("ModeratorCommentsModal-submit"),
    ).toHaveTextContent("Approve");
    expect(screen.getByTestId("ModeratorCommentsModal-submit")).toHaveClass(
      "btn-primary",
    );
  });

  test("renders Reject title when status is REJECTED", () => {
    const onHide = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ModeratorCommentsModal
        show={true}
        onHide={onHide}
        status="REJECTED"
        onSubmit={onSubmit}
      />,
    );

    expect(
      screen.getByTestId("ModeratorCommentsModal-title"),
    ).toHaveTextContent("Reject Review");
    expect(
      screen.getByTestId("ModeratorCommentsModal-submit"),
    ).toHaveTextContent("Reject");
    expect(screen.getByTestId("ModeratorCommentsModal-submit")).toHaveClass(
      "btn-danger",
    );
  });

  test("textarea accepts input", () => {
    const onHide = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ModeratorCommentsModal
        show={true}
        onHide={onHide}
        status="APPROVED"
        onSubmit={onSubmit}
      />,
    );

    const textarea = screen.getByTestId("ModeratorCommentsModal-comments");
    fireEvent.change(textarea, { target: { value: "Looks good!" } });
    expect(textarea).toHaveValue("Looks good!");
  });

  test("Submit calls onSubmit with comments and onHide", () => {
    const onHide = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ModeratorCommentsModal
        show={true}
        onHide={onHide}
        status="APPROVED"
        onSubmit={onSubmit}
      />,
    );

    const textarea = screen.getByTestId("ModeratorCommentsModal-comments");
    fireEvent.change(textarea, { target: { value: "Great content" } });

    fireEvent.click(screen.getByTestId("ModeratorCommentsModal-submit"));

    expect(onSubmit).toHaveBeenCalledWith("Great content");
    expect(onHide).toHaveBeenCalled();
  });

  test("Cancel button clears textarea and calls onHide", () => {
    const onHide = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ModeratorCommentsModal
        show={true}
        onHide={onHide}
        status="REJECTED"
        onSubmit={onSubmit}
      />,
    );

    const textarea = screen.getByTestId("ModeratorCommentsModal-comments");
    fireEvent.change(textarea, { target: { value: "Some text" } });
    expect(textarea).toHaveValue("Some text");

    fireEvent.click(screen.getByTestId("ModeratorCommentsModal-cancel"));

    expect(onHide).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("");
  });

  test("textarea resets to empty after submit", () => {
    const onHide = vi.fn();
    const onSubmit = vi.fn();

    const { rerender } = render(
      <ModeratorCommentsModal
        show={true}
        onHide={onHide}
        status="APPROVED"
        onSubmit={onSubmit}
      />,
    );

    const textarea = screen.getByTestId("ModeratorCommentsModal-comments");
    fireEvent.change(textarea, { target: { value: "Some comment" } });
    expect(textarea).toHaveValue("Some comment");

    fireEvent.click(screen.getByTestId("ModeratorCommentsModal-submit"));

    rerender(
      <ModeratorCommentsModal
        show={true}
        onHide={onHide}
        status="APPROVED"
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByTestId("ModeratorCommentsModal-comments")).toHaveValue(
      "",
    );
  });

  test("does not render modal content when show is false", () => {
    const onHide = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ModeratorCommentsModal
        show={false}
        onHide={onHide}
        status="APPROVED"
        onSubmit={onSubmit}
      />,
    );

    expect(
      screen.queryByTestId("ModeratorCommentsModal-title"),
    ).not.toBeInTheDocument();
  });
});
