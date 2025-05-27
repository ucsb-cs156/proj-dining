import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AliasApprovalTable from "main/components/AliasApprovalTable/AliasApprovalTable";
import { useBackend, useBackendMutation } from "main/utils/useBackend";

// mock our hooks
jest.mock("main/utils/useBackend", () => ({
  useBackend: jest.fn(),
  useBackendMutation: jest.fn(),
}));

describe("AliasApprovalTable", () => {
  const dummyRefetch = jest.fn();
  const dummyMutate = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    // default: one pending user, not loading
    useBackend.mockReturnValue({
      data: [{ id: 123, proposedAlias: "CleverCat" }],
      isLoading: false,
      refetch: dummyRefetch,
    });

    // default mutation hook
    useBackendMutation.mockReturnValue({ mutate: dummyMutate });
  });

  it("renders just the header row when loading", () => {
    // simulate loading
    useBackend.mockReturnValueOnce({
      data: [],
      isLoading: true,
      refetch: dummyRefetch,
    });

    render(<AliasApprovalTable />);

    // only the header row exists
    expect(screen.getAllByRole("row")).toHaveLength(1);
  });

  it("renders the correct data-testid attributes for each header", () => {
    render(<AliasApprovalTable />);
    expect(
      screen.getByTestId("AliasApprovalTable-header-proposedAlias"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("AliasApprovalTable-header-approve"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("AliasApprovalTable-header-reject"),
    ).toBeInTheDocument();
  });

  it("wires up useBackend with the correct key, params & initialData", () => {
    render(<AliasApprovalTable />);
    expect(useBackend).toHaveBeenCalledWith(
      ["/api/admin/usersWithProposedAlias"],
      { method: "GET", url: "/api/admin/usersWithProposedAlias" },
      [],
    );
  });

  it("wires up useBackendMutation with the correct transform & invalidation key", () => {
    render(<AliasApprovalTable />);
    const [fn, opts, invalidateKeys] = useBackendMutation.mock.calls[0];
    expect(typeof fn).toBe("function");
    expect(opts).toEqual({ onSuccess: expect.any(Function) });
    expect(invalidateKeys).toEqual(["/api/admin/usersWithProposedAlias"]);
  });

  it("renders a data row for each user", () => {
    render(<AliasApprovalTable />);
    expect(screen.getByText("CleverCat")).toBeInTheDocument();
  });

  it("calls mutate with approved=true when Approve is clicked", () => {
    render(<AliasApprovalTable />);
    fireEvent.click(screen.getByRole("button", { name: /Approve/i }));
    expect(dummyMutate).toHaveBeenCalledWith({
      id: 123,
      proposedAlias: "CleverCat",
      approved: true,
    });
  });

  it("calls mutate with approved=false when Reject is clicked", () => {
    render(<AliasApprovalTable />);
    fireEvent.click(screen.getByRole("button", { name: /Reject/i }));
    expect(dummyMutate).toHaveBeenCalledWith({
      id: 123,
      proposedAlias: "CleverCat",
      approved: false,
    });
  });

  it("refetches after a successful mutation", () => {
    render(<AliasApprovalTable />);
    const onSuccess = useBackendMutation.mock.calls[0][1].onSuccess;
    onSuccess();
    expect(dummyRefetch).toHaveBeenCalled();
  });

  it("transforms a row into the correct axios parameters", () => {
    render(<AliasApprovalTable />);
    const transform = useBackendMutation.mock.calls[0][0];
    const row = { id: 999, proposedAlias: "Foxtrot", approved: false };
    expect(transform(row)).toEqual({
      method: "PUT",
      url: "/api/currentUser/updateAliasModeration",
      params: { id: 999, approved: false },
    });
  });

  it("defaults to an empty list when useBackend returns no data", () => {
    useBackend.mockReturnValueOnce({
      isLoading: false,
      refetch: dummyRefetch,
    });
    render(<AliasApprovalTable />);
    // still only the header row
    expect(screen.getAllByRole("row")).toHaveLength(1);
  });
});
