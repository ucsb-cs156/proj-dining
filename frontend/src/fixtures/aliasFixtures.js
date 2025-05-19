const aliasFixtures = {
  oneAlias: {
    proposedAlias: "Carrillo",
    approve: true,
    reject: false,
  },
  oneAliasReject: {
    proposedAlias: "Carrillo",
    approve: false,
    reject: true,
  },
  fourAlias: [
    {
      proposedAlias: "Carrillo",
      approve: true,
      reject: false,
    },
    {
      proposedAlias: "De La Guerra",
      approve: false,
      reject: true,
    },
    {
      proposedAlias: "Ortega",
      approve: false,
      reject: true,
    },
    {
      proposedAlias: "Portola",
      approve: true,
      reject: false,
    },
  ],
};

export { aliasFixtures };
