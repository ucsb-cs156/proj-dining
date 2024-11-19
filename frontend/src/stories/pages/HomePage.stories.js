import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import { http, HttpResponse } from "msw";

import HomePage from "main/pages/HomePage";

export default {
  title: "pages/HomePage",
  component: HomePage,
};

const Template = () => <HomePage />;

export const OneDiningCommons = Template.bind({});

OneDiningCommons.parameters = {
  msw: [
    http.get("/api/diningcommons/all", () => {
      return HttpResponse.json(diningCommonsFixtures.oneDiningCommons);
    }),
  ],
};

export const ThreeDiningCommons = Template.bind({});

ThreeDiningCommons.parameters = {
  msw: [
    http.get("/api/diningcommons/all", () => {
      return HttpResponse.json(diningCommonsFixtures.threeDiningCommons);
    }),
  ],
};

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
    ],
  },
};
