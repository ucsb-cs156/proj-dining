import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import AliasTable from "main/components/Alias/AliasTable";
import usersFixtures from "fixtures/usersFixtures";

describe("AliasTable tests", () => {
  const mockOnApprove = jest.fn();
  const mockOnReject = jest.fn();
  const mockData = usersFixtures.threeUsers;

  const renderTable = () =>
    render(
      <AliasTable
        aliases={mockData}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test that the table renders with the provided aliases
  test("renders table with provided aliases", () => {
    renderTable();

    mockData.forEach((alias, idx) => {
      const row = screen.getByTestId(`AliasTable-row-${idx}`);
      const aliasText = alias.proposedAlias || "(No proposed alias)";
      expect(within(row).getByText(aliasText)).toBeInTheDocument();
    });
  });

  // Test that clicking the Approve button calls the onApprove callback
  test("calls onApprove when Approve button clicked", () => {
    renderTable();

    const approveCell = screen.getByTestId("AliasTable-cell-row-0-col-Approve");
    const approveButton = within(approveCell).getByRole("button", {
      name: "Approve",
    });

    fireEvent.click(approveButton);
    expect(mockOnApprove).toHaveBeenCalledWith(mockData[0]);
  });

  // Test that clicking the Reject button calls the onReject callback
  test("calls onReject when Reject button clicked", () => {
    renderTable();

    const rejectCell = screen.getByTestId("AliasTable-cell-row-0-col-Reject");
    const rejectButton = within(rejectCell).getByRole("button", {
      name: "Reject",
    });

    fireEvent.click(rejectButton);
    expect(mockOnReject).toHaveBeenCalledWith(mockData[0]);
  });

  // Test rendering an empty state when no aliases are provided
  test("renders empty state when no aliases provided", () => {
    render(
      <AliasTable
        aliases={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />,
    );
    expect(screen.getByTestId("AliasTable-empty")).toBeInTheDocument();
  });

  // Added test: check that the column header "Proposed Alias" is present
  test("renders column header 'Proposed Alias'", () => {
    renderTable();
    expect(screen.getByText("Proposed Alias")).toBeInTheDocument();
  });

  // Added test: check that the Approve button has the 'primary' class
  test("Approve button has primary class", () => {
    renderTable();
    const approveButton = screen.getByTestId(
      "AliasTable-cell-row-0-col-Approve-button",
    );
    expect(approveButton).toHaveClass("btn-primary");
  });

  // Added test: check that the Reject button has the 'danger' class
  test("Reject button has danger class", () => {
    renderTable();
    const rejectButton = screen.getByTestId(
      "AliasTable-cell-row-0-col-Reject-button",
    );
    expect(rejectButton).toHaveClass("btn-danger");
  });
});
