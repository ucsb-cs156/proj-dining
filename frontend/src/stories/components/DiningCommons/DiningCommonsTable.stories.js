import React from "react";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import { QueryClient, QueryClientProvider } from "react-query";

export default {
  title: "components/DiningCommons/DiningCommonsTable",
  component: DiningCommonsTable,
};

const queryClient = new QueryClient();

const Template = (args) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DiningCommonsTable {...args} />
    </QueryClientProvider>
  );
};

export const ThreeItems = Template.bind({});
ThreeItems.args = {
  diningcommons: diningCommonsFixtures.threeDiningCommons,
};
