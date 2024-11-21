import React from "react";
import MyReviewsTable from "main/components/MyReviews/MyReviewsTable";
import { myReviewsFixtures } from "fixtures/myReviewsFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/MyReviews/MyReviewsTable",
  component: MyReviewsTable,
};

const Template = (args) => {
  return <MyReviewsTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  reviews: [],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  reviews: myReviewsFixtures.threeReviews,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  reviews: myReviewsFixtures.threeReviews,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/myreviews", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
