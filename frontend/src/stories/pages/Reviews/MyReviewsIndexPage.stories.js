import React from "react";
import { http, HttpResponse } from "msw";
import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

export default {
  title: "pages/Reviews/MyReviewsIndexPage",
  component: MyReviewsIndexPage,
  parameters: {
    msw: [
      http.get("/api/reviews/userReviews", () => {
        return HttpResponse.json(ReviewFixtures.threeReviews, { status: 200 });
      }),
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.userOnly);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
    ],
    reactRouter: reactRouterParameters({
      location: {},
      routing: {
        path: "/myreviews",
      },
    }),
  },
};

const Template = (args) => <MyReviewsIndexPage {...args} />;

export const Default = Template.bind({});
Default.args = {
  suppressMemoryRouter: true,
};
