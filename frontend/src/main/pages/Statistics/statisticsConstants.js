/** Shared constants for the Review Statistics pages. */

/** Cards displayed on the statistics overview page. */
export const STATISTICS_PAGES = [
  {
    title: "Best Rated Items",
    description:
      "See the highest rated menu items overall and in recent time windows.",
    to: "/statistics/items/best",
    testid: "StatisticsIndexPage-best-items",
    comingSoon: true,
  },
  {
    title: "Worst Rated Items",
    description:
      "See the lowest rated menu items overall and in recent time windows.",
    to: "/statistics/items/worst",
    testid: "StatisticsIndexPage-worst-items",
    comingSoon: true,
  },
  {
    title: "Dining Commons Averages",
    description: "Average review score for each dining commons.",
    to: "/statistics/commons/averages",
    testid: "StatisticsIndexPage-commons-averages",
    comingSoon: false,
  },
  {
    title: "Dining Commons Averages Over Time",
    description: "Average review score for each dining commons by month.",
    to: "/statistics/commons/overtime",
    testid: "StatisticsIndexPage-commons-overtime",
    comingSoon: false,
  },
  {
    title: "Meal Averages by Dining Commons",
    description: "Average review score for each meal at a dining commons.",
    to: "/statistics/commons/meals",
    testid: "StatisticsIndexPage-commons-meals",
    comingSoon: true,
  },
];
