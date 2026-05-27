const roleEmailFixtures = {
  oneItem: {
    email: "moderator1@example.com",
  },
  threeItems: [
    {
      email: "moderator1@example.com",
    },
    {
      email: "admin1@example.com",
    },
    {
      email: "moderator2@example.com",
    },
  ],
  threeItemsWithIsInAdminEmailField: [
    {
      email: "moderator1@example.com",
      isInAdminEmails: true,
    },
    {
      email: "admin1@example.com",
      isInAdminEmails: false,
    },
    {
      email: "moderator2@example.com",
      isInAdminEmails: false,
    },
  ],
};

export { roleEmailFixtures };
