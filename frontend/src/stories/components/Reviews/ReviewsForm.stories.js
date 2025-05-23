import ReviewsForm from "main/components/Reviews/ReviewsForm";
import { ReviewFixtures } from "fixtures/reviewFixtures";

export default {
  title: "components/Reviews/ReviewsForm",
  component: ReviewsForm,
};

const Template = (args) => <ReviewsForm {...args} />;

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
  initialContents: ReviewFixtures.oneReview,
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};
