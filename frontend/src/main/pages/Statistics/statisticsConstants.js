/** Shared constants for the Review Statistics pages. */

/** Period options accepted by the best/worst items endpoints. */
export const PERIOD_OPTIONS = [
  { value: "ALL", label: "All time" },
  { value: "6M", label: "Last 6 months" },
  { value: "1M", label: "Last month" },
  { value: "1W", label: "Last week" },
];

/** Cards displayed on the statistics overview page. */
export const STATISTICS_PAGES = [
  {
    title: "Best Rated Items",
    description:
      "See the highest rated menu items overall and in recent time windows.",
    to: "/statistics/items/best",
    testid: "StatisticsIndexPage-best-items",
    comingSoon: false,
  },
  {
    title: "Worst Rated Items",
    description:
      "See the lowest rated menu items overall and in recent time windows.",
    to: "/statistics/items/worst",
    testid: "StatisticsIndexPage-worst-items",
    comingSoon: false,
  },
  {
    title: "Dining Commons Averages",
    description: "Average review score for each dining commons.",
    to: "/statistics/commons/averages",
    testid: "StatisticsIndexPage-commons-averages",
    comingSoon: true,
  },
  {
    title: "Dining Commons Averages Over Time",
    description: "Average review score for each dining commons by month.",
    to: "/statistics/commons/overtime",
    testid: "StatisticsIndexPage-commons-overtime",
    comingSoon: true,
  },
  {
    title: "Meal Averages by Dining Commons",
    description: "Average review score for each meal at a dining commons.",
    to: "/statistics/commons/meals",
    testid: "StatisticsIndexPage-commons-meals",
    comingSoon: true,
  },
];
