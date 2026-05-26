import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ModeratorCommentsModal from "main/components/Reviews/ModeratorCommentsModal";

describe("ModeratorCommentsModal", () => {
  test("comments textarea is empty when the dialog first opens", () => {
    render(
      <ModeratorCommentsModal
        show={true}
        onHide={vi.fn()}
        status="APPROVED"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByTestId("ModeratorCommentsModal-comments")).toHaveValue(
      "",
    );
  });

  test("shows approve heading and primary action when status is APPROVED", () => {
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

  test("shows reject heading and danger action when status is REJECTED", () => {
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

  test("moderator comments field updates as the user types", () => {
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
    fireEvent.change(textarea, { target: { value: "Solid write-up" } });
    expect(textarea).toHaveValue("Solid write-up");
  });

  test("submit without typing sends an empty comments string", () => {
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

    expect(screen.getByTestId("ModeratorCommentsModal-comments")).toHaveValue(
      "",
    );

    fireEvent.click(screen.getByTestId("ModeratorCommentsModal-submit"));

    expect(onSubmit).toHaveBeenCalledWith("");
    expect(onHide).toHaveBeenCalled();
  });

  test("confirming submit forwards comments and closes via onHide", () => {
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
    fireEvent.change(textarea, { target: { value: "Meets guidelines" } });

    fireEvent.click(screen.getByTestId("ModeratorCommentsModal-submit"));

    expect(onSubmit).toHaveBeenCalledWith("Meets guidelines");
    expect(onHide).toHaveBeenCalled();
  });

  test("cancel dismisses without submitting and clears the textarea", () => {
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
    fireEvent.change(textarea, { target: { value: "Draft note" } });
    expect(textarea).toHaveValue("Draft note");

    fireEvent.click(screen.getByTestId("ModeratorCommentsModal-cancel"));

    expect(onHide).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("");
  });

  test("comments field is cleared after a successful submit", () => {
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
    fireEvent.change(textarea, { target: { value: "Ready to publish" } });
    expect(textarea).toHaveValue("Ready to publish");

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

  test("nothing from the dialog is shown when show is false", () => {
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
