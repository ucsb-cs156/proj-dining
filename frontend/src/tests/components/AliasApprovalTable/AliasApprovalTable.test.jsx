import { fireEvent, render, screen } from "@testing-library/react";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import usersFixtures from "fixtures/usersFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("AliasApprovalTable tests", () => {
  const queryClient = new QueryClient();

  test("renders empty table correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasApprovalTable
            aliases={[]}
            onApprove={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("AliasApprovalTable-empty")).toBeInTheDocument();
    expect(
      screen.getByText("No aliases awaiting approval"),
    ).toBeInTheDocument();
  });

  test("renders table with users correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasApprovalTable
            aliases={usersFixtures.threeUsers}
            onApprove={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = ["Proposed Alias"];
    const expectedFields = ["proposedAlias"];
    const testId = "AliasApprovalTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-proposedAlias`),
    ).toHaveTextContent("Ali1");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-proposedAlias`),
    ).toHaveTextContent("(No proposed alias)");

    const approveButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Approve-button`,
    );
    expect(approveButton).toBeInTheDocument();
    expect(approveButton).toHaveClass("btn-primary");

    const rejectButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Reject-button`,
    );
    expect(rejectButton).toBeInTheDocument();
    expect(rejectButton).toHaveClass("btn-danger");
  });

  test("Approve button calls onApprove callback", () => {
    const onApproveMock = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasApprovalTable
            aliases={usersFixtures.threeUsers}
            onApprove={onApproveMock}
            onReject={vi.fn()}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveButton = screen.getByTestId(
      "AliasApprovalTable-cell-row-0-col-Approve-button",
    );
    fireEvent.click(approveButton);

    expect(onApproveMock).toHaveBeenCalledWith(usersFixtures.threeUsers[0]);
  });

  test("Reject button calls onReject callback", () => {
    const onRejectMock = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasApprovalTable
            aliases={usersFixtures.threeUsers}
            onApprove={vi.fn()}
            onReject={onRejectMock}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const rejectButton = screen.getByTestId(
      "AliasApprovalTable-cell-row-0-col-Reject-button",
    );
    fireEvent.click(rejectButton);

    expect(onRejectMock).toHaveBeenCalledWith(usersFixtures.threeUsers[0]);
  });

  test("renders (No proposed alias) when proposedAlias is null", () => {
    const usersWithNullAlias = [
      {
        ...usersFixtures.threeUsers[0],
        proposedAlias: null,
      },
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasApprovalTable
            aliases={usersWithNullAlias}
            onApprove={vi.fn()}
            onReject={vi.fn()}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId("AliasApprovalTable-cell-row-0-col-proposedAlias"),
    ).toHaveTextContent("(No proposed alias)");
  });
});
