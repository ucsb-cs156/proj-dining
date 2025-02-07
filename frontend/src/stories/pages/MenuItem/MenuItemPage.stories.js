import React from "react";
import { http, HttpResponse } from "msw";
import { menuItemFixtures } from "fixtures/menuItemFixtures";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

export default {
  title: "pages/MenuItem/MenuItemPage",
  component: MenuItemPage,
  parameters: {
    msw: [
      // Mocking the API response for the specific dateTime and diningCommonsCode
      http.get("/api/diningcommons/2024-11-25/portola/breakfast", () => {
        return HttpResponse.json(menuItemFixtures.fiveMenuItems, {
          status: 200,
        });
      }),
    ],
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          meal: "breakfast",
          "dining-commons-code": "portola",
          "date-time": "2024-11-25",
        },
      },
      routing: {
        path: "/diningcommons/:date-time/:dining-commons-code/:meal",
      },
    }),
  },
};

const Template = (args) => {
  return <MenuItemPage {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  suppressMemoryRouter: true,
};

export const LoggedIn = Template.bind({});
LoggedIn.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.userOnly);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
      http.get("/api/diningcommons/2024-11-25/portola/breakfast", () => {
        return HttpResponse.json(menuItemFixtures.fiveMenuItems, {
          status: 200,
        });
      }),
    ],
  },
};
