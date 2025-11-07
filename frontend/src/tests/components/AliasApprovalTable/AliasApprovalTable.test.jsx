import React from "react";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import { QueryClient, QueryClientProvider } from "react-query";
import usersFixtures from "fixtures/usersFixtures";

describe("AliasApprovalTable tests", () => {
  const queryClient = new QueryClient();

  it("renders the header even with no data", () => {
    render(<AliasApprovalTable aliases={[]} />);

    expect(screen.getByText("Proposed Alias")).toBeInTheDocument();

    expect(
      screen.getByTestId("Aliasapprovaltable-header-proposedAlias"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("Aliasapprovaltable-header-Approve"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("Aliasapprovaltable-header-Reject"),
    ).toBeInTheDocument();
  });

  it("renders a data row for each user", () => {
    render(<AliasApprovalTable aliases={usersFixtures.threeUsers} />);
    expect(screen.getByText("Ali1")).toBeInTheDocument();
    expect(
      screen.queryByTestId("Aliasapprovaltable-cell-row-1-col-proposedAlias"),
    ).not.toBeInTheDocument();
  });

  it("buttons appear and work properly", async () => {
    const approveCallback = jest.fn();
    const rejectCallback = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <AliasApprovalTable
          aliases={usersFixtures.threeUsers}
          approveCallback={approveCallback}
          rejectCallback={rejectCallback}
        />
        ,
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`Aliasapprovaltable-cell-row-0-col-proposedAlias`),
      ).toHaveTextContent("Ali1");
    });

    //approve button
    const approveButton = screen.getByTestId(
      `Aliasapprovaltable-cell-row-0-col-Approve-button`,
    );
    expect(approveButton).toBeInTheDocument();
    expect(approveButton).toHaveClass("btn-primary");

    fireEvent.click(approveButton);
    expect(approveCallback).toHaveBeenCalledTimes(1);

    //reject button
    const rejectButton = screen.getByTestId(
      `Aliasapprovaltable-cell-row-0-col-Reject-button`,
    );
    expect(rejectButton).toBeInTheDocument();
    expect(rejectButton).toHaveClass("btn-danger");

    fireEvent.click(rejectButton);
    expect(rejectCallback).toHaveBeenCalledTimes(1);
  });
});
