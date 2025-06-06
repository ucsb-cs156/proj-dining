// src/stories/components/MenuItemTable.stories.jsx
import React from "react";
import MenuItemTable from "main/components/MenuItem/MenuItemTable";
import { menuItemFixtures } from "fixtures/menuItemFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "components/MenuItem/MenuItemTable",
  component: MenuItemTable,
};

const Template = (args) => <MenuItemTable {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  menuItems: [],
  currentUser: currentUserFixtures.notLoggedIn,
};

export const OneMenuItem = Template.bind({});
OneMenuItem.args = {
  menuItems: menuItemFixtures.oneMenuItem,
  currentUser: currentUserFixtures.notLoggedIn,
};

export const FiveMenuItems = Template.bind({});
FiveMenuItems.args = {
  menuItems: menuItemFixtures.fiveMenuItems,
  currentUser: currentUserFixtures.notLoggedIn,
};

export const WithReviews = Template.bind({});
WithReviews.args = {
  menuItems: menuItemFixtures.withReviews,
  currentUser: currentUserFixtures.notLoggedIn,
};
