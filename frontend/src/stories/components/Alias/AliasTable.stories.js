import React from "react";
import AliasTable from "main/components/Alias/AliasTable";
import usersFixtures from "fixtures/usersFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { action } from "@storybook/addon-actions";

export default {
  title: "components/Alias/AliasTable",
  component: AliasTable,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient();
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

const Template = (args) => <AliasTable {...args} />;

export const EmptyTable = Template.bind({});
EmptyTable.args = {
  aliases: [],
  onApprove: action("onApprove"),
  onReject: action("onReject"),
};

export const ThreeUsers = Template.bind({});
ThreeUsers.args = {
  aliases: usersFixtures.threeUsers,
  onApprove: action("onApprove"),
  onReject: action("onReject"),
};
