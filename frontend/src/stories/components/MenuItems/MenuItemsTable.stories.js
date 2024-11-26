import React from "react";
import MenuItemsTable from "main/components/MenuItems/MenuItemsTable";
import { menuItemFixtures } from "fixtures/menuItemFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "components/MenuItems/MenuItemsTable",
  component: MenuItemsTable,
};

const Template = (args) => {
  return <MenuItemsTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  menuItems: [],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  menuItems: menuItemFixtures.threeMenuItems,
  currentUser: currentUserFixtures.userOnly,
};
