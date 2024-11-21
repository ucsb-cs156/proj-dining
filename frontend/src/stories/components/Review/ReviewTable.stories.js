import React from "react";
import MenuItemReivewTable from "main/components/Review/ReviewTable";
import { menuItemReviewFixtures } from "fixtures/reviewFixtures";
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
  dates: [],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  dates: reviewFixtures.threeReviews,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  dates: reviewFixtures.threeReviews,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/review", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
