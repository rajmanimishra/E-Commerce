import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { CartProvider } from "./components/CartContext/CartContext";
import { WishlistProvider } from "./components/CartContext/WishlistContext";
import AdminRoute from "./components/ProtectedRoute/AdminRoute";

const Home = lazy(() => import("./components/Home/Home"));
const Fruits = lazy(() => import("./components/Fruits/Fruits"));
const Dairy = lazy(() => import("./components/Dairy/Dairy"));
const SeaFood = lazy(() => import("./components/SeaFood/SeaFood"));
const AllProducts = lazy(() => import("./components/AllProducts/AllProducts"));
const AboutUs = lazy(() => import("./components/AboutUs/AboutUs"));
const Processes = lazy(() => import("./components/Processes/Processes"));
const ContactUs = lazy(() => import("./components/ContactUs/ContactUs"));
const Cart = lazy(() => import("./components/Cart/Cart"));
const Wishlist = lazy(() => import("./components/Wishlist/Wishlist"));
const Checkout = lazy(() => import("./components/Checkout/Checkout"));
const Orders = lazy(() => import("./components/Orders/Orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Login = lazy(() => import("./components/Login/Login"));
const Register = lazy(() => import("./components/Register/Register"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./components/Profile/Profile"));

function lazyPage(Component) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-gray-500" role="status">
          Loading page...
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}

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
          element: lazyPage(Home),
        },

        // FRUITS
        {
          path: "fruits",
          element: lazyPage(Fruits),
        },

        // DAIRY
        {
          path: "dairy",
          element: lazyPage(Dairy),
        },

        // SEAFOOD
        {
          path: "seafood",
          element: lazyPage(SeaFood),
        },

        // ALL PRODUCTS
        {
          path: "allproducts",
          element: lazyPage(AllProducts),
        },

        // ABOUT
        {
          path: "about",
          element: lazyPage(AboutUs),
        },

        // PROCESSES
        {
          path: "processes",
          element: lazyPage(Processes),
        },

        // CONTACT
        {
          path: "contact",
          element: lazyPage(ContactUs),
        },

        // CART
        {
          path: "cart",
          element: lazyPage(Cart),
        },

        // WISHLIST
        {
          path: "wishlist",
          element: lazyPage(Wishlist),
        },

        // CHECKOUT
        {
          path: "checkout",
          element: lazyPage(Checkout),
        },
        // ORDERS
        {
          path: "orders",
          element: lazyPage(Orders),
        },

        // ORDER DETAILS
        {
          path: "orders/:id",
          element: lazyPage(OrderDetails),
        },

      ],
    },


    // =========================================
    // PUBLIC ROUTES
    // =========================================

    {
      path: "/login",
      element: lazyPage(Login),
    },

    {
      path: "/register",
      element: lazyPage(Register),
    },

    {
      path: "/admin/login",
      element: lazyPage(AdminLogin),
    },

    {
      path: "/forgot-password",
      element: lazyPage(ForgotPassword),
    },

    {
      path: "/reset-password",
      element: lazyPage(ResetPassword),
    },

    {
      path: "/admin",
      element: (
        <AdminRoute>
          {lazyPage(AdminDashboard)}
        </AdminRoute>
      ),
    },


    // =========================================
    // PROFILE - PROTECTED
    // =========================================

    {
      path: "/profile",

      element: (
        <ProtectedRoute>
          {lazyPage(Profile)}
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