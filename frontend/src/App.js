import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";

import PlaceholderIndexPage from "main/pages/Placeholder/PlaceholderIndexPage";

import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";
import ReviewsCreatePage from "main/pages/Reviews/ReviewsCreatePage";
import ReviewEditPage from "main/pages/MyReviews/ReviewEditPage";
import ReviewsForMenuItemPage from "main/pages/Reviews/ReviewsForMenuItemPage";

import MealTimesPage from "main/pages/Meal/MealTimesPage";

import ModeratePage from "main/pages/ModeratePage";

import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/profile" element={<ProfilePage />} />

        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/moderate" element={<ModeratePage />} />
            <Route
              exact
              path="/myreviews/edit/:id"
              element={<ReviewEditPage />}
            />
            <Route
              exact
              path="/reviews/post/:id"
              element={<ReviewsCreatePage />}
            />
          </>
        )}

        {(hasRole(currentUser, "ROLE_ADMIN") ||
          hasRole(currentUser, "ROLE_MODERATOR")) && (
          <Route exact path="/moderate" element={<ModeratePage />} />
        )}

        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route path="/myreviews" element={<MyReviewsIndexPage />} />
            <Route path="/reviews/post/:id" element={<ReviewsCreatePage />} />
            <Route
              exact
              path="/myreviews/edit/:id"
              element={<ReviewEditPage />}
            />
            <Route path="/placeholder" element={<PlaceholderIndexPage />} />
          </>
        )}
        <Route
          path="/diningcommons/:date-time/:dining-commons-code"
          element={<MealTimesPage />}
        />
        <Route
          path="/diningcommons/:date-time/:dining-commons-code/:meal"
          element={<MenuItemPage />}
        />

        <Route exact path="/reviews/:id" element={<ReviewsForMenuItemPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
