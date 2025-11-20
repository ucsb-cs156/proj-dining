const systemInfoFixtures = {
  showingBoth: {
    springH2ConsoleEnabled: true,
    showSwaggerUILink: true,
    oauthLogin: "/oauth2/authorization/google",
    sourceRepo: "https://github.com/ucsb-cs156-f25/proj-dining-f25-06",
  },
  showingNeither: {
    springH2ConsoleEnabled: false,
    showSwaggerUILink: false,
    oauthLogin: "/oauth2/authorization/google",
    sourceRepo: "https://github.com/ucsb-cs156-f25/proj-dining-f25-06",
  },
  oauthLoginUndefined: {
    springH2ConsoleEnabled: false,
    showSwaggerUILink: false,
    sourceRepo: "https://github.com/ucsb-cs156-f25/proj-dining-f25-06",
  },
};

export { systemInfoFixtures };
