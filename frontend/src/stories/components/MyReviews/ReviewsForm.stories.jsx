import React from "react";
import ReviewForm from "main/components/MyReviews/ReviewForm";
import { ReviewFixtures } from "fixtures/reviewFixtures";

export default {
  title: "components/MyReviews/ReviewsForm",
  component: ReviewForm,
};

const Template = (args) => {
  return <ReviewForm {...args} />;
};

export const RegView = Template.bind({});
RegView.args = {
  initialItemName: ReviewFixtures.oneReview.item.name,
  submitAction: () => {},
};
