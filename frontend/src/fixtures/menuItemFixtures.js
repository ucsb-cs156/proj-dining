// src/fixtures/menuItemFixtures.js

const menuItemFixtures = {
  oneMenuItem: [
    {
      name: "Oatmeal (vgn)",
      station: "Grill (Cafe)",
      reviews: [], // no reviews
    },
  ],
  fiveMenuItems: [
    {
      name: "Oatmeal (vgn)",
      station: "Grill (Cafe)",
      reviews: [],
    },
    {
      name: "Blintz with Strawberry Compote (v)",
      station: "Grill (Cafe)",
      reviews: [],
    },
    {
      name: "Cage Free Scrambled Eggs (v)",
      station: "Grill (Cafe)",
      reviews: [],
    },
    {
      name: "Cage Free Scrambled Egg Whites (v)",
      station: "Grill (Cafe)",
      reviews: [],
    },
    {
      name: "Sliced Potato with Onions (vgn)",
      station: "Grill (Cafe)",
      reviews: [],
    },
  ],

  withReviews: [
    {
      id: 1,
      name: "Oatmeal (vgn)",
      station: "Grill (Cafe)",
      reviews: [
        { itemsStars: 4, reviewerComments: "Really good!", item: 1 },
        { itemsStars: 5, reviewerComments: "Perfect!", item: 1 },
      ],
    },
    {
      id: 2,
      name: "Blintz with Strawberry Compote (v)",
      station: "Grill (Cafe)",
      reviews: [],
    },
    {
      id: 3,
      name: "Cage Free Scrambled Eggs (v)",
      station: "Grill (Cafe)",
      reviews: [{ itemsStars: 2, reviewerComments: "Too salty", item: 3 }],
    },
  ],
};

export { menuItemFixtures };
