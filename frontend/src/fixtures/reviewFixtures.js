
const ReviewFixtures = {
  oneReview: {
    id: 1,
    studentId: 4921081,
    itemId: "A02341",
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
      studentId: 4921081,
      itemId: "A02341",
      dateItemServed: "2022-01-02T12:00:00",
      status: "Approved",
      userIdModerator: "moderator1",
      moderatorComments: "Looks good",
      dateCreated: "2022-01-01T12:00:00",
      dateEdited: "2022-01-02T13:00:00",
    },
    {
      id: 2,
      studentId: 4921082,
      itemId: "B01321",
      dateItemServed: "2022-02-02T12:00:00",
      status: "Rejected",
      userIdModerator: "moderator1",
      moderatorComments: "Inappropriate content",
      dateCreated: "2022-02-01T12:00:00",
      dateEdited: "2022-02-02T13:00:00",
    },
    {
      id: 3,
      studentId: 4921083,
      itemId: "C23101",
      dateItemServed: "2022-03-02T12:00:00",
      status: "Awaiting Moderation",
      userIdModerator: null,
      moderatorComments: null,
      dateCreated: "2022-03-01T12:00:00",
      dateEdited: "2022-03-01T12:00:00",
    },
  ],
};

export { ReviewFixtures };
