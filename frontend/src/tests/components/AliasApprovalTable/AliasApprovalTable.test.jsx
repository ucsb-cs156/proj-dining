import React from "react";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";
import { AliasFixtures } from "fixtures/aliasFixtures";

describe("AliasApprovalTable tests", () => {
  const queryClient = new QueryClient();

  it("renders the header even with no data", () => {
    render(<AliasApprovalTable aliases={[]} moderatorOptions={true} />);

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

  it("only renders users with AWAITING_REVIEW status", () => {
    const fakeAliases = [
      ...AliasFixtures.threeAliases,
      { id: 8, proposedAlias: "test2", status: "APPROVED" },
    ];

    render(
      <AliasApprovalTable aliases={fakeAliases} moderatorOptions={true} />,
    );

    expect(screen.getByText("vnarasiman")).toBeInTheDocument();
    expect(screen.getByText("alias 4")).toBeInTheDocument();
    expect(screen.queryByText("test")).not.toBeInTheDocument();
    expect(screen.queryByText("test2")).not.toBeInTheDocument();
  });

  it("buttons appear and work properly", async () => {
    const approveCallback = vi.fn();
    const rejectCallback = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <AliasApprovalTable
          aliases={AliasFixtures.threeAliases}
          approveCallback={approveCallback}
          rejectCallback={rejectCallback}
          moderatorOptions={true}
        />
        ,
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`Aliasapprovaltable-cell-row-0-col-proposedAlias`),
      ).toHaveTextContent("vnarasiman");
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

  it("does not render approve/reject buttons when moderatorOptions is false", () => {
    render(
      <AliasApprovalTable
        aliases={AliasFixtures.threeAliases}
        moderatorOptions={false}
      />,
    );

    expect(screen.getByText("Proposed Alias")).toBeInTheDocument();
    expect(
      screen.queryByTestId("Aliasapprovaltable-header-Approve"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("Aliasapprovaltable-header-Reject"),
    ).not.toBeInTheDocument();
  });
});
