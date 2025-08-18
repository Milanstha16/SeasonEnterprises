import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login"); // redirect to admin login
  };

  return (
    <nav className="bg-indigo-700 text-white p-4 flex justify-between items-center">
      <h1 className="font-bold text-xl">Admin Panel</h1>
      <div className="flex gap-4">
        <Link to="/admin" className="hover:text-gray-300">
          Dashboard
        </Link>
        <Link to="/admin/products" className="hover:text-gray-300">
          Products
        </Link>
        <span>{user?.name}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
