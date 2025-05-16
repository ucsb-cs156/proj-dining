import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import PostReviewPage from "main/pages/Reviews/PostReviewPage";

const queryClient = new QueryClient();

describe("PostReviewPage tests", () => {
    test("renders without crashing", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <PostReviewPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        const title = screen.getByText(/Post a review for Menu Item/);
        expect(title).toBeInTheDocument();
        
        const comingSoon = screen.getByText("Coming Soon!");
        expect(comingSoon).toBeInTheDocument();
    });
});
