import React from "react";
import { http, HttpResponse } from "msw";
import ModeratePage from "main/pages/ModeratePage";
import usersFixtures from "fixtures/usersFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "pages/ModeratePage",
  component: ModeratePage,
};

const Template = () => <ModeratePage />;

export const LoggedOut = Template.bind({});
LoggedOut.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(null, { status: 403 });
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json({ springH2ConsoleEnabled: false });
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
      http.get("/api/systemInfo", () => {
        return HttpResponse.json({ springH2ConsoleEnabled: false });
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
      http.get("/api/systemInfo", () => {
        return HttpResponse.json({ springH2ConsoleEnabled: false });
      }),
      http.get("/api/admin/usersWithProposedAlias", () => {
        return HttpResponse.json(usersFixtures.threeUsers);
      }),
    ],
  },
};
