import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import usersFixtures from "fixtures/usersFixtures";
import AliasTable from "main/components/Alias/AliasTable";
import * as backendModule from "main/utils/useBackend";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("AliasTable tests", () => {
  const queryClient = new QueryClient();
  const renderWithQueryClient = (ui) =>
    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();

    jest
      .spyOn(backendModule, "useBackendMutation")
      .mockImplementation((_, { onSuccess, onError }) => ({
        mutate: (_, __) =>
          onError(new Error("Request failed with status code 500")),
      }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders table with correct headers and aliases", () => {
    renderWithQueryClient(<AliasTable alias={usersFixtures.threeUsers} />);
    expect(
      screen.getByRole("columnheader", { name: /Proposed Alias/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Approve/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Reject/i }),
    ).toBeInTheDocument();

    const rows = screen.getAllByTestId(/AliasTable-row-/);
    usersFixtures.threeUsers.forEach((user, idx) => {
      const aliasText = user.proposedAlias || "(No proposed alias)";
      expect(within(rows[idx]).getByText(aliasText)).toBeInTheDocument();
    });
  });

  test("calls approve mutation when Approve button clicked", () => {
    const mockMutate = jest.fn();
    jest
      .spyOn(backendModule, "useBackendMutation")
      .mockReturnValue({ mutate: mockMutate });

    renderWithQueryClient(<AliasTable alias={usersFixtures.threeUsers} />);
    const approveButtons = screen.getAllByRole("button", { name: /approve/i });
    fireEvent.click(approveButtons[0]);
    expect(mockMutate).toHaveBeenCalledWith(usersFixtures.threeUsers[0]);
  });

  test("calls reject mutation when Reject button clicked", () => {
    const mockMutate = jest.fn();
    jest
      .spyOn(backendModule, "useBackendMutation")
      .mockReturnValue({ mutate: mockMutate });

    renderWithQueryClient(<AliasTable alias={usersFixtures.threeUsers} />);
    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    fireEvent.click(rejectButtons[1]);
    expect(mockMutate).toHaveBeenCalledWith(usersFixtures.threeUsers[1]);
  });

  test("renders empty state when no aliases", () => {
    renderWithQueryClient(<AliasTable alias={[]} />);
    expect(screen.getByTestId("AliasTable-empty")).toHaveTextContent(
      /no aliases awaiting approval/i,
    );
  });
});
