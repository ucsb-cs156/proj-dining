import React from "react";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import usersFixtures from "fixtures/usersFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

export default {
  title: "components/AliasApproval/AliasApprovalTable",
  component: AliasApprovalTable,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient();
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      );
    },
  ],
};

const Template = (args) => <AliasApprovalTable {...args} />;

export const EmptyTable = Template.bind({});
EmptyTable.args = {
  aliases: [],
  onApprove: () => {},
  onReject: () => {},
};

export const ThreeUsers = Template.bind({});
ThreeUsers.args = {
  aliases: usersFixtures.threeUsers,
  onApprove: () => {},
  onReject: () => {},
};
