import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import AliasTable from "main/components/Alias/AliasTable";
import usersFixtures from "fixtures/usersFixtures";

describe("AliasTable tests", () => {
  const mockOnApprove = jest.fn();
  const mockOnReject = jest.fn();

  const aliases = usersFixtures.threeUsers;

  const renderTable = () =>
    render(
      <AliasTable
        aliases={aliases}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders table with provided aliases", () => {
    renderTable();

    aliases.forEach((alias, idx) => {
      const row = screen.getByTestId(`AliasTable-row-${idx}`);
      const aliasText = alias.proposedAlias || "(No proposed alias)";
      expect(within(row).getByText(aliasText)).toBeInTheDocument();
    });
  });

  test("calls onApprove when Approve button clicked", () => {
    renderTable();

    const approveCell = screen.getByTestId("AliasTable-cell-row-0-col-Approve");
    const approveButton = within(approveCell).getByRole("button", {
      name: "Approve",
    });

    fireEvent.click(approveButton);
    expect(mockOnApprove).toHaveBeenCalledWith(aliases[0]);
  });

  test("calls onReject when Reject button clicked", () => {
    renderTable();

    const rejectCell = screen.getByTestId("AliasTable-cell-row-0-col-Reject");
    const rejectButton = within(rejectCell).getByRole("button", {
      name: "Reject",
    });

    fireEvent.click(rejectButton);
    expect(mockOnReject).toHaveBeenCalledWith(aliases[0]);
  });

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
});
