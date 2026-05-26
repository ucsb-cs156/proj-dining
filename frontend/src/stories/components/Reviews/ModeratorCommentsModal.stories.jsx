import React from "react";
import ModeratorCommentsModal from "main/components/Reviews/ModeratorCommentsModal";

export default {
  title: "components/Reviews/ModeratorCommentsModal",
  component: ModeratorCommentsModal,
};

const Template = (args) => <ModeratorCommentsModal {...args} />;

export const Approve = Template.bind({});
Approve.args = {
  show: true,
  status: "APPROVED",
  onHide: () => {},
  onSubmit: () => {},
};

export const Reject = Template.bind({});
Reject.args = {
  show: true,
  status: "REJECTED",
  onHide: () => {},
  onSubmit: () => {},
};
