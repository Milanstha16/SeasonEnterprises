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

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import ContactPage from "./pages/Contact";
import AccountPage from "./pages/Account";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Shop from "./pages/Shop";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminNavbar from "./admin/AdminNavbar";

import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import PrivateAdminRoute from "./admin/PrivateAdminRoute";

import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { HelmetProvider } from "react-helmet-async";

import { useEffect } from "react";

const queryClient = new QueryClient();

// ✅ Updated AppWrapper with admin auto-logout logic
const AppWrapper = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdminRoute = location.pathname.startsWith("/admin");

  // ✅ Auto-logout admin when visiting user routes
  useEffect(() => {
    if (!isAdminRoute && user?.role === "admin") {
      logout();
    }
  }, [isAdminRoute, user, logout]);

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {isAdminRoute && user?.role === "admin" && <AdminNavbar />}
      <Outlet />
      {!isAdminRoute && <Footer />}
    </>
  );
};

// ✅ Routes definition
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppWrapper />,
      children: [
        { path: "/", element: <Index /> },
        { path: "product/:id", element: <ProductDetail /> },
        { path: "cart", element: <CartPage /> },
        { path: "checkout", element: <CheckoutPage /> },
        { path: "contact", element: <ContactPage /> },
        { path: "account", element: <AccountPage /> },
        { path: "signin", element: <Signin /> },
        { path: "signup", element: <Signup /> },
        { path: "shop", element: <Shop /> },

        { path: "adminlogin", element: <AdminLogin /> },
        {
          path: "admin",
          element: (
            <PrivateAdminRoute>
              <AdminDashboard />
            </PrivateAdminRoute>
          ),
        },

        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

// ✅ App entry point
const App = () => (
  <QueryClientProvider client={queryClient}>
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
