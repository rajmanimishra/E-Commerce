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

// Cart
import Cart from "./components/Cart/Cart";

// Wishlist
import Wishlist from "./components/Wishlist/Wishlist";

// Checkout
import Checkout from "./components/Checkout/Checkout";

// Cart Context
import { CartProvider } from "./components/CartContext/CartContext";

// Wishlist Context
import { WishlistProvider } from "./components/CartContext/WishlistContext";


function App() {

  const router = createBrowserRouter([

    // =========================
    // PROTECTED APP ROUTES
    // =========================

    {
      path: "/",
      element: <Layout />,

      children: [

        // =========================
        // HOME
        // =========================

        {
          path: "/",
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },


        // =========================
        // FRUITS
        // =========================

        {
          path: "/fruits",
          element: (
            <ProtectedRoute>
              <Fruits />
            </ProtectedRoute>
          ),
        },


        // =========================
        // DAIRY
        // =========================

        {
          path: "/dairy",
          element: (
            <ProtectedRoute>
              <Dairy />
            </ProtectedRoute>
          ),
        },


        // =========================
        // SEAFOOD
        // =========================

        {
          path: "/seafood",
          element: (
            <ProtectedRoute>
              <SeaFood />
            </ProtectedRoute>
          ),
        },


        // =========================
        // ALL PRODUCTS
        // =========================

        {
          path: "/allproducts",
          element: (
            <ProtectedRoute>
              <AllProducts />
            </ProtectedRoute>
          ),
        },


        // =========================
        // ABOUT
        // =========================

        {
          path: "/about",
          element: (
            <ProtectedRoute>
              <AboutUs />
            </ProtectedRoute>
          ),
        },


        // =========================
        // PROCESSES
        // =========================

        {
          path: "/processes",
          element: (
            <ProtectedRoute>
              <Processes />
            </ProtectedRoute>
          ),
        },


        // =========================
        // CONTACT
        // =========================

        {
          path: "/contact",
          element: (
            <ProtectedRoute>
              <ContactUs />
            </ProtectedRoute>
          ),
        },


        // =========================
        // CART
        // =========================

        {
          path: "/cart",
          element: (
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          ),
        },


        // =========================
        // WISHLIST
        // =========================

        {
          path: "/wishlist",
          element: (
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          ),
        },


        // =========================
        // CHECKOUT
        // =========================

        {
          path: "/checkout",
          element: (
            <ProtectedRoute>
              <Checkout />
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


  return (
    <CartProvider>

      <WishlistProvider>

        <RouterProvider router={router} />

      </WishlistProvider>

    </CartProvider>
  );
}


export default App;