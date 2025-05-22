import React from "react";
import { action } from "@storybook/addon-actions";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import aliasFixtures from "fixtures/aliasFixtures";

export default {
  title: "Components/AliasApproval/AliasApprovalTable",
  component: AliasApprovalTable,
};

const Template = (args) => <AliasApprovalTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  commons: aliasFixtures.threeAlias,
  onApprove: action("onApprove"),
  onReject: action("onReject"),
};

export const NoAliases = Template.bind({});
NoAliases.args = {
  commons: [],
  onApprove: action("onApprove"),
  onReject: action("onReject"),
};

export const SingleAlias = Template.bind({});
SingleAlias.args = {
  commons: [aliasFixtures.oneAlias],
  onApprove: action("onApprove"),
  onReject: action("onReject"),
};
