import React from "react";

import AdminUsersPage from "main/pages/AdminUsersPage";

import { toast } from "react-toastify";
import { http, HttpResponse } from "msw";
import usersFixtures from "fixtures/usersFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "pages/AdminUsersPage",
  component: AdminUsersPage,
};

const Template = () => <AdminUsersPage />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/admin/users", () => {
      return HttpResponse.json(usersFixtures.threeUsers, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingBoth, {
        status: 200,
      });
    }),
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),
    http.post("/logout", ({ request }) => {
      toast(`Generated: ${request.method} ${request.url}`);
      return HttpResponse.json(
        {},
        {
          status: 200,
        },
      );
    }),
  ],
};
