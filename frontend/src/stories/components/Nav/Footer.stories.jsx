import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import Footer from "main/components/Nav/Footer";

export default {
  title: "components/Nav/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {},
};

const Template = (args) => {
  return <Footer {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  systemInfo: systemInfoFixtures.showingNeither,
};

export const WithFeedbackButton = Template.bind({});
WithFeedbackButton.args = {
  systemInfo: systemInfoFixtures.showingFeedbackUrl,
};
