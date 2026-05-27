const statisticsFixtures = {
  threeBestItems: [
    {
      itemId: 1,
      itemName: "Waffle",
      diningCommonsCode: "carrillo",
      mealCode: "breakfast",
      station: "Bakery",
      averageStars: 4.9,
      reviewCount: 12,
    },
    {
      itemId: 2,
      itemName: "Soup",
      diningCommonsCode: "ortega",
      mealCode: "lunch",
      station: "Stove",
      averageStars: 4.5,
      reviewCount: 8,
    },
    {
      itemId: 3,
      itemName: "Pizza",
      diningCommonsCode: "portola",
      mealCode: "dinner",
      station: "Oven",
      averageStars: 4.2,
      reviewCount: 5,
    },
  ],
  threeWorstItems: [
    {
      itemId: 4,
      itemName: "Mystery Meat",
      diningCommonsCode: "de-la-guerra",
      mealCode: "dinner",
      station: "Grill",
      averageStars: 1.1,
      reviewCount: 9,
    },
    {
      itemId: 5,
      itemName: "Cold Eggs",
      diningCommonsCode: "carrillo",
      mealCode: "breakfast",
      station: "Bakery",
      averageStars: 1.5,
      reviewCount: 6,
    },
    {
      itemId: 6,
      itemName: "Stale Bread",
      diningCommonsCode: "ortega",
      mealCode: "lunch",
      station: "Bakery",
      averageStars: 1.8,
      reviewCount: 4,
    },
  ],
  commonsAverages: [
    {
      diningCommonsCode: "carrillo",
      averageStars: 4.0,
      reviewCount: 18,
    },
    {
      diningCommonsCode: "de-la-guerra",
      averageStars: 3.5,
      reviewCount: 9,
    },
    {
      diningCommonsCode: "ortega",
      averageStars: 4.7,
      reviewCount: 14,
    },
    {
      diningCommonsCode: "portola",
      averageStars: 3.9,
      reviewCount: 22,
    },
  ],
  commonsOverTime: [
    {
      diningCommonsCode: "carrillo",
      period: "2025-03",
      averageStars: 4.2,
      reviewCount: 5,
    },
    {
      diningCommonsCode: "carrillo",
      period: "2025-04",
      averageStars: 3.8,
      reviewCount: 7,
    },
    {
      diningCommonsCode: "ortega",
      period: "2025-04",
      averageStars: 4.6,
      reviewCount: 10,
    },
  ],
  mealAverages: [
    {
      diningCommonsCode: "carrillo",
      mealCode: "breakfast",
      averageStars: 4.25,
      reviewCount: 8,
    },
    {
      diningCommonsCode: "carrillo",
      mealCode: "dinner",
      averageStars: 3.5,
      reviewCount: 12,
    },
    {
      diningCommonsCode: "carrillo",
      mealCode: "lunch",
      averageStars: 4.0,
      reviewCount: 10,
    },
  ],
  ortegaMealAverages: [
    {
      diningCommonsCode: "ortega",
      mealCode: "brunch",
      averageStars: 4.75,
      reviewCount: 4,
    },
    {
      diningCommonsCode: "ortega",
      mealCode: "dinner",
      averageStars: 4.3,
      reviewCount: 9,
    },
  ],
};

export { statisticsFixtures };
