import React from "react";
import MyReviewsTable from "main/components/MyReviews/MyReviewsTable";
import { myReviewsFixtures } from "fixtures/myReviewsFixtures";
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
};

export const ThreeItemsModerator = Template.bind({});
ThreeItemsModerator.args = {
  reviews: myReviewsFixtures.threeReviews,
  moderatorOptions: true,
};

export const ThreeItemsUserDelete = Template.bind({});
ThreeItemsUserDelete.args = {
  reviews: myReviewsFixtures.threeReviews,
  deleteColumn: true,
};

export const ThreeItemsModeratorDelete = Template.bind({});
ThreeItemsModeratorDelete.args = {
  reviews: myReviewsFixtures.threeReviews,
  deleteColumn: true,
  moderatorOptions: true,
};

ThreeItemsModeratorDelete.parameters = {
  msw: [
    http.delete("/api/myreviews", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};

ThreeItemsUserDelete.parameters = {
    msw: [
      http.delete("/api/myreviews", () => {
        return HttpResponse.json({}, { status: 200 });
      }),
    ],
  };
