import ReviewTable from "main/components/Reviews/ReviewTable";
import { ReviewFixtures } from "fixtures/reviewFixtures";

export default {
  title: "components/Reviews/ReviewTable",
  component: ReviewTable,
};

const Template = (args) => <ReviewTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  data: ReviewFixtures.threeReviews,
  userOptions: true,
  moderatorOptions: false,
};

export const ModeratorView = Template.bind({});
ModeratorView.args = {
  data: ReviewFixtures.threeReviews,
  userOptions: false,
  moderatorOptions: true,
};

export const Minimal = Template.bind({});
Minimal.args = {
  data: ReviewFixtures.threeReviews,
  userOptions: false,
  moderatorOptions: false,
};
