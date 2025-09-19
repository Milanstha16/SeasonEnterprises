import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FaUserShield, FaBoxOpen, FaTachometerAlt, FaSignOutAlt } from "react-icons/fa";

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/adminlogin");
  };

  return (
    <nav className="bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
      {/* Logo / Title */}
      <div className="flex items-center gap-2 text-white font-bold text-xl">
        <FaUserShield className="text-2xl" />
        <span>Admin Panel</span>
      </div>

      {/* Navigation Links */}
      <ul className="flex items-center gap-6">
        <li>
          <Link to="/admin" className="flex items-center gap-1 font-medium">
            <FaTachometerAlt /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin/products" className="flex items-center gap-1 font-medium">
            <FaBoxOpen /> Products
          </Link>
        </li>
        <li className="px-3 py-1 rounded bg-indigo-600 font-semibold">{user?.name}</li>
        <li>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-500 px-3 py-1 rounded text-white font-semibold"
          >
            <FaSignOutAlt /> Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
