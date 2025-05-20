import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";

import PlaceholderIndexPage from "main/pages/Placeholder/PlaceholderIndexPage";
import PlaceholderCreatePage from "main/pages/Placeholder/PlaceholderCreatePage";
import PlaceholderEditPage from "main/pages/Placeholder/PlaceholderEditPage";

import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";

import MealTimesPage from "main/pages/Meal/MealTimesPage";

import Moderate from "main/pages/Moderate";

import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { data: currentUser } = useCurrentUser();

  const router = createBrowserRouter(
    [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      hasRole(currentUser, "ROLE_ADMIN") && {
        path: "admin/users",
        element: <AdminUsersPage />,
      },
      hasRole(currentUser, "ROLE_ADMIN") && {
        path: "moderate",
        element: <Moderate />,
      },
      hasRole(currentUser, "ROLE_USER") && {
        path: "myreviews",
        element: <MyReviewsIndexPage />,
      },
      hasRole(currentUser, "ROLE_USER") && {
        path: "placeholder",
        element: <PlaceholderIndexPage />,
      },
      hasRole(currentUser, "ROLE_ADMIN") && {
        path: "placeholder/create",
        element: <PlaceholderCreatePage />,
      },
      hasRole(currentUser, "ROLE_ADMIN") && {
        path: "placeholder/edit/:id",
        element: <PlaceholderEditPage />,
      },
      {
        path: "diningcommons/:date-time/:dining-commons-code",
        element: <MealTimesPage />,
      },
      {
        path: "diningcommons/:date-time/:dining-commons-code/:meal",
        element: <MenuItemPage />,
      },
    ].filter(Boolean),
  );

  return <RouterProvider router={router} />;
}

export default App;
