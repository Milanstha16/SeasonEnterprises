// frontend/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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
import AdminNavbar from "./admin/AdminNavbar"; // Create a separate admin navbar

import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import PrivateAdminRoute from "./admin/PrivateAdminRoute";

import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

// Wrapper component to handle conditional navbar/footer
const AppWrapper = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAdminLoggedIn = user?.role === "admin";

  return (
    <>
      {/* Navbar */}
      {!isAdminRoute && <Navbar />}
      {isAdminRoute && isAdminLoggedIn && <AdminNavbar />}

      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/shop" element={<Shop />} />

        {/* Admin Routes */}
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <PrivateAdminRoute>
              <AdminDashboard />
            </PrivateAdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer */}
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppWrapper />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
