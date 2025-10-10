import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import {
  FaUserShield,
  FaBoxOpen,
  FaTachometerAlt,
  FaUsers,
  FaShoppingCart,
  FaTags,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLLIElement>(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleProfileMenu = () => setProfileMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close profile dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/admin/products", label: "Products", icon: <FaBoxOpen /> },
    { to: "/admin/users", label: "Users", icon: <FaUsers /> },
    { to: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
    { to: "/admin/settings", label: "Settings", icon: <FaCog /> },
  ];

  const activeClass =
    "text-secondary font-semibold border-b-2 border-secondary";

  return (
    <nav className="bg-primary text-white shadow-md z-50">
      <div className="max-w-screen-xl mx-auto px-4 md:flex md:items-center md:justify-between">
        {/* Logo & Hamburger */}
        <div className="flex items-center justify-between py-4 md:py-3">
          <div className="flex items-center gap-3">
            <FaUserShield className="text-3xl" />
            <span className="font-bold text-2xl select-none">Admin Panel</span>
          </div>
          <button
            onClick={toggleMenu}
            className="md:hidden text-white text-2xl focus:outline-none"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation Links */}
        <ul
          className={`flex flex-col md:flex-row md:items-center md:gap-8 transition-all md:transition-none duration-300 ease-in-out overflow-hidden md:overflow-visible ${
            menuOpen ? "max-h-screen" : "max-h-0"
          } md:max-h-full`}
        >
          {navLinks.map(({ to, label, icon }) => (
            <li key={to} className="py-2 md:py-0">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 hover:text-secondary transition-colors ${
                    isActive ? activeClass : ""
                  }`
                }
                onClick={() => setMenuOpen(false)} // Close mobile menu on click
              >
                <span className="text-lg">{icon}</span> {label}
              </NavLink>
            </li>
          ))}

          {/* Profile Dropdown */}
          <li
            className="relative py-2 md:py-0"
            ref={profileRef}
            tabIndex={-1}
            aria-haspopup="true"
          >
            <button
              onClick={toggleProfileMenu}
              className="flex items-center gap-2 focus:outline-none"
              aria-expanded={profileMenuOpen}
              aria-label="Admin profile menu"
            >
              <FaUserCircle className="text-2xl" />
              <span className="hidden md:inline font-semibold max-w-xs truncate">
                {user?.name || "Admin"}
              </span>
            </button>

            {profileMenuOpen && (
              <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-secondary hover:text-white transition-colors flex items-center gap-2"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
