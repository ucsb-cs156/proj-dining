const usersFixtures = {
  threeUsers: [
    {
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
      alias: "Alias1",
      status: "Awaiting Moderation",
      dateApproved: null,
    },
    {
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
      alias: "Alias2",
      status: "Approved",
      dateApproved: "2024-11-01T10:30:00",
    },
    {
      id: 3,
      email: "craig.zzyzx@example.org",
      googleSub: "123456789012345678901",
      pictureUrl:
        "https://lh3.googleusercontent.com/a-/AOh14GhpDBUt8eCEqiRT45hrFbcimsX_h1ONn0dc3HV8Bp8=s96-c",
      fullName: "Craig Zzyxx",
      givenName: "Craig",
      familyName: "Zzyxx",
      emailVerified: true,
      locale: "en",
      hostedDomain: null,
      admin: false,
      alias: "Alias3",
      status: "Rejected",
      dateApproved: null,
    },
  ],
};

export default usersFixtures;
