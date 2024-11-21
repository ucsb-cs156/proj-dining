import { mealsFixtures } from "fixtures/mealsFixtures";
import MealsTable from "main/components/DiningCommons/MealsTable";

export default {
  title: "components/DiningCommons/MealsTable",
  component: MealsTable,
};

const Template = (args) => {
  return <MealsTable {...args} />;
};

export const Sample = Template.bind({});

Sample.args = {mealsData: mealsFixtures.threeMeals, dateTime: "2021-10-01", diningCommonsCode: "de-la-guerra"};
