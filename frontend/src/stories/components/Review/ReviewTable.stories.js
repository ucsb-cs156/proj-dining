import React from "react";
import ReviewTable from "main/components/Review/ReviewTable";
import { reviewFixtures } from "fixtures/reviewFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/Review/ReviewTable",
  component: ReviewTable,
};

const Template = (args) => {
  return <ReviewTable {...args} />;
};

export const Empty = Template.bind({});
Empty.args = {
  reviews: [],
};

export const ThreeItemsOrdinaryUser = Template.bind({});
ThreeItemsOrdinaryUser.args = {
  reviews: reviewFixtures.threeReviews,
  currentUser: currentUserFixtures.userOnly,
  moderatorOptions: false, // Disable moderator options
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  reviews: reviewFixtures.threeReviews,
  currentUser: currentUserFixtures.adminUser,
  deleteColumn: true, // Enable delete column for admin
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/reviews", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};

// New story: ThreeItems with both moderator options and delete column
export const ThreeItemsAdminWithModeratorOptions = Template.bind({});
ThreeItemsAdminWithModeratorOptions.args = {
  reviews: reviewFixtures.threeReviews,
  currentUser: currentUserFixtures.adminUser,
  moderatorOptions: true, // Enable moderator options
  deleteColumn: true, // Enable delete column
};

ThreeItemsAdminWithModeratorOptions.parameters = {
  msw: [
    http.delete("/api/reviews", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
