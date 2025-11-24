import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";

import ReviewsPage from "main/pages/Reviews/ReviewsPage";

import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";
import PostReviewPage from "main/pages/Reviews/PostReviewPage";

import EditReviewPage from "main/pages/Reviews/EditReviewPage";

import MealTimesPage from "main/pages/Meal/MealTimesPage";

import ModerateMenuPage from "main/pages/ModerateMenuPage";
import ModerateReviewsPage from "main/pages/ModerateReviewsPage";

import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";

function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/profile" element={<ProfilePage />} />
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <Route exact path="/admin/users" element={<AdminUsersPage />} />
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route exact path="/myreviews" element={<MyReviewsIndexPage />} />
            <Route
              exact
              path="/reviews/post/:id"
              element={<PostReviewPage />}
            />

            <Route
              exact
              path="/reviews/edit/:id"
              element={<EditReviewPage />}
            />

            <Route exact path="/reviews/:itemid" element={<ReviewsPage />} />
          </>
        )}
        {(hasRole(currentUser, "ROLE_ADMIN") ||
          hasRole(currentUser, "ROLE_MODERATOR")) && (
          <>
            <Route exact path="/moderate" element={<ModerateMenuPage />} />
            <Route
              exact
              path="/moderate/reviews"
              element={<ModerateReviewsPage />}
            />
          </>
        )}
        <>
          <Route
            exact
            path="/diningcommons/:date-time/:dining-commons-code"
            element={<MealTimesPage />}
          />
        </>
        <>
          <Route
            exact
            path="/diningcommons/:date-time/:dining-commons-code/:meal"
            element={<MenuItemPage />}
          />
        </>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
