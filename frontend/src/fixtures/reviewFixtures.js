const reviewFixtures = {
  oneReview: {
    id: 1,
    studentId: 1,
    itemId: 7,
    dateItemServed: "2022-01-02T12:00:00",
    status: "AWAITING_REVIEW",
    userIdModerator: null,
    moderatorComments: null,
    dateCreated: "2022-01-01T12:00:00",
    dateEdited: "2022-01-01T12:00:00",
  },
  threeReviews: [
    {
      id: 1,
      score: 5,
      comments: "Amazing food!",
      dateServed: "2024-10-01",
      itemName: "Pizza",
    },
    {
      id: 2,
      score: 3,
      comments: "Pretty good",
      dateServed: "2024-10-02",
      itemName: "Pasta",
    },
    {
      id: 3,
      score: 1,
      comments: "Not great",
      dateServed: "2024-10-03",
      itemName: "Salad",
    },
  ],
};

export { reviewFixtures };
