import React from "react";
import ReviewsForMenuItemPage from "main/pages/Reviews/ReviewsForMenuItemPage";
import { reactRouterParameters } from "storybook-addon-remix-react-router";

export default {
  title: "pages/Reviews/ReviewsForMenuItemPage",
  component: ReviewsForMenuItemPage,
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: {
          itemid: "42",
        },
      },
      routing: {
        path: "/reviews/:itemid",
      },
    }),
  },
};

const Template = (args) => <ReviewsForMenuItemPage {...args} />;

export const Placeholder = Template.bind({});
Placeholder.args = {
  suppressMemoryRouter: true,
};
