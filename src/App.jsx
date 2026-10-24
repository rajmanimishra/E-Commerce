import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";

// Layout & Route Guards
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/ProtectedRoute/AdminRoute";

// Context Providers
import { CartProvider } from "./components/CartContext/CartContext";
import { WishlistProvider } from "./components/CartContext/WishlistContext";

// Lazy-loaded Components (बेहतर परफॉरमेंस और फ़ास्ट लोडिंग के लिए)
const Home = lazy(() => import("./components/Home/Home"));
const Fruits = lazy(() => import("./components/Fruits/Fruits"));
const Dairy = lazy(() => import("./components/Dairy/Dairy"));
const SeaFood = lazy(() => import("./components/SeaFood/SeaFood"));
const AllProducts = lazy(() => import("./components/AllProducts/AllProducts"));
const AboutUs = lazy(() => import("./components/AboutUs/AboutUs"));
const Processes = lazy(() => import("./components/Processes/Processes"));
const ContactUs = lazy(() => import("./components/ContactUs/ContactUs"));

const Login = lazy(() => import("./components/Login/Login"));
const Register = lazy(() => import("./components/Register/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const Cart = lazy(() => import("./components/Cart/Cart"));
const Wishlist = lazy(() => import("./components/Wishlist/Wishlist"));
const Checkout = lazy(() => import("./components/Checkout/Checkout"));
const Orders = lazy(() => import("./components/Orders/Orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Profile = lazy(() => import("./components/Profile/Profile"));

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Suspense Loader Wrapper
const lazyPage = (Component) => (
  <Suspense
    fallback={
      <div className="flex h-[60vh] items-center justify-center text-stone-500 font-medium">
        Loading...
      </div>
    }
  >
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // =========================================
      // PUBLIC BROWSING (Layout के साथ)
      // =========================================
      { index: true, element: lazyPage(Home) },
      { path: "fruits", element: lazyPage(Fruits) },
      { path: "dairy", element: lazyPage(Dairy) },
      { path: "seafood", element: lazyPage(SeaFood) },
      { path: "allproducts", element: lazyPage(AllProducts) },
      { path: "about", element: lazyPage(AboutUs) },
      { path: "processes", element: lazyPage(Processes) },
      { path: "contact", element: lazyPage(ContactUs) },

      // =========================================
      // CUSTOMER PROTECTED ROUTES (Layout + Login अनिवार्य)
      // =========================================
      {
        path: "cart",
        element: (
          <ProtectedRoute>
            {lazyPage(Cart)}
          </ProtectedRoute>
        ),
      },
      {
        path: "wishlist",
        element: (
          <ProtectedRoute>
            {lazyPage(Wishlist)}
          </ProtectedRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            {lazyPage(Checkout)}
          </ProtectedRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            {lazyPage(Orders)}
          </ProtectedRoute>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <ProtectedRoute>
            {lazyPage(OrderDetails)}
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            {lazyPage(Profile)}
          </ProtectedRoute>
        ),
      },
    ],
  },

  // =========================================
  // AUTHENTICATION & RECOVERY (बिना Layout के Clean UI)
  // =========================================
  { path: "/login", element: lazyPage(Login) },
  { path: "/register", element: lazyPage(Register) },
  { path: "/forgot-password", element: lazyPage(ForgotPassword) },
  { path: "/reset-password", element: lazyPage(ResetPassword) },

  // =========================================
  // ADMIN ROUTES
  // =========================================
  { path: "/admin/login", element: lazyPage(AdminLogin) },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        {lazyPage(AdminDashboard)}
      </AdminRoute>
    ),
  },

  // =========================================
  // 404 CATCH-ALL
  // =========================================
  {
    path: "*",
    element: (
      <div className="flex h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <h1 className="text-4xl font-extrabold text-stone-800">404</h1>
        <p className="mt-2 text-stone-600">Page not found.</p>
        <Link
          to="/"
          className="mt-4 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
        >
          Return Home
        </Link>
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