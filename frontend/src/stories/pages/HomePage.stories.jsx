import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import HomePage from "main/pages/HomePage";
import { diningCommonsFixtures } from "../../fixtures/diningCommonsFixtures";

export default {
  title: "pages/HomePage",
  component: HomePage,
};

const Template = () => <HomePage />;

export const LoggedOut = Template.bind({});
LoggedOut.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(null, { status: 403 });
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
      http.get("/api/dining/all", () => {
        return HttpResponse.json(diningCommonsFixtures.fourCommons);
      }),
    ],
  },
};

export const LoggedInRegularUser = Template.bind({});
LoggedInRegularUser.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.userOnly);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
      http.get("/api/dining/all", () => {
        return HttpResponse.json(diningCommonsFixtures.fourCommons);
      }),
    ],
  },
};

export const LoggedInAdminUserShowingSwaggerAndH2Console = Template.bind({});
LoggedInAdminUserShowingSwaggerAndH2Console.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.adminUser);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingBoth);
      }),
      http.get("/api/dining/all", () => {
        return HttpResponse.json(diningCommonsFixtures.fourCommons);
      }),
    ],
  },
};
