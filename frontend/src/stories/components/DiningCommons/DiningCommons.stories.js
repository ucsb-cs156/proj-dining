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
const date = new Date('2025-03-11').toISOString().split('T')[0];

Empty.args = {
  commons: [],
  date: date
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  commons: diningCommonsFixtures.fourCommons,
  date: date
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  commons: diningCommonsFixtures.fourCommons,
  date: date
};
