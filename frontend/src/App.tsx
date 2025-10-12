import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Index from "./components/pages/Index";
import NotFound from "./components/pages/NotFound";
import CartPage from "./components/pages/Cart";
import CheckoutPage from "./components/pages/Checkout";
import CheckoutSuccess from "./components/pages/CheckoutSuccess";
import ContactPage from "./components/pages/Contact";
import AccountPage from "./components/pages/Account";
import Signin from "./components/pages/Signin";
import Signup from "./components/pages/Signup";
import Shop from "./components/pages/Shop";

import AdminLogin from "./admin/auth/AdminLogin";
import PrivateAdminRoute from "./admin/components/PrivateAdminRoute";
import AdminNavbar from "./admin/components/AdminNavbar";
import AdminDashboard from "./admin/components/AdminDashboard";
import AdminContact from "./admin/components/AdminContact";

import ProductsList from "./admin/Products/ProductsList";
import ProductForm from "./admin/Products/ProductForm";
import ProductDetails from "./admin/Products/ProductDetails";

import UsersList from "./admin/Users/UsersList";
import UserDetails from "./admin/Users/UserDetails";

import OrdersList from "./admin/Orders/OrdersList";
import OrderDetails from "./admin/Orders/OrderDetails";
import OrderStatusUpdate from "./admin/Orders/OrderStatusUpdate";

import { CartProvider } from "@/components/context/CartContext";
import { AuthProvider, useAuth } from "@/components/context/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// ✅ Public Layout (Navbar + Footer)
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

// ✅ Admin Layout (AdminNavbar for logged-in admins)
const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <>
      {user?.role === "admin" && <AdminNavbar />}
      <div className="min-h-screen bg-muted/20 p-4 md:p-6">
        <Outlet />
      </div>
    </>
  );
};

// ✅ AppWrapper: Clears admin session if accessing public pages
const AppWrapper = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!isAdminRoute && user?.role === "admin") {
      logout();
    }
  }, [isAdminRoute, user, logout]);

  return <Outlet />;
};

// ✅ Define routes
const router = createBrowserRouter(
  [
    {
      element: <AppWrapper />,
      children: [
        {
          path: "/",
          element: <PublicLayout />,
          children: [
            { index: true, element: <Index /> },
            { path: "cart", element: <CartPage /> },
            
            // ✅ Wrap CheckoutPage with Elements provider
            {
              path: "checkout",
              element: (
                <Elements stripe={loadStripe("pk_test_51SH7TZCnCfQ1XzuSdNaOj13gAjPfFpGS577x52P92cIIsPdUBfhQ1wWWxFQNOz9iYP7jHxAp6J26tXCAFVP03GTl00y4IT7nJ6")}>
                  <CheckoutPage />
                </Elements>
              ),
            },

            { path: "checkoutsuccess", element: <CheckoutSuccess /> },
            { path: "contact", element: <ContactPage /> },
            { path: "account", element: <AccountPage /> },
            { path: "signin", element: <Signin /> },
            { path: "signup", element: <Signup /> },
            { path: "shop", element: <Shop /> },
          ],
        },

        // ✅ Admin login (no layout)
        {
          path: "/adminlogin",
          element: <AdminLogin />,
        },

        // ✅ Admin protected routes
        {
          path: "/admin",
          element: (
            <PrivateAdminRoute>
              <AdminLayout />
            </PrivateAdminRoute>
          ),
          children: [
            { index: true, element: <AdminDashboard /> },
            { path: "products", element: <ProductsList /> },
            { path: "products/new", element: <ProductForm /> },
            { path: "products/:id", element: <ProductDetails /> },
            { path: "users", element: <UsersList /> },
            { path: "contact", element: <AdminContact /> },
            { path: "users/:id", element: <UserDetails /> },
            { path: "orders", element: <OrdersList /> },
            { path: "orders/:id", element: <OrderDetails /> },
            { path: "orders/:id/update", element: <OrderStatusUpdate /> },
          ],
        },

        // ✅ Catch all
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

// ✅ App Entry
const App = () => (
  <QueryClientProvider client={new QueryClient()}>
    <TooltipProvider>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <RouterProvider
              router={router}
              future={{ v7_startTransition: true }}
            />
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
