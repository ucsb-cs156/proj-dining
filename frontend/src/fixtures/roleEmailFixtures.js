const roleEmailFixtures = {
  oneItem: [
    {
      id: 1,
      email: "moderator1@example.com",
    },
  ],
  threeItems: [
    {
      id: 1,
      email: "moderator1@example.com",
    },
    {
      id: 2,
      email: "admin1@example.com",
    },
    {
      id: 3,
      email: "moderator2@example.com",
    },
  ],
  threeItemsWithIsInAdminEmailField: [
    {
      id: 1,
      email: "moderator1@example.com",
      isInAdminEmails: true,
    },
    {
      id: 2,
      email: "admin1@example.com",
      isInAdminEmails: false,
    },
    {
      id: 3,
      email: "moderator2@example.com",
      isInAdminEmails: false,
    },
  ],
};

export { roleEmailFixtures };
