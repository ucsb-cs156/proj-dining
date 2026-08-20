import React from "react";

import ModeratorsCreatePage from "main/pages/Admin/ModeratorsCreatePage";

import { toast } from "react-toastify";
import { http, HttpResponse } from "msw";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

export default {
  title: "pages/Admin/ModeratorsCreatePage",
  component: ModeratorsCreatePage,
};

const Template = () => <ModeratorsCreatePage storybook />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
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
    http.post("/api/admin/moderators/post", ({ request }) => {
      toast(`Generated: ${request.method} ${request.url}`);
      return HttpResponse.json(
        { email: "moderator@ucsb.edu" },
        {
          status: 202,
        },
      );
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
