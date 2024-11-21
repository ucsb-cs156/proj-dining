import React from "react";
import MenuItemReviewForm from "main/components/Review/ReviewForm";
import { menuItemReviewFixtures } from "fixtures/reviewFixtures";

export default {
  title: "components/Review/ReviewForm",
  component: ReviewForm,
};

const Template = (args) => {
  return <ReviewForm {...args} />;
};

export const Create = Template.bind({});

Create.args = {
  buttonLabel: "Create",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};

export const Update = Template.bind({});

Update.args = {
  initialContents: reviewFixtures.oneReview,
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};
