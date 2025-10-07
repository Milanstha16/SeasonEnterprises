import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FaUserShield, FaBoxOpen, FaTachometerAlt, FaSignOutAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button"; // If you want to use your Button component

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/adminlogin");
  };

  return (
    <nav className="bg-primary text-white p-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-between">
      {/* Left side - Logo / Title */}
      <div className="flex items-center gap-3 mb-3 md:mb-0">
        <FaUserShield className="text-3xl" />
        <span className="font-bold text-2xl select-none">Admin Panel</span>
      </div>

      {/* Right side - Navigation */}
      <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <li>
          <Link
            to="/admin"
            className="flex items-center gap-2 text-white font-semibold hover:text-secondary transition-colors"
          >
            <FaTachometerAlt className="text-lg" /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/admin/products"
            className="flex items-center gap-2 text-white font-semibold hover:text-secondary transition-colors"
          >
            <FaBoxOpen className="text-lg" /> Products
          </Link>
        </li>
        <li className="px-4 py-1 rounded  font-semibold select-none max-w-xs truncate">
          {user?.name || "Admin"}
        </li>
        <li>
          {/* Using Button component for consistent styling, fallback to button if unavailable */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <FaSignOutAlt /> Logout
          </Button>
          {/* If you want to use plain button instead, comment above and uncomment below:
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 px-4 py-1 rounded hover:bg-red-700 transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
          */}
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
