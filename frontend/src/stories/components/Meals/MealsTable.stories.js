import React from "react";
import MealsTable from "main/components/Meals/MealsTable";
import { mealFixtures } from "fixtures/mealFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/Meals/MealsTable",
  component: MealsTable,
};

const Template = (args) => {
  return <MealsTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  meals: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  meals: mealFixtures.threeMeals,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  meals: mealFixtures.threeMeals,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/meals", () => {
      return HttpResponse.json(
        { message: "Meal deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
