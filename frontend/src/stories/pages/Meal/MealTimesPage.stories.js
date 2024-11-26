import React from "react";
import MealTimesPage from "main/pages/Meal/MealTimesPage";
import { mealFixtures } from "fixtures/mealFixtures";
import { http, HttpResponse } from "msw";

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
    reactRouter: {
      location: {
        path: "/diningcommons/2024-11-25/portola",
        pathname: "/diningcommons/2024-11-25/portola",
        search: "",
        hash: "",
        state: null,
      },
      routeParams: {
        dateTime: "2024-11-25",
        diningCommonsCode: "portola",
      },
    },
  },
};

const Template = (args) => {
  return <MealTimesPage {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  suppressMemoryRouter: true,
};
