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
import Orders from "./components/Orders/Orders";
import OrderDetails from "./pages/OrderDetails";

function App() {

  const router = createBrowserRouter([

    // =========================================
    // PROTECTED APP
    // =========================================

    {
      path: "/",

      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),

      children: [

        // HOME
        {
          index: true,
          element: <Home />,
        },

        // FRUITS
        {
          path: "fruits",
          element: <Fruits />,
        },

        // DAIRY
        {
          path: "dairy",
          element: <Dairy />,
        },

        // SEAFOOD
        {
          path: "seafood",
          element: <SeaFood />,
        },

        // ALL PRODUCTS
        {
          path: "allproducts",
          element: <AllProducts />,
        },

        // ABOUT
        {
          path: "about",
          element: <AboutUs />,
        },

        // PROCESSES
        {
          path: "processes",
          element: <Processes />,
        },

        // CONTACT
        {
          path: "contact",
          element: <ContactUs />,
        },

        // CART
        {
          path: "cart",
          element: <Cart />,
        },

        // WISHLIST
        {
          path: "wishlist",
          element: <Wishlist />,
        },

        // CHECKOUT
        {
          path: "checkout",
          element: <Checkout />,
        },
        // ORDERS
        {
          path: "orders",
          element: <Orders />,
        },

        // ORDER DETAILS
        {
          path: "orders/:id",
          element: <OrderDetails />,
        },

      ],
    },


    // =========================================
    // PUBLIC ROUTES
    // =========================================

    {
      path: "/login",
      element: <Login />,
    },

    {
      path: "/register",
      element: <Register />,
    },


    // =========================================
    // PROFILE - PROTECTED
    // =========================================

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