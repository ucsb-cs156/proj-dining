import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import App from "../App";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockCurrentUser = vi.hoisted(() => ({
  value: null,
}));

vi.mock("main/utils/currentUser", async () => {
  const actual = await vi.importActual("main/utils/currentUser");
  return {
    ...actual,
    useCurrentUser: () => ({ data: mockCurrentUser.value }),
  };
});

vi.mock("main/pages/HomePage", () => ({
  default: () => <div>Home Page</div>,
}));

vi.mock("main/pages/ProfilePage", () => ({
  default: () => <div>Profile Page</div>,
}));

vi.mock("main/pages/AdminUsersPage", () => ({
  default: () => <div>Admin Users Page</div>,
}));

vi.mock("main/pages/Reviews/ReviewsPage", () => ({
  default: () => <div>Reviews Page</div>,
}));

vi.mock("main/pages/MyReviews/MyReviewsIndexPage", () => ({
  default: () => <div>My Reviews Page</div>,
}));

vi.mock("main/pages/Reviews/PostReviewPage", () => ({
  default: () => <div>Post Review Page</div>,
}));

vi.mock("main/pages/Reviews/EditReviewPage", () => ({
  default: () => <div>Edit Review Page</div>,
}));

vi.mock("main/pages/Meal/MealTimesPage", () => ({
  default: () => <div>Meal Times Page</div>,
}));

vi.mock("main/pages/ModerateReviewsPage", () => ({
  default: () => <div>Moderation Page</div>,
}));

vi.mock("main/pages/ModerateAliasesPage", () => ({
  default: () => <div>Moderate Aliases Page</div>,
}));

vi.mock("main/pages/MenuItem/MenuItemPage", () => ({
  default: () => <div>Menu Item Page</div>,
}));

describe("App tests", () => {
  beforeEach(() => {
    mockCurrentUser.value = currentUserFixtures.notLoggedIn;
    window.history.pushState({}, "", "/");
  });

  test("renders the home page at root", () => {
    render(<App />);
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  test("renders admin users page for admin users", () => {
    mockCurrentUser.value = currentUserFixtures.adminUser;
    window.history.pushState({}, "", "/admin/users");
    render(<App />);
    expect(screen.getByText("Admin Users Page")).toBeInTheDocument();
  });

  test("does not render admin users page for regular users", () => {
    mockCurrentUser.value = currentUserFixtures.userOnly;
    window.history.pushState({}, "", "/admin/users");
    render(<App />);
    expect(screen.queryByText("Admin Users Page")).not.toBeInTheDocument();
  });

  test("renders user review routes for regular users", () => {
    mockCurrentUser.value = currentUserFixtures.userOnly;
    window.history.pushState({}, "", "/myreviews");
    render(<App />);
    expect(screen.getByText("My Reviews Page")).toBeInTheDocument();
  });

  test("renders moderation page for moderators", () => {
    mockCurrentUser.value = currentUserFixtures.moderatorUser;
    window.history.pushState({}, "", "/moderation");
    render(<App />);
    expect(screen.getByText("Moderation Page")).toBeInTheDocument();
  });

  test("renders legacy moderation routes for moderators", () => {
    mockCurrentUser.value = currentUserFixtures.moderatorUser;
    window.history.pushState({}, "", "/moderate/aliases");
    render(<App />);
    expect(screen.getByText("Moderate Aliases Page")).toBeInTheDocument();
  });

  test("does not render moderation page for regular users", () => {
    mockCurrentUser.value = currentUserFixtures.userOnly;
    window.history.pushState({}, "", "/moderation");
    render(<App />);
    expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument();
  });
});
