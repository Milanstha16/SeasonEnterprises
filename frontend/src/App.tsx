import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";

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

const queryClient = new QueryClient();

// Wrapper component for conditional Navbar/Footer rendering
const AppWrapper = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAdminLoggedIn = user?.role === "admin";

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {isAdminRoute && isAdminLoggedIn && <AdminNavbar />}

      {/* Render nested routes */}
      <Outlet />

      {!isAdminRoute && <Footer />}
    </>
  );
};

// Define routes array for createBrowserRouter
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
    // Enable future flags to silence warnings
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            {/* Use RouterProvider with created router */}
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
