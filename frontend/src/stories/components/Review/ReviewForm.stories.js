import React from "react";
import ReviewForm from "main/components/Review/ReviewForm";
import { reviewFixtures } from "fixtures/reviewFixtures";

export default {
  title: "components/Review/ReviewForm",
  component: ReviewForm,
};

const Template = (args) => {
  return <ReviewForm {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  Reviews: [],
};

export const OneReview = Template.bind({});

OneReview.args = {
  Reviews: reviewFixtures.oneReview,
};

export const ThreeReviews = Template.bind({});
ThreeReviews.args = {
  Reviews: reviewFixtures.threeReviews,
};
