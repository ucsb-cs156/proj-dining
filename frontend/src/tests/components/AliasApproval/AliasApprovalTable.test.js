import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import aliasFixtures from "fixtures/aliasFixtures";

describe("AliasApprovalTable", () => {
  const { oneAlias: mockOne, threeAlias } = aliasFixtures;
  const [ , mockApproved, mockRejected ] = threeAlias;
  
  it("renders empty state when commons is empty", () => {
    render(
      <AliasApprovalTable
        commons={[]}
        onApprove={jest.fn()}
        onReject={jest.fn()}
      />,
    );

    expect(screen.queryByText(mockOne.proposedAlias)).not.toBeInTheDocument();

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders a row for each alias with correct columns", () => {
    render(
      <AliasApprovalTable
        commons={[mockOne, mockApproved, mockRejected]}
        onApprove={jest.fn()}
        onReject={jest.fn()}
      />,
    );

    expect(screen.getByText(mockOne.proposedAlias)).toBeInTheDocument();
    expect(screen.getByText(mockApproved.proposedAlias)).toBeInTheDocument();
    expect(screen.getByText(mockRejected.proposedAlias)).toBeInTheDocument();

    expect(screen.getByText(mockOne.alias)).toBeInTheDocument();
    expect(screen.getByText(mockApproved.alias)).toBeInTheDocument();
    expect(screen.getByText(mockRejected.alias)).toBeInTheDocument();

    expect(screen.getByText(mockOne.status)).toBeInTheDocument();
    expect(screen.getByText(mockApproved.status)).toBeInTheDocument();
    expect(screen.getByText(mockRejected.status)).toBeInTheDocument();
  });

  it("invokes callbacks with correct argument when buttons are clicked", () => {
    const onApprove = jest.fn();
    const onReject = jest.fn();

    render(
      <AliasApprovalTable
        commons={[mockOne]}
        onApprove={onApprove}
        onReject={onReject}
      />,
    );

    const approveButton = screen.getByTestId(`approve-button-${mockOne.id}`);
    const rejectButton = screen.getByTestId(`reject-button-${mockOne.id}`);

    fireEvent.click(approveButton);
    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onApprove).toHaveBeenCalledWith(mockOne);

    fireEvent.click(rejectButton);
    expect(onReject).toHaveBeenCalledTimes(1);
    expect(onReject).toHaveBeenCalledWith(mockOne);
  });

  it("disables Approve/Reject when status is not AWAITING_REVIEW", () => {
    render(
      <AliasApprovalTable
        commons={[mockApproved, mockRejected]}
        onApprove={jest.fn()}
        onReject={jest.fn()}
      />,
    );

    const approveBtnApproved = screen.getByTestId(
      `approve-button-${mockApproved.id}`,
    );
    const rejectBtnRejected = screen.getByTestId(
      `reject-button-${mockRejected.id}`,
    );

    expect(approveBtnApproved).toBeDisabled();
    expect(rejectBtnRejected).toBeDisabled();
  });
});
