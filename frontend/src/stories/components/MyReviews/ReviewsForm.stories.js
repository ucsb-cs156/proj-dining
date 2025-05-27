import React from "react";
import ReviewForm from "main/components/MyReviews/ReviewForm";
import { ReviewFormFixtures } from "fixtures/reviewFormFixtures";

export default {
  title: "components/MyReviews/ReviewsTable",
  component: ReviewForm,
};

const Template = (args) => {
  return <ReviewForm {...args} />;
};

export const RegView = Template.bind({});
RegView.args = {
  initialItemName: ReviewFormFixtures.name,
  submitAction: () => {}
};