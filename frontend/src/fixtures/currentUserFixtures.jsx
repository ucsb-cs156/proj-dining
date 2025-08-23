const apiCurrentUserFixtures = {
  adminUser: {
    user: {
      id: 1,
      email: "phtcon@ucsb.edu",
      googleSub: "115856948234298493496",
      pictureUrl:
        "https://lh3.googleusercontent.com/-bQynVrzVIrU/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucmkGuVsELD1ZeV5iDUAUfe6_K-p8w/s96-c/photo.jpg",
      fullName: "Phill Conrad",
      givenName: "Phill",
      familyName: "Conrad",
      emailVerified: true,
      locale: "en",
      hostedDomain: "ucsb.edu",
      admin: true,
      moderator: false,
    },
    roles: [
      {
        authority: "ROLE_MEMBER",
      },
      {
        authority: "SCOPE_openid",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      },
      {
        authority: "ROLE_USER",
        attributes: {
          sub: "115856948234298493496",
          name: "Phill Conrad",
          given_name: "Phill",
          family_name: "Conrad",
          picture:
            "https://lh3.googleusercontent.com/a/AATXAJyxrU2gDahCiNe4ampVZlv5176Jo0F0PG3KyYgk=s96-c",
          email: "phtcon@ucsb.edu",
          email_verified: true,
          locale: "en",
          hd: "ucsb.edu",
        },
      },
      {
        authority: "ROLE_ADMIN",
      },
    ],
  },
  userOnly: {
    user: {
      id: 2,
      email: "pconrad.cis@gmail.com",
      googleSub: "102656447703889917227",
      pictureUrl:
        "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
      fullName: "Phillip Conrad",
      givenName: "Phillip",
      familyName: "Conrad",
      emailVerified: true,
      locale: "en",
      hostedDomain: null,
      admin: false,
      moderator: false,
      alias: "NewAlias",
      proposedAlias: "PropAlias",
      status: "Awaiting Moderation",
    },
    roles: [
      {
        authority: "SCOPE_openid",
      },
      {
        authority: "ROLE_USER",
        attributes: {
          sub: "102656447703889917227",
          name: "Phillip Conrad",
          given_name: "Phillip",
          family_name: "Conrad",
          picture:
            "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
          email: "pconrad.cis@gmail.com",
          email_verified: true,
          locale: "en",
        },
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      },
    ],
  },
  missingRolesToTestErrorHandling: {
    user: {
      id: 2,
      email: "pconrad.cis@gmail.com",
      googleSub: "102656447703889917227",
      pictureUrl:
        "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
      fullName: "Phillip Conrad",
      givenName: "Phillip",
      familyName: "Conrad",
      emailVerified: true,
      locale: "en",
      hostedDomain: null,
      admin: false,
    },
  },
  moderatorUser: {
    user: {
      id: 3,
      email: "nathanalexander626@gmail.com",
      googleSub: "107175401128615622969",
      pictureUrl:
        "https://lh3.googleusercontent.com/a/ACg8ocLKdqBolIMKIOGYiRCGLzwu2uUkcCx0FBtmE1CDF8fsfXBlz3sv=s96-c",
      fullName: "Nathaniel Alexander",
      givenName: "Nathaniel",
      familyName: "Alexander",
      emailVerified: true,
      locale: "en",
      hostedDomain: null,
      admin: false,
      moderator: true,
      alias: "Anonymous User",
      proposedAlias: null,
      status: null,
    },
    roles: [
      {
        authority: "ROLE_MEMBER",
      },
      {
        authority: "SCOPE_openid",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
      },
      {
        authority: "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      },
      {
        authority: "ROLE_USER",
        attributes: {
          sub: "107175401128615622969",
          name: "Nathaniel Alexander",
          given_name: "Nathaniel",
          family_name: "Alexander",
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocLKdqBolIMKIOGYiRCGLzwu2uUkcCx0FBtmE1CDF8fsfXBlz3sv=s96-c",
          email: "nathanalexander626@gmail.com",
          email_verified: true,
          locale: "en",
        },
      },
      {
        authority: "ROLE_MODERATOR",
      },
    ],
  },
};

const currentUserFixtures = {
  adminUser: {
    loggedIn: true,
    root: {
      ...apiCurrentUserFixtures.adminUser,
      rolesList: [
        "ROLE_MEMBER",
        "SCOPE_openid",
        "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
        "SCOPE_https://www.googleapis.com/auth/userinfo.email",
        "ROLE_USER",
        "ROLE_ADMIN",
      ],
    },
  },
  userOnly: {
    loggedIn: true,
    root: {
      ...apiCurrentUserFixtures.userOnly,
      rolesList: [
        "SCOPE_openid",
        "ROLE_USER",
        "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
        "SCOPE_https://www.googleapis.com/auth/userinfo.email",
      ],
    },
  },
  notLoggedIn: {
    loggedIn: false,
    root: {},
  },
  moderatorUser: {
    loggedIn: true,
    root: {
      ...apiCurrentUserFixtures.moderatorUser,
      rolesList: [
        "ROLE_MEMBER",
        "SCOPE_openid",
        "SCOPE_https://www.googleapis.com/auth/userinfo.profile",
        "SCOPE_https://www.googleapis.com/auth/userinfo.email",
        "ROLE_USER",
        "ROLE_MODERATOR",
      ],
    },
  },
};

export { currentUserFixtures, apiCurrentUserFixtures };
