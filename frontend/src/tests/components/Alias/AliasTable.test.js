import { waitFor, render, screen, fireEvent } from "@testing-library/react";
import { aliasFixtures } from "fixtures/aliasFixtures";
import AliasTable from "main/components/Alias/AliasTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { within } from "@testing-library/react";
import { toast } from "react-toastify";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

jest.mock("react-toastify", () => ({
  toast: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("AliasTable tests", () => {
  const queryClient = new QueryClient();
  const fourAlias = aliasFixtures.fourAlias;
  const expectedHeaders = ["Proposed Alias", "Approve", "Reject"];
  const expectedFields = ["proposedAlias", "approve", "reject"];
  const testId = "AliasTable";

  test("approve, reject, alias show up as expected", async () => {
    // act - render the component

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.fourAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    await screen.findByTestId("AliasTable-cell-row-0-col-proposedAlias");
    expect(screen.getByText("Proposed Alias")).toBeInTheDocument();

    for (let i = 0; i < fourAlias.length; i++) {
      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-proposedAlias`),
      ).toBeInTheDocument();

      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-proposedAlias`),
      ).toHaveTextContent(fourAlias[i].proposedAlias);

      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-approve`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-approve`),
      ).toHaveTextContent("Approve");
      const approveCell = screen.getByTestId(
        `AliasTable-cell-row-${i}-col-approve`,
      );
      const approveButton = within(approveCell).getByRole("button");
      expect(approveButton).toHaveClass("btn", "btn-success");

      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-reject`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-reject`),
      ).toHaveTextContent("Reject");
      const rejectCell = screen.getByTestId(
        `AliasTable-cell-row-${i}-col-reject`,
      );
      const rejectButton = within(rejectCell).getByRole("button");
      expect(rejectButton).toHaveClass("btn", "btn-danger");
    }
  });

  test("one proposed alias", async () => {
    // act - render the component

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.onePropAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered

    await waitFor(() => {
      expect(
        screen.getByTestId("AliasTable-cell-row-0-col-proposedAlias"),
      ).toHaveTextContent(aliasFixtures.onePropAlias[0].proposedAlias);
    });
  });

  test("renders empty table correctly", () => {
    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={[]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(
        `${testId}-cell-row-0-col-${field}`,
      );
      expect(fieldElement).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {
    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.fourAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Proposed Alias")).toBeInTheDocument();

    for (let i = 0; i < fourAlias.length; i++) {
      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-proposedAlias`),
      ).toBeInTheDocument();

      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-proposedAlias`),
      ).toHaveTextContent(fourAlias[i].proposedAlias);

      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-approve`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-approve`),
      ).toHaveTextContent("Approve");
      const approveCell = screen.getByTestId(
        `AliasTable-cell-row-${i}-col-approve`,
      );
      const approveButton = within(approveCell).getByRole("button");
      expect(approveButton).toHaveClass("btn", "btn-success");

      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-reject`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`AliasTable-cell-row-${i}-col-reject`),
      ).toHaveTextContent("Reject");
      const rejectCell = screen.getByTestId(
        `AliasTable-cell-row-${i}-col-reject`,
      );
      const rejectButton = within(rejectCell).getByRole("button");
      expect(rejectButton).toHaveClass("btn", "btn-danger");
    }
  });

  //test the approve button approves the alias
  test("The approve button approves the alias (toast)", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, aliasFixtures.onePropAlias);
    axiosMock
      .onPut("/api/currentUser/updateAliasModeration")
      .reply(200, { id: aliasFixtures.onePropAlias[0].id, approved: true });

    // const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.onePropAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveCell = screen.getByTestId(`AliasTable-cell-row-0-col-approve`);
    const button = within(approveCell).getByRole("button");
    await fireEvent.click(button);

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        `Alias ${aliasFixtures.onePropAlias[0].proposedAlias} for id ${aliasFixtures.onePropAlias[0].id} approved!`,
      ),
    );
    expect(toast).toHaveBeenCalledTimes(1);
  });

  test("null proposed alias does nothing", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, aliasFixtures.nullPropAlias);
    axiosMock
      .onPut("/api/currentUser/updateAliasModeration")
      .reply(200, { id: aliasFixtures.onePropAlias[0].id, approved: true });

    // const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.onePropAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const approveCell = screen.getByTestId(`AliasTable-cell-row-0-col-approve`);
    const button = within(approveCell).getByRole("button");
    await fireEvent.click(button);
    expect(toast).toHaveBeenCalledTimes(0);
  });

  test("The reject button rejects the alias (toast)", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, aliasFixtures.onePropAlias);
    axiosMock
      .onPut("/api/currentUser/updateAliasModeration")
      .reply(200, { id: aliasFixtures.onePropAlias[0].id, approved: false });

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AliasTable alias={aliasFixtures.onePropAlias} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const rejCell = screen.getByTestId(`AliasTable-cell-row-0-col-reject`);
    const button = within(rejCell).getByRole("button");
    await fireEvent.click(button);

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        `Alias ${aliasFixtures.onePropAlias[0].proposedAlias} for id ${aliasFixtures.onePropAlias[0].id} rejected!`,
      ),
    );
    expect(toast).toHaveBeenCalledTimes(1);
  });
});
