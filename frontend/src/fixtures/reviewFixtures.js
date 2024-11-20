const reviewFixtures = {
  oneReview: {
    id: 1,
    item: "Buttermilk Fried Chicken Sandwich",
    station: "Entree Specials",
    stars: "***",
    reviewText: "soggy",
    status: "Awaiting Moderation",
    modComments: "",
  },
  threeReviews: [
    {
      id: 1,
      item: "Black Bean Chili Rice & Garlic Chip(vgn)",
      station: "Entree Specials",
      stars: "**",
      reviewText: "not very spicy",
      status: "Approved",
      modComments: "",
    },
    {
      id: 2,
      item: "Chicken Caesar Salad",
      station: "Entree",
      stars: "***",
      reviewText: "Vote for me for AS President!",
      status: "Rejected",
      modComments: "Spam",
    },
    {
      id: 3,
      item: "Spicy Kale Caesar Salad (v)",
      station: "Entree Specials",
      stars: "**",
      reviewText: "too spicy",
      status: "Approved",
      modComments: "",
    },
  ],
};

export { reviewFixtures };
