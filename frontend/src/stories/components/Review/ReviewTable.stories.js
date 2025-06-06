import React from "react";
import ReviewTable from "main/components/Review/ReviewTable";
import { reviewFixtures } from "fixtures/reviewFixtures";

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

export const BasicThreeReviews = Template.bind({});
BasicThreeReviews.args = {
  reviews: reviewFixtures.threeReviews,
};

export const UserOptions = Template.bind({});
UserOptions.args = {
  reviews: reviewFixtures.threeReviews,
  userOptions: true,
  onEdit: () => console.log("Edit clicked"),
  onDelete: () => console.log("Delete clicked"),
};

export const ModeratorOptions = Template.bind({});
ModeratorOptions.args = {
  reviews: reviewFixtures.threeReviews,
  moderatorOptions: true,
  onApprove: () => console.log("Approve clicked"),
  onReject: () => console.log("Reject clicked"),
};

export const FullOptions = Template.bind({});
FullOptions.args = {
  reviews: reviewFixtures.threeReviews,
  userOptions: true,
  moderatorOptions: true,
  onEdit: () => console.log("Edit clicked"),
  onDelete: () => console.log("Delete clicked"),
  onApprove: () => console.log("Approve clicked"),
  onReject: () => console.log("Reject clicked"),
};
