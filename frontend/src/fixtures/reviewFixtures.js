const ReviewFixtures = {
  oneReview: {
    id: 1,
    studentId: 1,
    itemId: 7,
    dateItemServed: "2022-01-02T12:00:00",
    status: "Awaiting Moderation",
    userIdModerator: null,
    moderatorComments: null,
    dateCreated: "2022-01-01T12:00:00",
    dateEdited: "2022-01-01T12:00:00",
  },
  threeReviews: [
    {
      id: 1,
      studentId: 1,
      itemId: 7,
      dateItemServed: "2022-01-02T12:00:00",
      status: "Approved",
      userIdModerator: 4,
      moderatorComments: "Looks good",
      dateCreated: "2022-01-01T12:00:00",
      dateEdited: "2022-01-02T13:00:00",
    },
    {
      id: 2,
      studentId: 2,
      itemId: 8,
      dateItemServed: "2022-02-02T12:00:00",
      status: "Rejected",
      userIdModerator: 5,
      moderatorComments: "Inappropriate content",
      dateCreated: "2022-02-01T12:00:00",
      dateEdited: "2022-02-02T13:00:00",
    },
    {
      id: 3,
      studentId: 3,
      itemId: 9,
      dateItemServed: "2022-03-02T12:00:00",
      status: "Awaiting Moderation",
      userIdModerator: 6,
      moderatorComments: "Thanks!",
      dateCreated: "2022-03-01T12:00:00",
      dateEdited: "2022-03-01T12:00:00",
    },
  ],
};

export { ReviewFixtures };