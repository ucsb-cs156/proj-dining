import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";

import ReviewsPage from "main/pages/Reviews/ReviewsPage";

import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";
import PostReviewPage from "main/pages/Reviews/PostReviewPage";

import EditReviewPage from "main/pages/Reviews/EditReviewPage";

import MealTimesPage from "main/pages/Meal/MealTimesPage";

import ModerateReviews from "main/pages/ModerateReviewsPage";
import ModerateAliases from "main/pages/ModerateAliasesPage";

import AdminsCreatePage from "main/pages/Admin/AdminsCreatePage";
import AdminsIndexPage from "main/pages/Admin/AdminsIndexPage";
import ModeratorsCreatePage from "main/pages/Admin/ModeratorsCreatePage";
import ModeratorsIndexPage from "main/pages/Admin/ModeratorsIndexPage";

import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";

function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/profile" element={<ProfilePage />} />
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route exact path="/admin/users" element={<AdminUsersPage />} />
            <Route exact path="/admin/admins/" element={<AdminsIndexPage />} />
            <Route
              exact
              path="/admin/admins/create"
              element={<AdminsCreatePage />}
            />
            <Route
              exact
              path="/admin/moderators"
              element={<ModeratorsIndexPage />}
            />
            <Route
              exact
              path="/admin/moderators/create"
              element={<ModeratorsCreatePage />}
            />
          </>
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
            <Route exact path="/moderate" element={<ModerateReviews />} />
            <Route
              exact
              path="/moderate/aliases"
              element={<ModerateAliases />}
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
