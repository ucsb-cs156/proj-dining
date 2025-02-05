import React from "react";
import { http, HttpResponse } from "msw";
import { menuItemFixtures } from "fixtures/menuItemFixtures";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";

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
    reactRouter: {
      location: {
        path: "/diningcommons/2024-11-25/portola/breakfast",
        pathname: "/diningcommons/2024-11-25/portola/breakfast",
        search: "",
        hash: "",
        state: null,
      },
      routeParams: {
        dateTime: "2024-11-25",
        diningCommonsCode: "portola",
        meal: "breakfast",
      },
    },
  },
};

const Template = (args) => {
  return <MenuItemPage {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  suppressMemoryRouter: true,
};
