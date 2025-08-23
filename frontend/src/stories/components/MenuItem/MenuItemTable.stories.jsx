import React from "react";
import MenuItemTable from "main/components/MenuItem/MenuItemTable";
import { menuItemFixtures } from "fixtures/menuItemFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "components/MenuItem/MenuItemTable",
  component: MenuItemTable,
};

const Template = (args) => {
  return <MenuItemTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  menuItems: [],
};

export const OneMenuItem = Template.bind({});

OneMenuItem.args = {
  menuItems: menuItemFixtures.oneMenuItem,
  currentUser: currentUserFixtures.userOnly,
};

export const FiveMenuItems = Template.bind({});
FiveMenuItems.args = {
  menuItems: menuItemFixtures.fiveMenuItems,
  currentUser: currentUserFixtures.userOnly,
};
