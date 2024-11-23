import React from "react";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/DiningCommons/DiningCommonsTable",
  component: DiningCommonsTable,
};

const Template = (args) => {
  return <DiningCommonsTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  diningcommons: [],
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
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
