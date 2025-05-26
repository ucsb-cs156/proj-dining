import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { http, HttpResponse } from "msw";

import CreateReviewPage from "main/pages/ReviewsPage/CreateReviewsPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

export default {
  title: "Pages/CreateReviewPage/WithId", // 👈 this becomes pages-createreviewpage-withid
  component: CreateReviewPage,
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
  parameters: {
    msw: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.userOnly),
      ),
      http.get("/api/systemInfo", () =>
        HttpResponse.json(systemInfoFixtures.showingNeither),
      ),
      http.get("/api/diningcommons/menuitem", (req) => {
        const id = req.url.searchParams.get("id");
        return HttpResponse.json({
          id,
          name: "🍕 Pizza",
        });
      }),
      http.post("/api/reviews/post", ({ request }) => {
        const url = new URL(request.url);
        return HttpResponse.json({
          id: 123,
          item: {
            id: url.searchParams.get("itemId"),
            name: "🍕 Pizza",
          },
          reviewerEmail: url.searchParams.get("reviewerEmail"),
          itemsStars: Number(url.searchParams.get("itemsStars")),
          reviewerComments: url.searchParams.get("reviewerComments"),
        });
      }),
    ],
  },
};

const Template = (args) => <CreateReviewPage {...args} />;

// ✅ Properly bound named export
export const WithId = Template.bind({});
WithId.args = {
  id: "42", // 👈 passed directly as a prop
};
