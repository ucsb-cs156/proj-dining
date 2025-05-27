import React from "react";
import AliasTable from "main/components/Alias/AliasTable";
import usersFixtures from "fixtures/usersFixtures";
import { QueryClient, QueryClientProvider } from "react-query";

export default {
  title: "components/Alias/AliasTable",
  component: AliasTable,
  decorators: [
    (Story) => {
      // Wrap stories with React Query context
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
  alias: [],
};

export const ThreeUsers = Template.bind({});
ThreeUsers.args = {
  alias: usersFixtures.threeUsers,
};
