import React from "react";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";

export default {
  title: "components/DiningCommons/DiningCommonsTable",
  component: DiningCommonsTable,
};

const Template = (args) => {
  return <DiningCommonsTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  commons: [],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  commons: diningCommonsFixtures.fourCommons,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  commons: diningCommonsFixtures.fourCommons,
};
