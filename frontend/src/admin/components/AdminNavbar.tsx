import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import {
  FaUserShield,
  FaBoxOpen,
  FaTachometerAlt,
  FaUsers,
  FaShoppingCart,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/admin/products", label: "Products", icon: <FaBoxOpen /> },
    { to: "/admin/users", label: "Users", icon: <FaUsers /> },
    { to: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
    { to: "/admin/contact", label: "Contact", icon: <FaUserCircle /> },
  ];

  const activeClass = "text-indigo-300 font-bold border-b-2 border-indigo-300";

  return (
    <nav className="bg-indigo-700 text-white shadow-md z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <FaUserShield className="text-3xl text-white" />
          <span className="text-2xl font-bold select-none">Admin Panel</span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center md:gap-8">
          {navLinks.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-2 hover:text-indigo-300 transition-colors ${
                    isActive ? activeClass : ""
                  }`
                }
              >
                {icon} {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Mobile Dropdown Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="p-2">
                  <FaBars />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="end">
                {navLinks.map(({ to, label }) => (
                  <NavLink key={to} to={to}>
                    <DropdownMenuItem>{label}</DropdownMenuItem>
                  </NavLink>
                ))}
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Info (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <FaUserCircle className="text-2xl" />
            <span className="font-medium max-w-[120px] truncate">
              {user?.name || "Admin"}
            </span>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-white hover:text-red-300 transition"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
