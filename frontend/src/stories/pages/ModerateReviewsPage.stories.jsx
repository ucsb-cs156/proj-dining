import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { http, HttpResponse } from "msw";

import ModerateReviewsPage from "main/pages/ModerateReviewsPage";

export default {
  title: "pages/ModerateReviewsPage",
  component: ModerateReviewsPage,
};

const Template = () => <ModerateReviewsPage storybook={true} />;

export const ThreeItemsAdminUser = Template.bind({});

ThreeItemsAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/reviews/needsmoderation", () => {
      return HttpResponse.json(ReviewFixtures.threeReviews);
    }),
    http.delete("/api/reviews", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
