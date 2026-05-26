import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/Admin/AdminUsersPage";
import AdminsIndexPage from "main/pages/Admin/AdminsIndexPage";
import AdminsCreatePage from "main/pages/Admin/AdminsCreatePage";
import ModeratorsIndexPage from "main/pages/Admin/ModeratorsIndexPage";
import ModeratorsCreatePage from "main/pages/Admin/ModeratorsCreatePage";

import ReviewsPage from "main/pages/Reviews/ReviewsPage";

import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";
import PostReviewPage from "main/pages/Reviews/PostReviewPage";

import EditReviewPage from "main/pages/Reviews/EditReviewPage";

import MealTimesPage from "main/pages/Meal/MealTimesPage";

import ModerateReviews from "main/pages/ModerateReviewsPage";
import ModerateAliases from "main/pages/ModerateAliasesPage";

import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";

function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/admins" element={<AdminsIndexPage />} />
            <Route path="/admin/admins/create" element={<AdminsCreatePage />} />
            <Route path="/admin/moderators" element={<ModeratorsIndexPage />} />
            <Route
              path="/admin/moderators/create"
              element={<ModeratorsCreatePage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route path="/myreviews" element={<MyReviewsIndexPage />} />
            <Route path="/reviews/post/:id" element={<PostReviewPage />} />

            <Route path="/reviews/edit/:id" element={<EditReviewPage />} />

            <Route path="/reviews/:itemid" element={<ReviewsPage />} />
          </>
        )}
        {(hasRole(currentUser, "ROLE_ADMIN") ||
          hasRole(currentUser, "ROLE_MODERATOR")) && (
          <>
            <Route path="/moderate" element={<ModerateReviews />} />
            <Route path="/moderate/aliases" element={<ModerateAliases />} />
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
