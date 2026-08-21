import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import RoleEmailAddModal from "main/components/Users/RoleEmailAddModal";

describe("RoleEmailAddModal tests", () => {
  test("renders title and button label", () => {
    render(
      <RoleEmailAddModal
        show={true}
        onHide={vi.fn()}
        onSubmitEmail={vi.fn()}
        title="Add Admin"
        buttonLabel="Add"
      />,
    );

    expect(screen.getByText("Add Admin")).toBeInTheDocument();
    expect(screen.getByTestId("RoleEmailAddModal-submit")).toHaveTextContent(
      "Add",
    );
  });

  test("uses default title and button label when not provided", () => {
    render(
      <RoleEmailAddModal
        show={true}
        onHide={vi.fn()}
        onSubmitEmail={vi.fn()}
      />,
    );

    expect(screen.getByText("Add Email")).toBeInTheDocument();
    expect(screen.getByTestId("RoleEmailAddModal-submit")).toHaveTextContent(
      "Add",
    );
  });

  test("clicking cancel calls onHide", () => {
    const onHide = vi.fn();
    render(
      <RoleEmailAddModal show={true} onHide={onHide} onSubmitEmail={vi.fn()} />,
    );

    fireEvent.click(screen.getByTestId("RoleEmailAddModal-cancel"));
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  test("submitting a blank email shows a required error and does not call onSubmitEmail", async () => {
    const onSubmitEmail = vi.fn();
    render(
      <RoleEmailAddModal
        show={true}
        onHide={vi.fn()}
        onSubmitEmail={onSubmitEmail}
      />,
    );

    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    expect(
      await screen.findByText("A valid email is required."),
    ).toBeInTheDocument();
    expect(onSubmitEmail).not.toHaveBeenCalled();
    expect(screen.getByTestId("RoleEmailAddModal-email")).toHaveClass(
      "is-invalid",
    );
  });

  test("submitting a badly formatted email shows an error and does not call onSubmitEmail", async () => {
    const onSubmitEmail = vi.fn();
    render(
      <RoleEmailAddModal
        show={true}
        onHide={vi.fn()}
        onSubmitEmail={onSubmitEmail}
      />,
    );

    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    expect(
      await screen.findByText("A valid email is required."),
    ).toBeInTheDocument();
    expect(onSubmitEmail).not.toHaveBeenCalled();
  });

  test("submitting a valid email calls onSubmitEmail with that email", async () => {
    const onSubmitEmail = vi.fn();
    render(
      <RoleEmailAddModal
        show={true}
        onHide={vi.fn()}
        onSubmitEmail={onSubmitEmail}
      />,
    );

    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "newadmin@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId("RoleEmailAddModal-submit"));

    await screen.findByTestId("RoleEmailAddModal-email");
    expect(onSubmitEmail).toHaveBeenCalledWith("newadmin@ucsb.edu");
  });

  test("renders serverError text when provided", () => {
    render(
      <RoleEmailAddModal
        show={true}
        onHide={vi.fn()}
        onSubmitEmail={vi.fn()}
        serverError="admin@ucsb.edu is already an admin"
      />,
    );

    expect(screen.getByTestId("RoleEmailAddModal-error")).toHaveTextContent(
      "admin@ucsb.edu is already an admin",
    );
  });

  test("does not render serverError div when not provided", () => {
    render(
      <RoleEmailAddModal
        show={true}
        onHide={vi.fn()}
        onSubmitEmail={vi.fn()}
      />,
    );

    expect(
      screen.queryByTestId("RoleEmailAddModal-error"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("RoleEmailAddModal-email")).not.toHaveClass(
      "is-invalid",
    );
  });

  test("a serverError alone (no validation error) marks the input invalid", () => {
    render(
      <RoleEmailAddModal
        show={true}
        onHide={vi.fn()}
        onSubmitEmail={vi.fn()}
        serverError="admin@ucsb.edu is already an admin"
      />,
    );

    expect(screen.getByTestId("RoleEmailAddModal-email")).toHaveClass(
      "is-invalid",
    );
  });

  test("resets the form when the modal is reopened", () => {
    const { rerender } = render(
      <RoleEmailAddModal
        show={true}
        onHide={vi.fn()}
        onSubmitEmail={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId("RoleEmailAddModal-email"), {
      target: { value: "someone@ucsb.edu" },
    });
    expect(screen.getByTestId("RoleEmailAddModal-email")).toHaveValue(
      "someone@ucsb.edu",
    );

    rerender(
      <RoleEmailAddModal
        show={false}
        onHide={vi.fn()}
        onSubmitEmail={vi.fn()}
      />,
    );
    rerender(
      <RoleEmailAddModal
        show={true}
        onHide={vi.fn()}
        onSubmitEmail={vi.fn()}
      />,
    );

    expect(screen.getByTestId("RoleEmailAddModal-email")).toHaveValue("");
  });
});
