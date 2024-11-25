import React from "react";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { http, HttpResponse } from "msw";

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

export const Empty = Template.bind({});
Empty.args = {
  diningcommons: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});
ThreeItemsOrdinaryUser.args = {
  diningcommons: diningCommonsFixtures.threeDiningCommons,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  diningcommons: diningCommonsFixtures.threeDiningCommons,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/diningcommons", () => {
      return HttpResponse.json(
        { message: "Dining common deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
