import React from "react";

import MealTable from "main/components/Meal/MealTable";
import { mealFixtures } from "fixtures/mealFixtures";

export default {
  title: "components/Meal/MealTable",
  component: MealTable,
};

const Template = (args) => {
  return <MealTable {...args} />;
};

export const Empty = Template.bind({});
Empty.args = {
  meals: [],
};

export const ExampleMeals = Template.bind({});
ExampleMeals.args = {
    dateTime: "2024-11-25",
    diningCommonsCode: "portola",
    meals: mealFixtures.threeMeals,
};
