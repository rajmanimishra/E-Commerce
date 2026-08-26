import React from "react";
import Home from "./components/Home/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Fruits from "./components/Fruits/Fruits";
import Dairy from "./components/Dairy/Dairy";
import SeaFood from "./components/SeaFood/SeaFood";
import AllProducts from "./components/AllProducts/AllProducts";
import Layout from "./components/Layout/Layout";
import AboutUs from "./components/AboutUs/AboutUs";
import Processes from "./components/Processes/Processes";
import ContactUs from "./components/ContactUs/ContactUs";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Profile from "./components/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {

  const router = createBrowserRouter([

    // =========================
    // PROTECTED APP ROUTES
    // =========================

    {
      path: "/",
      element: <Layout />,
      children: [

        {
          path: "/",
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },

        {
          path: "/fruits",
          element: (
            <ProtectedRoute>
              <Fruits />
            </ProtectedRoute>
          ),
        },

        {
          path: "/dairy",
          element: (
            <ProtectedRoute>
              <Dairy />
            </ProtectedRoute>
          ),
        },

        {
          path: "/seafood",
          element: (
            <ProtectedRoute>
              <SeaFood />
            </ProtectedRoute>
          ),
        },

        {
          path: "/allproducts",
          element: (
            <ProtectedRoute>
              <AllProducts />
            </ProtectedRoute>
          ),
        },

        {
          path: "/about",
          element: (
            <ProtectedRoute>
              <AboutUs />
            </ProtectedRoute>
          ),
        },

        {
          path: "/processes",
          element: (
            <ProtectedRoute>
              <Processes />
            </ProtectedRoute>
          ),
        },

        {
          path: "/contact",
          element: (
            <ProtectedRoute>
              <ContactUs />
            </ProtectedRoute>
          ),
        },

      ],
    },


    // =========================
    // LOGIN
    // =========================

    {
      path: "/login",
      element: <Login />,
    },


    // =========================
    // REGISTER
    // =========================

    {
      path: "/register",
      element: <Register />,
    },


    // =========================
    // PROFILE
    // =========================

    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },

  ]);

  return <RouterProvider router={router} />;
}

export default App;