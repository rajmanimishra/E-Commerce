import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layout & Static Pages
import Layout from "./components/Layout/Layout";
import Home from "./components/Home/Home";
import AboutUs from "./components/AboutUs/AboutUs";
import Processes from "./components/Processes/Processes";
import ContactUs from "./components/ContactUs/ContactUs";

// Products Catalog Pages
import Fruits from "./components/Fruits/Fruits";
import Dairy from "./components/Dairy/Dairy";
import SeaFood from "./components/SeaFood/SeaFood";
import AllProducts from "./components/AllProducts/AllProducts";

// Auth & Password Pages
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Customer Protected Pages
import Cart from "./components/Cart/Cart";
import Wishlist from "./components/Wishlist/Wishlist";
import Checkout from "./components/Checkout/Checkout";
import Orders from "./components/Orders/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./components/Profile/Profile";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/ProtectedRoute/AdminRoute";

// Context Providers
import { CartProvider } from "./components/CartContext/CartContext";
import { WishlistProvider } from "./components/CartContext/WishlistContext";

// ⚡ 1. Router को कंपोनेंट के बाहर रखें ताकि context री-रेंडर पर router री-क्रिएट न हो
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // =========================================
      // PUBLIC BROWSING (बिना लॉगिन के प्रोडक्ट्स देख सकें)
      // =========================================
      { index: true, element: <Home /> },
      { path: "fruits", element: <Fruits /> },
      { path: "dairy", element: <Dairy /> },
      { path: "seafood", element: <SeaFood /> },
      { path: "allproducts", element: <AllProducts /> },
      { path: "about", element: <AboutUs /> },
      { path: "processes", element: <Processes /> },
      { path: "contact", element: <ContactUs /> },

      // =========================================
      // CUSTOMER PROTECTED ROUTES (लॉगिन अनिवार्य)
      // =========================================
      {
        path: "cart",
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: "wishlist",
        element: (
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <ProtectedRoute>
            <OrderDetails />
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
    ],
  },

  // =========================================
  // AUTHENTICATION & RECOVERY (बिना Layout के Clean UI)
  // =========================================
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // =========================================
  // ADMIN ROUTES
  // =========================================
  { path: "/admin/login", element: <AdminLogin /> },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },

  // =========================================
  // 404 CATCH-ALL
  // =========================================
  {
    path: "*",
    element: (
      <div className="flex h-screen flex-col items-center justify-center bg-stone-50 text-center px-4">
        <h1 className="text-4xl font-extrabold text-stone-800">404</h1>
        <p className="mt-2 text-stone-600">Page not found.</p>
        <a
          href="/"
          className="mt-4 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
        >
          Return Home
        </a>
      </div>
    ),
  },
]);

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <RouterProvider router={router} />
      </WishlistProvider>
    </CartProvider>
  );
}