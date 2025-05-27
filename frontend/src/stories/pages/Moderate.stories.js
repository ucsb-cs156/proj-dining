import React from "react";
import { rest } from "msw";
import Moderate from "main/pages/Moderate";
import usersFixtures from "fixtures/usersFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "pages/Moderate",
  component: Moderate,
  parameters: {
    // Apply the systemInfo stub globally
    msw: {
      handlers: [
        rest.get("/api/systemInfo", (req, res, ctx) => {
          return res(ctx.json({ springH2ConsoleEnabled: false }));
        }),
      ],
    },
  },
};

const Template = () => <Moderate />;

export const LoggedOut = Template.bind({});
LoggedOut.parameters = {
  msw: {
    handlers: [
      // first, systemInfo from the default
      ...Moderate.parameters.msw.handlers,
      // then override currentUser
      rest.get("/api/currentUser", (req, res, ctx) => {
        return res(ctx.status(403), ctx.json(null));
      }),
    ],
  },
};

export const NoAdminRole = Template.bind({});
NoAdminRole.parameters = {
  msw: {
    handlers: [
      ...Moderate.parameters.msw.handlers,
      rest.get("/api/currentUser", (req, res, ctx) => {
        // returns a logged-in non-admin user
        return res(ctx.json(apiCurrentUserFixtures.userOnly));
      }),
    ],
  },
};

export const AdminView = Template.bind({});
AdminView.parameters = {
  msw: {
    handlers: [
      ...Moderate.parameters.msw.handlers,
      rest.get("/api/currentUser", (req, res, ctx) => {
        return res(ctx.json(apiCurrentUserFixtures.adminUser));
      }),
      rest.get("/api/admin/usersWithProposedAlias", (req, res, ctx) => {
        return res(ctx.json(usersFixtures.threeUsers));
      }),
    ],
  },
};
