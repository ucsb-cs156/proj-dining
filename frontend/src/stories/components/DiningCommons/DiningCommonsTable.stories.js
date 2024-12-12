import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";

export default {
  title: "components/DiningCommons/DiningCommonsTable",
  component: DiningCommonsTable,
};

const Template = (args) => {
  return <DiningCommonsTable {...args} />;
};

export const Sample = Template.bind({});

Sample.args = {
  diningCommonsData: [
    {
      code: "carrillo",
      name: "Carrillo",
    },

    {
      code: "de-la-guerra",
      name: "De La Guerra",
    },

    {
      code: "ortega",
      name: "Ortega",
    },
  ],
};
