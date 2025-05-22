import React from "react";
import ReviewForm from "main/components/Review/ReviewForm";
import { ReviewFixtures } from "fixtures/reviewFixtures";

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

export const oneReview = Template.bind({});

oneReview.args = {
  Reviews: ReviewFixtures.oneReview,
};

export const threeReviews = Template.bind({});
threeReviews.args = {
  Reviews: ReviewFixtures.threeReviews,
};
