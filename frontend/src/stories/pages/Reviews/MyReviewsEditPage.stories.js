import React from "react";
import { http, HttpResponse } from "msw";
import ReviewEditPage from "main/pages/MyReviews/ReviewEditPage";
import { reactRouterParameters } from "storybook-addon-remix-react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";

const review = ReviewFixtures.threeReviews[0];
const reviewId = String(review.id);

export default {
  title: "pages/Reviews/MyReviewsEditPage",
  component: ReviewEditPage,
  parameters: {
    msw: [
      http.get("/api/reviews/get", ({ request }) => {
        const url = new URL(request.url);
        console.log(
          "Storybook GET /api/reviews/get",
          url.searchParams.get("id"),
        );
        return HttpResponse.json(review, { status: 200 });
      }),
      http.put("/api/reviews/reviewer", () => {
        return HttpResponse.json({}, { status: 200 });
      }),
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.userOnly);
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither);
      }),
    ],
    reactRouter: reactRouterParameters({
      location: { pathname: `/myreviews/edit/${reviewId}` },
      path: "/myreviews/edit/:id",
      params: { id: reviewId },
    }),
  },
};

const Template = (args) => <ReviewEditPage {...args} />;

export const Default = Template.bind({});
Default.args = {
  suppressMemoryRouter: true,
};
