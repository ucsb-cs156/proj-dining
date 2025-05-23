import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { http, HttpResponse } from "msw";

import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";

export default {
  title: "pages/MyReviews/MyReviewsIndexPage",
  component: MyReviewsIndexPage,
};

const Template = () => <MyReviewsIndexPage storybook={true} />;

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/reviews/all", () => {
      return HttpResponse.json(ReviewFixtures.threeReviews);
    }),
  ],
};

// export const ThreeItemsModeratorUser = Template.bind({});

// ThreeItemsModeratorUser.parameters = {
//   msw: [
//     http.get("/api/currentUser", () => {
//       return HttpResponse.json(apiCurrentUserFixtures.moderatorUser);
//     }),
//     http.get("/api/systemInfo", () => {
//       return HttpResponse.json(systemInfoFixtures.showingNeither);
//     }),
//     http.get("/api/reviews/all", () => {
//       return HttpResponse.json(ReviewFixtures.threeReviews);
//     }),
//     http.delete("/api/reviews", () => {
//       return HttpResponse.json({}, { status: 200 });
//     }),
// ],
// };

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
