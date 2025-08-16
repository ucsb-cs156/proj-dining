import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";

import PlaceholderIndexPage from "main/pages/Placeholder/PlaceholderIndexPage";

import ReviewsPage from "main/pages/Reviews/ReviewsPage";

import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";
import PostReviewPage from "main/pages/Reviews/PostReviewPage";

import EditReviewPage from "main/pages/Reviews/EditReviewPage";

import MealTimesPage from "main/pages/Meal/MealTimesPage";

import Moderate from "main/pages/ModeratePage";

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
          <Route exact path="/moderate" element={<Moderate />} />
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route
              exact
              path="/placeholder"
              element={<PlaceholderIndexPage />}
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
