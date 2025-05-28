import { render, screen, fireEvent } from "@testing-library/react";
import AliasApprovalTable from "main/components/AliasApprovalTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";

jest.mock("main/utils/useBackend");
jest.mock("react-toastify");

describe("AliasApprovalTable tests", () => {
  let queryClient;

  const sampleUsers = [
    { id: 1, alias: "OldAlias", proposedAlias: "NewAlias" },
    { id: 2, alias: "CoolGuy", proposedAlias: "ChillDude" },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.invalidateQueries = jest.fn();

    const { useBackendMutation } = require("main/utils/useBackend");
    const { toast } = require("react-toastify");

    const mockMutate = jest.fn();
    mockMutate.mockImplementation((variables) => {
      let returnedUser;
      if (variables.id === 1 && variables.approved) {
        returnedUser = { id: 1, alias: "NewAlias", proposedAlias: null };
      } else if (variables.id === 1 && !variables.approved) {
        returnedUser = { id: 1, alias: "OldAlias", proposedAlias: null };
      } else if (variables.id === 2 && variables.approved) {
        returnedUser = { id: 2, alias: "ChillDude", proposedAlias: null };
      } else if (variables.id === 2 && !variables.approved) {
        returnedUser = { id: 2, alias: "CoolGuy", proposedAlias: null };
      }

      if (returnedUser) {
        toast(
          `${variables.approved ? "Approved" : "Rejected"} alias: ${returnedUser.alias}`,
        );
        queryClient.invalidateQueries("alias-approval");
      }
    });

    useBackendMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderComponent() {
    return render(
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <AliasApprovalTable users={sampleUsers} />
      </QueryClientProvider>,
    );
  }

  test("renders table with aliases", () => {
    renderComponent();

    expect(screen.getByText("OldAlias")).toBeInTheDocument();
    expect(screen.getByText("NewAlias")).toBeInTheDocument();
    expect(screen.getByText("CoolGuy")).toBeInTheDocument();
    expect(screen.getByText("ChillDude")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Approve" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Reject" })).toHaveLength(2);

    expect(
      screen.getByTestId("AliasApprovalTable-header-group-0"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("AliasApprovalTable-header-alias"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("AliasApprovalTable-row-0")).toBeInTheDocument();
  });

  test("approve button triggers mutation for first user", () => {
    const { toast } = require("react-toastify");
    const { useBackendMutation } = require("main/utils/useBackend");

    renderComponent();

    const approveButtons = screen.getAllByRole("button", { name: "Approve" });
    fireEvent.click(approveButtons[0]);

    const mockMutate = useBackendMutation().mutate;
    expect(mockMutate).toHaveBeenCalledWith({ id: 1, approved: true });
    expect(toast).toHaveBeenCalledWith("Approved alias: NewAlias");
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      "alias-approval",
    );
  });

  test("reject button triggers mutation for first user", () => {
    const { toast } = require("react-toastify");
    const { useBackendMutation } = require("main/utils/useBackend");

    renderComponent();

    const rejectButtons = screen.getAllByRole("button", { name: "Reject" });
    fireEvent.click(rejectButtons[0]);

    const mockMutate = useBackendMutation().mutate;
    expect(mockMutate).toHaveBeenCalledWith({ id: 1, approved: false });
    expect(toast).toHaveBeenCalledWith("Rejected alias: OldAlias");
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      "alias-approval",
    );
  });

  test("approve button triggers mutation for second user", () => {
    const { toast } = require("react-toastify");
    const { useBackendMutation } = require("main/utils/useBackend");

    renderComponent();

    const approveButtons = screen.getAllByRole("button", { name: "Approve" });
    fireEvent.click(approveButtons[1]);

    const mockMutate = useBackendMutation().mutate;
    expect(mockMutate).toHaveBeenCalledWith({ id: 2, approved: true });
    expect(toast).toHaveBeenCalledWith("Approved alias: ChillDude");
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      "alias-approval",
    );
  });

  test("reject button triggers mutation for second user", () => {
    const { toast } = require("react-toastify");
    const { useBackendMutation } = require("main/utils/useBackend");

    renderComponent();

    const rejectButtons = screen.getAllByRole("button", { name: "Reject" });
    fireEvent.click(rejectButtons[1]);

    const mockMutate = useBackendMutation().mutate;
    expect(mockMutate).toHaveBeenCalledWith({ id: 2, approved: false });
    expect(toast).toHaveBeenCalledWith("Rejected alias: CoolGuy");
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      "alias-approval",
    );
  });

  test("handles missing variables in objectToAxiosParams", () => {
    const { useBackendMutation } = require("main/utils/useBackend");
    renderComponent();

    const objectToAxiosParams = useBackendMutation.mock.calls[0][0];

    const result1 = objectToAxiosParams();
    expect(result1).toEqual({});

    const result2 = objectToAxiosParams({ approved: true });
    expect(result2).toEqual({});

    const result3 = objectToAxiosParams({ id: 1 });
    expect(result3).toEqual({});
  });

  test("renders with empty users array", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <AliasApprovalTable users={[]} />
      </QueryClientProvider>,
    );

    expect(screen.queryAllByRole("button", { name: "Approve" })).toHaveLength(
      0,
    );
    expect(screen.queryAllByRole("button", { name: "Reject" })).toHaveLength(0);
  });

  test("objectToAxiosParams returns correct object structure", () => {
    const { useBackendMutation } = require("main/utils/useBackend");
    renderComponent();

    const objectToAxiosParams = useBackendMutation.mock.calls[0][0];
    const result = objectToAxiosParams({ id: 1, approved: true });

    expect(result.url).toBe("/api/currentUser/updateAliasModeration");
    expect(result.method).toBe("PUT");
    expect(result.params.id).toBe(1);
    expect(result.params.approved).toBe(true);
  });

  test("onSuccess callback handles both approved and rejected cases", () => {
    const { toast } = require("react-toastify");
    const { useBackendMutation } = require("main/utils/useBackend");
    renderComponent();

    const onSuccess = useBackendMutation.mock.calls[0][1].onSuccess;

    onSuccess({ alias: "TestApproved" }, { approved: true });
    expect(toast).toHaveBeenCalledWith("Approved alias: TestApproved");

    onSuccess({ alias: "TestRejected" }, { approved: false });
    expect(toast).toHaveBeenCalledWith("Rejected alias: TestRejected");
  });

  test("table headers are rendered correctly", () => {
    renderComponent();

    expect(
      screen.getByRole("columnheader", { name: "Alias" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Proposed Alias" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Approve" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Reject" }),
    ).toBeInTheDocument();
  });

  test("component renders table correctly", () => {
    renderComponent();
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
  });

  test("useBackendMutation dependency array is correct", () => {
    const { useBackendMutation } = require("main/utils/useBackend");
    renderComponent();

    const deps = useBackendMutation.mock.calls[0][2];
    expect(deps).toEqual(["alias-approval"]);
  });

  test("invalidateQueries is called with correct key", () => {
    renderComponent();

    const approveButtons = screen.getAllByRole("button", { name: "Approve" });
    fireEvent.click(approveButtons[0]);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      "alias-approval",
    );
  });

  test("console.error is called with correct message for missing variables", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { useBackendMutation } = require("main/utils/useBackend");
    renderComponent();

    const objectToAxiosParams = useBackendMutation.mock.calls[0][0];
    objectToAxiosParams();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Missing id or approved in mutation variables:",
      undefined,
    );
    consoleSpy.mockRestore();
  });

  test("component uses correct testid", () => {
    const { useBackendMutation } = require("main/utils/useBackend");

    renderComponent();

    expect(useBackendMutation).toHaveBeenCalled();

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
  });

  test("queryClient invalidateQueries uses correct cache key", () => {
    const { useBackendMutation } = require("main/utils/useBackend");
    renderComponent();

    const onSuccess = useBackendMutation.mock.calls[0][1].onSuccess;

    onSuccess({ alias: "TestAlias" }, { approved: true });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      "alias-approval",
    );
    expect(queryClient.invalidateQueries).not.toHaveBeenCalledWith("");
  });

  test("button columns have correct styling classes", () => {
    renderComponent();
    const approveButtons = screen.getAllByRole("button", { name: "Approve" });
    const rejectButtons = screen.getAllByRole("button", { name: "Reject" });

    expect(approveButtons[0]).toHaveClass("btn-success");
    expect(rejectButtons[0]).toHaveClass("btn-danger");
  });
});
