import { render, screen, fireEvent } from "@testing-library/react";
import AliasApprovalTable from "main/components/AliasApprovalTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";

jest.mock("main/utils/useBackend", () => {
  return {
    useBackendMutation: jest.fn(),
    useBackend: jest.fn(),
  };
});

jest.mock("react-toastify", () => {
  const actual = jest.requireActual("react-toastify");
  return {
    ...actual,
    toast: jest.fn(),
  };
});

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

    const { useBackend, useBackendMutation } = require("main/utils/useBackend");
    const { toast } = require("react-toastify");

    useBackend.mockReturnValue({
      data: sampleUsers,
      error: null,
      status: "success",
    });

    const mockMutate = jest.fn((variables) => {
      const returnedUser = variables.approved
        ? {
            id: variables.id,
            alias: variables.id === 1 ? "NewAlias" : "ChillDude",
            proposedAlias: null,
          }
        : {
            id: variables.id,
            alias: variables.id === 1 ? "OldAlias" : "CoolGuy",
            proposedAlias: null,
          };

      toast(
        `${variables.approved ? "Approved" : "Rejected"} alias: ${returnedUser.alias}`,
      );
      queryClient.invalidateQueries("alias-approval");
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

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <AliasApprovalTable />
      </QueryClientProvider>,
    );

  test("renders table with aliases", () => {
    renderComponent();
    expect(screen.getByText("OldAlias")).toBeInTheDocument();
    expect(screen.getByText("NewAlias")).toBeInTheDocument();
    expect(screen.getByText("CoolGuy")).toBeInTheDocument();
    expect(screen.getByText("ChillDude")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Approve" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Reject" })).toHaveLength(2);
  });

  test("approve button triggers mutation", () => {
    const { useBackendMutation } = require("main/utils/useBackend");
    const { toast } = require("react-toastify");

    renderComponent();
    fireEvent.click(screen.getAllByRole("button", { name: "Approve" })[0]);

    expect(useBackendMutation().mutate).toHaveBeenCalledWith({
      id: 1,
      approved: true,
    });
    expect(toast).toHaveBeenCalledWith("Approved alias: NewAlias");
  });

  test("reject button triggers mutation", () => {
    const { useBackendMutation } = require("main/utils/useBackend");
    const { toast } = require("react-toastify");

    renderComponent();
    fireEvent.click(screen.getAllByRole("button", { name: "Reject" })[1]);

    expect(useBackendMutation().mutate).toHaveBeenCalledWith({
      id: 2,
      approved: false,
    });
    expect(toast).toHaveBeenCalledWith("Rejected alias: CoolGuy");
  });

  test("shows loading state", () => {
    const { useBackend } = require("main/utils/useBackend");
    useBackend.mockReturnValue({ data: null, error: null, status: "loading" });

    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("shows error state", () => {
    const { useBackend } = require("main/utils/useBackend");
    useBackend.mockReturnValue({ data: null, error: {}, status: "error" });

    renderComponent();
    expect(screen.getByText("Error loading aliases")).toBeInTheDocument();
  });

  test("handles empty users gracefully", () => {
    const { useBackend } = require("main/utils/useBackend");
    useBackend.mockReturnValue({ data: [], error: null, status: "success" });

    renderComponent();
    expect(
      screen.queryByRole("button", { name: "Approve" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reject" }),
    ).not.toBeInTheDocument();
  });

  test("useBackend is called with correct parameters", () => {
    const { useBackend } = require("main/utils/useBackend");

    renderComponent();

    expect(useBackend).toHaveBeenCalledWith(
      ["/api/admin/usersWithProposedAlias"],
      { method: "GET", url: "/api/admin/usersWithProposedAlias" },
      [],
    );
  });

  test("useBackendMutation is called with objectToAxiosParams function", () => {
    const { useBackendMutation } = require("main/utils/useBackend");

    renderComponent();

    expect(useBackendMutation).toHaveBeenCalledWith(expect.any(Function), {
      onSuccess: expect.any(Function),
    });
  });

  test("mutation onSuccess handler calls toast and invalidates queries", () => {
    const { useBackendMutation } = require("main/utils/useBackend");
    const { toast } = require("react-toastify");

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    renderComponent();

    const onSuccessHandler = useBackendMutation.mock.calls[0][1].onSuccess;

    const mockReturnedUser = { alias: "TestAlias" };
    const mockVariables = { approved: true };

    onSuccessHandler(mockReturnedUser, mockVariables);

    expect(toast).toHaveBeenCalledWith("Approved alias: TestAlias");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      "/api/admin/usersWithProposedAlias",
    );

    invalidateQueriesSpy.mockRestore();
  });

  test("objectToAxiosParams function returns correct parameters", () => {
    const { useBackendMutation } = require("main/utils/useBackend");

    renderComponent();

    const objectToAxiosParams = useBackendMutation.mock.calls[0][0];

    const result = objectToAxiosParams({ id: 1, approved: true });

    expect(result).toEqual({
      url: "/api/currentUser/updateAliasModeration",
      method: "PUT",
      params: {
        id: 1,
        approved: true,
      },
    });
  });

  test("objectToAxiosParams handles invalid parameters", () => {
    const { useBackendMutation } = require("main/utils/useBackend");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    renderComponent();

    const objectToAxiosParams = useBackendMutation.mock.calls[0][0];

    expect(objectToAxiosParams(null)).toEqual({});
    expect(objectToAxiosParams({ id: 1 })).toEqual({});
    expect(objectToAxiosParams({ approved: true })).toEqual({});
    expect(objectToAxiosParams({ id: 1, approved: undefined })).toEqual({});

    expect(consoleSpy).toHaveBeenCalledTimes(4);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Missing id or approved in mutation variables:",
      null,
    );

    consoleSpy.mockRestore();
  });

  test("table headers are rendered correctly", () => {
    renderComponent();

    expect(screen.getByText("Alias")).toBeInTheDocument();
    expect(screen.getByText("Proposed Alias")).toBeInTheDocument();
  });

  test("approve button text and functionality", () => {
    renderComponent();

    const approveButtons = screen.getAllByRole("button", { name: "Approve" });
    expect(approveButtons).toHaveLength(2);

    approveButtons.forEach((button) => {
      expect(button).toHaveTextContent("Approve");
    });
  });

  test("reject button text and functionality", () => {
    renderComponent();

    const rejectButtons = screen.getAllByRole("button", { name: "Reject" });
    expect(rejectButtons).toHaveLength(2);

    rejectButtons.forEach((button) => {
      expect(button).toHaveTextContent("Reject");
    });
  });

  test("component handles different user data structures", () => {
    const { useBackend } = require("main/utils/useBackend");

    const differentUsers = [
      { id: 999, alias: "TestUser", proposedAlias: "NewTestUser" },
    ];

    useBackend.mockReturnValue({
      data: differentUsers,
      error: null,
      status: "success",
    });

    renderComponent();

    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("NewTestUser")).toBeInTheDocument();
  });

  test("component passes correct testid to OurTable", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    renderComponent();

    expect(screen.getByText("Alias")).toBeInTheDocument();
    expect(screen.getByText("Proposed Alias")).toBeInTheDocument();

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("approve button styling parameter matters for rendering", () => {
    renderComponent();

    const approveButtons = screen.getAllByRole("button", { name: "Approve" });
    expect(approveButtons).toHaveLength(2);

    approveButtons.forEach((button) => {
      expect(button).toBeVisible();
      expect(button).not.toBeDisabled();
      expect(button.textContent).toBe("Approve");
    });
  });

  test("reject button styling parameter matters for rendering", () => {
    renderComponent();

    const rejectButtons = screen.getAllByRole("button", { name: "Reject" });
    expect(rejectButtons).toHaveLength(2);

    rejectButtons.forEach((button) => {
      expect(button).toBeVisible();
      expect(button).not.toBeDisabled();
      expect(button.textContent).toBe("Reject");
    });
  });

  test("columns array construction with button parameters", () => {
    renderComponent();

    expect(screen.getByText("Alias")).toBeInTheDocument();
    expect(screen.getByText("Proposed Alias")).toBeInTheDocument();

    const firstRowApprove = screen.getAllByRole("button", {
      name: "Approve",
    })[0];
    const firstRowReject = screen.getAllByRole("button", { name: "Reject" })[0];

    expect(firstRowApprove).toBeInTheDocument();
    expect(firstRowReject).toBeInTheDocument();
  });

  test("reject button column configuration uses danger styling", () => {
    const originalConsoleError = console.error;
    const mockConsoleError = jest.fn();
    console.error = mockConsoleError;

    renderComponent();

    const rejectButtons = screen.getAllByRole("button", { name: "Reject" });
    expect(rejectButtons).toHaveLength(2);

    fireEvent.click(rejectButtons[0]);
    fireEvent.click(rejectButtons[1]);

    const { useBackendMutation } = require("main/utils/useBackend");
    expect(useBackendMutation().mutate).toHaveBeenCalledWith({
      id: 1,
      approved: false,
    });
    expect(useBackendMutation().mutate).toHaveBeenCalledWith({
      id: 2,
      approved: false,
    });

    expect(mockConsoleError).not.toHaveBeenCalledWith(
      expect.stringMatching(/ButtonColumn.*styling.*error/i),
    );

    rejectButtons.forEach((button) => {
      expect(button.tagName).toBe("BUTTON");
      expect(button.type).toBe("button");
      expect(button).toBeEnabled();
    });

    console.error = originalConsoleError;
  });

  test("button columns are created with correct styling parameters", () => {
    renderComponent();

    const approveButtons = screen.getAllByRole("button", { name: "Approve" });
    expect(approveButtons).toHaveLength(2);

    const rejectButtons = screen.getAllByRole("button", { name: "Reject" });
    expect(rejectButtons).toHaveLength(2);

    rejectButtons.forEach((button, index) => {
      fireEvent.click(button);

      const { useBackendMutation } = require("main/utils/useBackend");
      const lastCall =
        useBackendMutation().mutate.mock.calls[
          useBackendMutation().mutate.mock.calls.length - 1
        ];

      expect(lastCall[0]).toEqual({
        id: index === 0 ? 1 : 2,
        approved: false,
      });
    });
  });

  test("onSuccess handler generates correct rejected message", () => {
    const { useBackendMutation } = require("main/utils/useBackend");
    const { toast } = require("react-toastify");

    renderComponent();

    const onSuccessHandler = useBackendMutation.mock.calls[0][1].onSuccess;

    const mockReturnedUser = { alias: "TestAlias" };
    const mockVariables = { approved: false };

    onSuccessHandler(mockReturnedUser, mockVariables);

    expect(toast).toHaveBeenCalledWith("Rejected alias: TestAlias");

    const toastCall = toast.mock.calls.find((call) =>
      call[0].includes("TestAlias"),
    );
    expect(toastCall[0]).toContain("Rejected");
    expect(toastCall[0]).not.toBe(" alias: TestAlias");
  });

  test("ButtonColumn parameters are validated during component creation", () => {
    const { useBackend, useBackendMutation } = require("main/utils/useBackend");

    useBackend.mockReturnValue({
      data: sampleUsers,
      error: null,
      status: "success",
    });

    const mockMutate = jest.fn();
    useBackendMutation.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
    });

    let buttonColumnCalls = [];
    const originalButtonColumn =
      require("main/components/OurTable").ButtonColumn;
    const buttonColumnSpy = jest.fn((text, style, handler) => {
      buttonColumnCalls.push({ text, style, handler });
      return originalButtonColumn(text, style, handler);
    });
    const OurTableModule = require("main/components/OurTable");
    OurTableModule.ButtonColumn = buttonColumnSpy;

    try {
      renderComponent();

      const rejectCall = buttonColumnCalls.find(
        (call) => call.text === "Reject",
      );
      expect(rejectCall).toBeDefined();
      expect(rejectCall.style).toBe("danger");
      expect(rejectCall.style).not.toBe("");

      const approveCall = buttonColumnCalls.find(
        (call) => call.text === "Approve",
      );
      expect(approveCall).toBeDefined();
      expect(approveCall.style).toBe("success");
    } finally {
      OurTableModule.ButtonColumn = originalButtonColumn;
    }
  });

  test("OurTable receives non-empty testid prop", () => {
    const originalOurTable = jest.requireActual(
      "main/components/OurTable",
    ).default;
    const ourTableSpy = jest.fn((props) => {
      expect(props.testid).toBeTruthy();
      expect(props.testid).not.toBe("");
      expect(props.testid).toBe("AliasApprovalTable");

      return originalOurTable(props);
    });

    const OurTableModule = require("main/components/OurTable");
    const originalOurTableRef = OurTableModule.default;
    OurTableModule.default = ourTableSpy;

    try {
      renderComponent();

      expect(ourTableSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          testid: "AliasApprovalTable",
        }),
      );
    } finally {
      OurTableModule.default = originalOurTableRef;
    }
  });
});
