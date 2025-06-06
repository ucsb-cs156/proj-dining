import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { http, HttpResponse } from "msw";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import CreateReviewPage from "main/pages/ReviewsPage/CreateReviewsPage";

export default {
  title: "Pages/CreateReviewPage",
  component: CreateReviewPage,
  parameters: {
    msw: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 }),
      ),
      http.get("/api/systemInfo", () =>
        HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 }),
      ),
      http.post("/api/reviews/post", ({ request }) => {
        const url = new URL(request.url);

        const itemId = url.searchParams.get("itemId");
        const itemsStars = Number(url.searchParams.get("itemsStars"));
        const reviewerComments = url.searchParams.get("reviewerComments");
        const reviewerEmail = url.searchParams.get("reviewerEmail");

        return HttpResponse.json(
          {
            id: 123,
            item: {
              id: itemId,
              name: "🍕 Pizza",
            },
            reviewerEmail,
            itemsStars,
            reviewerComments,
          },
          { status: 200 },
        );
      }),
    ],
  },
  decorators: [
    (Story) => {
      const qc = new QueryClient();
      return (
        <QueryClientProvider client={qc}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

const Template = () => <CreateReviewPage />;

export const Default = Template.bind({});
Default.parameters = {
  reactRouter: {
    routePath: "/reviews/create",
    routeParams: { id: "42" }, // optional mock id if needed
  },
};
