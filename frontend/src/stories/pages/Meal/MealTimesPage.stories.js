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
    // Simulating route parameters for `dateTime` and `diningCommonsCode`
    reactRouter: {
      // We are mocking the params here, so `useParams` will be able to use these values.
      location: {
        path: "/diningcommons/2024-11-25/portola",
        pathname: "/diningcommons/2024-11-25/portola",
        search: "",
        hash: "",
        state: null,
      },
      // Matching the route for `dateTime` and `diningCommonsCode`
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


// import React from "react";
// import MealTimesPage from "main/pages/Meal/MealTimesPage";
// import { mealFixtures } from "fixtures/mealFixtures";
// import { http, HttpResponse } from "msw";

// import {
//     withRouter,
//     reactRouterParameters,
//   } from "storybook-addon-remix-react-router";
  
//   export default {
//     title: "pages/Meal/MealTimesPage",
//     component: MealTimesPage,
//     decorators: [withRouter],
//     parameters: {
//       reactRouter: reactRouterParameters({
//         location: {
//           pathParams: { dateTime: "2024-11-25", diningCommonsCode: "portola" },
//         },
//         routing: { path: "/diningcommons/:dateTime/:diningCommonsCode" },
//       }),
//     },
//   };

//   const Template = (args) => {
//     return <MealTimesPage {...args} />;
//   };
  
//   export const Default = Template.bind({});
//   Default.args = {
//     suppressMemoryRouter: true,
//   };
//   Default.parameters = {
//     msw: [
//       http.get("/api/diningcommons/2024-11-25/portola", () => {
//         return HttpResponse.json(mealFixtures.threeMeals, {
//           status: 200,
//         });
//       }),
//     ],
//   };