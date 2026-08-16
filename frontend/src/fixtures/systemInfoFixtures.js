const systemInfoFixtures = {
  showingBoth: {
    springH2ConsoleEnabled: true,
    showSwaggerUILink: true,
    oauthLogin: "/oauth2/authorization/google",
    sourceRepo: "https://github.com/ucsb-cs156/proj-dining",
    commitId: "abc1234",
    commitMessage: "Fix a bug",
    githubUrl: "https://github.com/ucsb-cs156/proj-dining/commit/abc1234",
  },
  showingNeither: {
    springH2ConsoleEnabled: false,
    showSwaggerUILink: false,
    oauthLogin: "/oauth2/authorization/google",
  },
  oauthLoginUndefined: {
    springH2ConsoleEnabled: false,
    showSwaggerUILink: false,
  },
};

export { systemInfoFixtures };
