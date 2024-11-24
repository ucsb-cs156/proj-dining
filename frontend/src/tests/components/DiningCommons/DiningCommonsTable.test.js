import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockedNavigate,
}));

describe("DiningCommonsTable tests", () => {
    const queryClient = new QueryClient();

    test("Has the expected column headers and content for ordinary user", () => {
        const currentUser = currentUserFixtures.userOnly;

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <DiningCommonsTable
                        diningcommons={diningCommonsFixtures.threeDiningCommons}
                        currentUser={currentUser}
                    />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        const expectedHeaders = [
            "Name",
            "Code",
            "HasDiningCam",
            "HasSackMeal",
            "HasTakeoutMeal",
        ];
        const expectedFields = [
            "name",
            "code",
            "hasDiningCam",
            "hasSackMeal",
            "hasTakeoutMeal",
        ];
        const testId = "DiningCommonsTable";

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expectedFields.forEach((field) => {
            const cell = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
            expect(cell).toBeInTheDocument();
        });

        expect(
            screen.getByTestId(`${testId}-cell-row-0-col-name`),
        ).toHaveTextContent("Portola");
        expect(
            screen.getByTestId(`${testId}-cell-row-1-col-name`),
        ).toHaveTextContent("De La Guerra");

        const editButton = screen.queryByTestId(
            `${testId}-cell-row-0-col-Edit-button`,
        );
        expect(editButton).not.toBeInTheDocument();

        const deleteButton = screen.queryByTestId(
            `${testId}-cell-row-0-col-Delete-button`,
        );
        expect(deleteButton).not.toBeInTheDocument();
    });

    test("Has the expected column headers and content for adminUser", () => {
        const currentUser = currentUserFixtures.adminUser;

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <DiningCommonsTable
                        diningcommons={diningCommonsFixtures.threeDiningCommons}
                        currentUser={currentUser}
                    />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        const expectedHeaders = [
            "Name",
            "Code",
            "HasDiningCam",
            "HasSackMeal",
            "HasTakeoutMeal",
        ];
        const expectedFields = [
            "name",
            "code",
            "hasDiningCam",
            "hasSackMeal",
            "hasTakeoutMeal",
        ];
        const testId = "DiningCommonsTable";

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expectedFields.forEach((field) => {
            const cell = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
            expect(cell).toBeInTheDocument();
        });

        expect(
            screen.getByTestId(`${testId}-cell-row-0-col-name`),
        ).toHaveTextContent("Portola");
        expect(
            screen.getByTestId(`${testId}-cell-row-1-col-name`),
        ).toHaveTextContent("De La Guerra");

        const editButton = screen.getByTestId(
            `${testId}-cell-row-0-col-Edit-button`,
        );
        expect(editButton).toBeInTheDocument();
        expect(editButton).toHaveClass("btn-primary");

        const deleteButton = screen.getByTestId(
            `${testId}-cell-row-0-col-Delete-button`,
        );
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toHaveClass("btn-danger");
    });

    test("Edit button navigates to the edit page for admin user", async () => {
        const currentUser = currentUserFixtures.adminUser;

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <DiningCommonsTable
                        diningcommons={diningCommonsFixtures.threeDiningCommons}
                        currentUser={currentUser}
                    />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        await waitFor(() => {
            expect(
                screen.getByTestId(`DiningCommonsTable-cell-row-0-col-name`),
            ).toHaveTextContent("Portola");
        });

        const editButton = screen.getByTestId(
            `DiningCommonsTable-cell-row-0-col-Edit-button`,
        );
        expect(editButton).toBeInTheDocument();

        fireEvent.click(editButton);

        await waitFor(() =>
            expect(mockedNavigate).toHaveBeenCalledWith(
                "/diningcommons/edit/Portola",
            ),
        );
    });

    test("Delete button calls delete callback", async () => {
        // arrange
        const currentUser = currentUserFixtures.adminUser;

        const axiosMock = new AxiosMockAdapter(axios);
        axiosMock
            .onDelete("/api/diningcommons")
            .reply(200, { message: "Dining Common deleted" });

        // act - render the component
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <DiningCommonsTable
                        diningcommons={diningCommonsFixtures.threeDiningCommons}
                        currentUser={currentUser}
                    />
                </MemoryRouter>
            </QueryClientProvider>,
        );

        // assert - check that the expected content is rendered

        await waitFor(() => {
            expect(
                screen.getByTestId(`DiningCommonsTable-cell-row-0-col-name`),
            ).toHaveTextContent("Portola");
        });

        const deleteButton = screen.getByTestId(
            `DiningCommonsTable-cell-row-0-col-Delete-button`,
        );
        expect(deleteButton).toBeInTheDocument();

        // act - click the delete button
        fireEvent.click(deleteButton);

        // assert - check that the delete endpoint was called

        await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
        expect(axiosMock.history.delete[0].params).toEqual({ id: "Portola" });
    });
});
