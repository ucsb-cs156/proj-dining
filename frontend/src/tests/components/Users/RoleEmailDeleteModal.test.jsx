import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import RoleEmailDeleteModal from "main/components/Users/RoleEmailDeleteModal";

describe("RoleEmailDeleteModal tests", () => {
  test("does not render modal content when show is false", () => {
    render(
      <RoleEmailDeleteModal
        show={false}
        onHide={vi.fn()}
        email="admin@ucsb.edu"
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByText("Confirm Delete")).not.toBeInTheDocument();
  });

  test("renders the email and both buttons when show is true", () => {
    render(
      <RoleEmailDeleteModal
        show={true}
        onHide={vi.fn()}
        email="admin@ucsb.edu"
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByTestId("RoleEmailDeleteModal")).toBeInTheDocument();
    expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
    expect(screen.getByText("admin@ucsb.edu")).toBeInTheDocument();
    expect(
      screen.getByTestId("RoleEmailDeleteModal-cancel"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RoleEmailDeleteModal-confirm"),
    ).toBeInTheDocument();
  });

  test("clicking cancel calls onHide", () => {
    const onHide = vi.fn();
    render(
      <RoleEmailDeleteModal
        show={true}
        onHide={onHide}
        email="admin@ucsb.edu"
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId("RoleEmailDeleteModal-cancel"));
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  test("clicking confirm calls onConfirm", () => {
    const onConfirm = vi.fn();
    render(
      <RoleEmailDeleteModal
        show={true}
        onHide={vi.fn()}
        email="admin@ucsb.edu"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByTestId("RoleEmailDeleteModal-confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
