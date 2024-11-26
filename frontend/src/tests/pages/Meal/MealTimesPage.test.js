import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import MealTimesPage from "main/pages/Meal/MealTimesPage";
import { mealFixtures } from "fixtures/mealFixtures"; // Mock fixture data
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";

// // Mock the toast function
// const mockToast = jest.fn();
// jest.mock("react-toastify", () => ({
//   __esModule: true,
//   toast: (x) => mockToast(x),
// }));

// // Mock the react-router-dom useParams hook to simulate the route params
// jest.mock("react-router-dom", () => ({
//   ...jest.requireActual("react-router-dom"),
//   useParams: () => ({
//     "date-time": "2024-11-25",
//     "dining-commons-code": "portola",
//   }),
// }));

// const mockToast = jest.fn();
// jest.mock("react-toastify", () => {
//   const originalModule = jest.requireActual("react-toastify");
//   return {
//     __esModule: true,
//     ...originalModule,
//     toast: (x) => mockToast(x),
//   };
// });
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      "date-time": "2024-11-25",
      "dining-commons-code": "portola",
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

// Mock Axios with mock adapter
const axiosMock = new AxiosMockAdapter(axios);

const queryClient = new QueryClient();

describe("MealTimesPage tests", () => {
 const axiosMock = new AxiosMockAdapter(axios);
  beforeEach(() => {
    jest.spyOn(console, "error");
    console.error.mockImplementation(() => null);
  });
  beforeEach(() => {
    axiosMock.reset();
    axiosMock
      .onGet(`/api/diningcommons/2024-11-25/portola`)
      .reply(200, mealFixtures.threeMeals); // Return mock data for the test
  });

  test("renders without crashing", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  });

  test("displays correct information in the table", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for the meal information to be loaded
    await waitFor(() => screen.getByText(`Meals at portola for 2024-11-25`));

    // Ensure that the header is correct
    expect(screen.getByText(`Meals at portola for 2024-11-25`)).toBeInTheDocument();

    // Check that each meal time is displayed correctly
    expect(screen.getByText("Breakfast")).toBeInTheDocument();
    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText("Dinner")).toBeInTheDocument();
  });

});










// import { QueryClient, QueryClientProvider } from "react-query";
// import { MemoryRouter } from "react-router-dom";
// import axios from "axios";
// import AxiosMockAdapter from "axios-mock-adapter";
// import MealTimesPage from "main/pages/Meal/MealTimesPage";
// import MealTable from "main/components/Meal/MealTable";
// import { mealFixtures } from "fixtures/mealFixtures";

// const mockToast = jest.fn();
// jest.mock("react-toastify", () => {
//   const originalModule = jest.requireActual("react-toastify");
//   return {
//     __esModule: true,
//     ...originalModule,
//     toast: (x) => mockToast(x),
//   };
// });
// const mockNavigate = jest.fn();
// jest.mock("react-router-dom", () => {
//   const originalModule = jest.requireActual("react-router-dom");
//   return {
//     __esModule: true,
//     ...originalModule,
//     useParams: () => ({
//       "date-time": "2024-11-25",
//       "dining-commons-code": "portola",
//     }),
//     Navigate: (x) => {
//       mockNavigate(x);
//       return null;
//     },
//   };
// });

// describe("Meal Times Page tests", () => {
//   const axiosMock = new AxiosMockAdapter(axios);
//   beforeEach(() => {
//     jest.spyOn(console, "error");
//     console.error.mockImplementation(() => null);
//   });

//   const dateTime = "2024-11-25"; 
//   const diningCommonsCode = "portola"; 

//   beforeEach(() => {
//     axiosMock.reset();
//     axiosMock.resetHistory();
//     axiosMock
//       .onGet(`/api/diningcommons/${dateTime}/${diningCommonsCode}`, {
//         params: { "date-time": dateTime, "dining-commons-code": diningCommonsCode },
//       })
//       .reply(200, mealFixtures.threeMeals);
//   });

//   const queryClient = new QueryClient();
//   test("renders without crashing", () => {
//     render(
//       <QueryClientProvider client={queryClient}>
//         <MemoryRouter>
//           <MealTimesPage />
//         </MemoryRouter>
//       </QueryClientProvider>,
//     );
//   });

//   test("Displays correct information in the table", async () => {
//     render(
//       <QueryClientProvider client={queryClient}>
//         <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
//           <MealTimesPage/>
//         </MemoryRouter>
//       </QueryClientProvider>,

//     );

//     await waitFor(() => screen.getByText(`Meals at ${diningCommonsCode} for ${dateTime}`));

//     expect(
//       screen.getByText(`Meals at ${diningCommonsCode} for ${dateTime}`),
//     ).toBeInTheDocument();

//     expect(screen.getByText("Breakfast")).toBeInTheDocument();
//     expect(screen.getByText("Lunch")).toBeInTheDocument();
//     expect(screen.getByText("Dinner")).toBeInTheDocument();
   
//   });
// });