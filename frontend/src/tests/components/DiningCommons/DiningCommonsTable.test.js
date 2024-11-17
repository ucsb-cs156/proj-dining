import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UserTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable
            diningCommonsData={diningCommonsFixtures.threeDiningCommons}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = ["Code", "Name"];
    const expectedFields = ["code", "name"];
    const testId = "DiningCommonsTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-code`),
    ).toHaveTextContent("carrillo");
    const carrilloLink = screen.getByText("carrillo");
    expect(carrilloLink).toHaveAttribute("href", "/diningcommons/carrillo");

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-code`),
    ).toHaveTextContent("de-la-guerra");
    const dlgLink = screen.getByText("de-la-guerra");
    expect(dlgLink).toHaveAttribute("href", "/diningcommons/de-la-guerra");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-code`),
    ).toHaveTextContent("ortega");
    const ortegaLink = screen.getByText("ortega");
    expect(ortegaLink).toHaveAttribute("href", "/diningcommons/ortega");
  });
});
