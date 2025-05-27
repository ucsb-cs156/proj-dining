import React from "react";
import { http, HttpResponse } from "msw";
import Moderate from "main/pages/Moderate";
import usersFixtures from "fixtures/usersFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "pages/Moderate",
  component: Moderate,
};

const Template = () => <Moderate />;

export const LoggedOut = Template.bind({});
LoggedOut.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(null, { status: 403 });
      }),
    ],
  },
};

export const NoAdminRole = Template.bind({});
NoAdminRole.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.userOnly);
      }),
    ],
  },
};

export const AdminView = Template.bind({});
AdminView.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.adminUser);
      }),
      http.get("/api/admin/usersWithProposedAlias", () => {
        return HttpResponse.json(usersFixtures.threeUsers);
      }),
    ],
  },
};
