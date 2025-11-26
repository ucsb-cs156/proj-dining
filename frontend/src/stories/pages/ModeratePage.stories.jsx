import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { http, HttpResponse } from "msw";

import Moderate from "main/pages/ModerateReviewsPage";

export default {
  title: "pages/Moderate",
  component: Moderate,
};

const Template = () => <Moderate storybook={true} />;

export const ThreeItemsAdminUser = Template.bind({});

ThreeItemsAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/reviews/all", () => {
      return HttpResponse.json(ReviewFixtures.threeReviews);
    }),
    http.delete("/api/reviews", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
