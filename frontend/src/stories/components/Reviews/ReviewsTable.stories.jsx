import React from "react";
import ReviewsTable from "main/components/Reviews/ReviewsTable";
import { ReviewFixtures } from "fixtures/reviewFixtures";

export default {
  title: "components/Reviews/ReviewsTable",
  component: ReviewsTable,
};

const Template = (args) => {
  return <ReviewsTable {...args} />;
};

export const RegView = Template.bind({});
RegView.args = {
  reviews: ReviewFixtures.threeReviews,
  userOptions: false,
  moderatorOptions: false,
};

export const UserView = Template.bind({});
UserView.args = {
  reviews: ReviewFixtures.threeReviews,
  userOptions: true,
  moderatorOptions: false,
  showModerationStatus: true,
};

export const ModView = Template.bind({});
ModView.args = {
  reviews: ReviewFixtures.threeReviews,
  userOptions: false,
  moderatorOptions: true,
};
