import React from "react";
import AliasTable from "main/components/Alias/AliasTable";
import aliasFixtures from "fixtures/aliasFixtures";
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

export const OneAlias = Template.bind({});
OneAlias.args = {
  alias: aliasFixtures.oneAlias,
};

export const NullPropAlias = Template.bind({});
NullPropAlias.args = {
  alias: aliasFixtures.nullPropAlias,
};

export const ThreeAlias = Template.bind({});
ThreeAlias.args = {
  alias: aliasFixtures.threeAlias,
};
