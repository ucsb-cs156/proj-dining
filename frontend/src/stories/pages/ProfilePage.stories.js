import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import ProfilePage from "main/pages/ProfilePage";

export default {
  title: "pages/ProfilePage",
  component: ProfilePage,
};

const Template = () => <ProfilePage />;

export const RegularUser = Template.bind({});
RegularUser.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.userOnly);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
    ],
  },
};

export const AdminUser = Template.bind({});
AdminUser.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.adminUser);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingBoth);
      }),
    ],
  },
};

export const LoggedOutUser = Template.bind({});
LoggedOutUser.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json({ loggedIn: false });
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
    ],
  },
};

export const AliasPendingApproval = Template.bind({});
AliasPendingApproval.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser/updateAlias", () => {
        return HttpResponse.json({
          ...apiCurrentUserFixtures.userOnly,
          root: {
            ...apiCurrentUserFixtures.userOnly.root,
            user: {
              ...apiCurrentUserFixtures.userOnly.root.user,
              alias: "AliasPendingModeration",
            },
          },
        });
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
    ],
  },
};
