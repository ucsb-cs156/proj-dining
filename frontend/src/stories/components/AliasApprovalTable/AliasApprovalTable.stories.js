import React from "react";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import { AliasApprovalFixtures } from "fixtures/aliasApprovalFixtures";

export default {
  title: "components/AliasApprovalTable/AliasApprovalTable",
  component: AliasApprovalTable,
};

const Template = (args) => {
  return <AliasApprovalTable {...args} />;
};

export const OneView = Template.bind({});
OneView.args = {
  aliases: AliasApprovalFixtures.oneReview,
};

export const ThreeView = Template.bind({});
ThreeView.args = {
  aliases: AliasApprovalFixtures.threeReviews,
};
