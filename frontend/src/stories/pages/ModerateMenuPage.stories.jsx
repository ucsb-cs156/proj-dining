import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";
import ModerateMenuPage from "main/pages/ModerateMenuPage";

export default {
  title: "pages/ModerateMenuPage",
  component: ModerateMenuPage,
};

const Template = () => <ModerateMenuPage />;

export const ModeratorUser = Template.bind({});
ModeratorUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.moderatorUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
  ],
};
