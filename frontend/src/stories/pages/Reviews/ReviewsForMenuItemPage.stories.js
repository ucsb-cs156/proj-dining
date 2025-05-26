import React from "react";
import { http, HttpResponse } from "msw";
import ReviewsForMenuItemPage from "main/pages/Reviews/ReviewsForMenuItemPage";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

export default {
  title: "pages/Reviews/ReviewsForMenuItemPage",
  component: ReviewsForMenuItemPage,
  parameters: {
    msw: [
      http.get("/api/diningcommons/menuitem", ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("id") === "42") {
          return HttpResponse.json(
            { reviews: ReviewFixtures.threeReviews },
            { status: 200 },
          );
        }
        return HttpResponse.json({ reviews: [] }, { status: 200 });
      }),
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.userOnly);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
    ],
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
