import React from "react";
import MenuItemTable from "main/components/MenuItem/MenuItemTable";
import { menuItemFixtures } from "fixtures/menuItemFixtures";

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
};

export const FiveMenuItems = Template.bind({});
FiveMenuItems.args = {
  menuItems: menuItemFixtures.fiveMenuItems,
};
