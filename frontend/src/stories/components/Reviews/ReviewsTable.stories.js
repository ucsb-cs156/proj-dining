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

export const reg = Template.bind({});
reg.args = {
    reviews: ReviewFixtures.oneReview,
    userOptions: false,
    moderatorOptions: false
};

export const user = Template.bind({});
user.args = {
    reviews: ReviewFixtures.oneReview,
    userOptions: true,
    moderatorOptions: false
};

export const moderator = Template.bind({});
moderator.args = {
    reviews: ReviewFixtures.oneReview,
    userOptions: false,
    moderatorOptions: true
};
