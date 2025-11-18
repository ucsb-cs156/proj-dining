import React from "react";
import MealTimesPage from "main/pages/Meal/MealTimesPage";
import { mealFixtures } from "fixtures/mealFixtures";
import { http, HttpResponse } from "msw";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { QueryClient, QueryClientProvider } from "react-query";

export default {
  title: "pages/Meal/MealTimesPage",
  component: MealTimesPage,
  parameters: {
    msw: [
      // Mocking the API response for the specific dateTime and diningCommonsCode
      http.get("/api/diningcommons/2024-11-25/portola", () => {
        return HttpResponse.json(mealFixtures.threeMeals, { status: 200 });
      }),
    ],
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          "dining-commons-code": "portola",
          "date-time": "2024-11-25",
        },
      },
      routing: {
        path: "/diningcommons/:date-time/:dining-commons-code",
      },
    }),
  },
};

const Template = (args) => {
  return <MealTimesPage {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  suppressMemoryRouter: true,
};

// 204 No Content - no meals offered
export const NoMealsOffered = Template.bind({});
NoMealsOffered.args = {
  suppressMemoryRouter: true,
};
NoMealsOffered.parameters = {
  msw: [
    http.get("/api/diningcommons/2024-11-25/portola", () => {
      return new HttpResponse(null, { status: 204 });
    }),
  ],
};

export const ServerError = Template.bind({});
ServerError.args = {
  suppressMemoryRouter: true,
};
ServerError.parameters = {
  msw: [
    http.get("/api/diningcommons/2024-11-25/portola", () => {
      return HttpResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }),
  ],
};