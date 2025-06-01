import React from "react";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import usersFixtures from "fixtures/usersFixtures";

export default {
  title: "components/AliasApprovalTable/AliasApprovalTable",
  component: AliasApprovalTable,
};

const Template = (args) => {
  return <AliasApprovalTable {...args} />;
};

export const ThreeView = Template.bind({});
ThreeView.args = {
  aliases: usersFixtures.threeUsers,
};
