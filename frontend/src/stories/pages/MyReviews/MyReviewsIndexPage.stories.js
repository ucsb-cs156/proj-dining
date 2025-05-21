import React from "react";
import { http, HttpResponse } from "msw";
import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { reviewFixtures } from "fixtures/reviewFixtures";

export default {
  title: "pages/MyReviews/MyReviewsIndexPage",
  component: MyReviewsIndexPage,
  parameters: {
    msw: [
      http.get("/api/reviews/my", () => {
        return HttpResponse.json(reviewFixtures.threeReviews);
      }),
    ],
  },
};

const Template = (args) => {
  return <MyReviewsIndexPage {...args} />;
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
      http.get("/api/reviews/my", () => {
        return HttpResponse.json(reviewFixtures.threeReviews);
      }),
    ],
  },
};
