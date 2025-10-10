import React, { useState, useRef, useEffect } from "react";
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

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        // Nothing to toggle here anymore since the dropdown was removed
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/admin/products", label: "Products", icon: <FaBoxOpen /> },
    { to: "/admin/users", label: "Users", icon: <FaUsers /> },
    { to: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
    { to: "/admin/contact", label: "Contact", icon: <FaUserCircle /> },
  ];

  const activeClass =
    "text-indigo-300 font-bold border-b-2 border-indigo-300";

  return (
    <nav className="bg-indigo-700 text-white shadow-md z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <FaUserShield className="text-3xl text-white" />
          <span className="text-2xl font-bold select-none">Admin Panel</span>
        </div>

        {/* Hamburger */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-2xl"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation */}
        <ul
          className={`flex-col md:flex-row md:flex items-center md:gap-8 absolute md:static top-full left-0 w-full md:w-auto bg-indigo-700 transition-all duration-300 ease-in-out md:transition-none overflow-hidden md:overflow-visible ${
            menuOpen ? "flex" : "hidden md:flex"
          }`}
        >
          {navLinks.map(({ to, label, icon }) => (
            <li
              key={to}
              className="md:py-0 py-2 border-b border-white/10 md:border-none px-4 md:px-0"
            >
              <NavLink
                to={to}
                end={to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-2 hover:text-indigo-300 transition-colors ${
                    isActive ? activeClass : ""
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-lg">{icon}</span> {label}
              </NavLink>
            </li>
          ))}

          {/* User Info + Logout */}
          <div className="flex items-center gap-2 px-4 md:px-0 py-2 md:py-0">
            <FaUserCircle className="text-2xl" />
            <span className="hidden md:inline font-medium max-w-[120px] truncate">
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
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
