import React from "react";
import ReviewModeratorModal from "main/components/Modal/ReviewModeratorModal";

export default {
  title: "components/Modal/ReviewModeratorModal",
  component: ReviewModeratorModal,
};

const Template = (args) => {
  return <ReviewModeratorModal {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  onClose: () => {},
  status: "APPROVED",
  onSubmit: () => {},
};

export const Rejected = Template.bind({});
Rejected.args = {
  isOpen: true,
  onClose: () => {},
  status: "REJECTED",
  onSubmit: () => {},
};

export const Closed = Template.bind({});
Closed.args = {
  isOpen: false,
  onClose: () => {},
  status: "APPROVED",
  onSubmit: () => {},
};
