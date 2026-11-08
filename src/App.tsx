import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../layout/Layout";
import Signup from "./components/signup/Signup";
import Home from "./pages/Home";
import { Toast } from "@heroui/react";
import AuthContext from "../context/AuthContext";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "../protectedRoute/ProtectedRoute";
import Search from "./pages/Search";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostInfo from "./pages/PostInfo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "home",
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },
        {
          path: "/",
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },
        {
          path: "notifications",
          element: (
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          ),
        },
        {
          path: "search",
          element: (
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          ),
        },
        { path: "auth", element: <Signup /> },
        {
          path: "/postInfo/:id",
          element: (
            <ProtectedRoute>
              <PostInfo />
            </ProtectedRoute>
          ),
        },
        {
          path: "*",
          element: <NotFound/>
        }
      ],
    },
  ]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthContext>
          <Toast.Provider placement="top" />
          <RouterProvider router={router} />
        </AuthContext>
      </QueryClientProvider>
    </>
  );
}
