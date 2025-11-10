import { NavLink, useNavigate } from "react-router-dom";
import { FaUserShield, FaBoxOpen, FaTachometerAlt, FaUsers, FaShoppingCart, FaSignOutAlt, FaUserCircle, FaBars } from "react-icons/fa";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function AdminNavbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-primary font-bold"
      : "text-white/80 hover:text-white transition-colors";

  return (
    <header className="bg-indigo-700 text-white sticky top-0 z-50 shadow-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <FaUserShield className="text-3xl" />
          <span className="text-2xl font-bold select-none">Admin Panel</span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end className={linkCls}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="p-2">
                  <FaBars className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navLinks.map(({ to, label }) => (
                  <NavLink key={to} to={to} end onClick={() => setMenuOpen(false)}>
                    <DropdownMenuItem>{label}</DropdownMenuItem>
                  </NavLink>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 px-3">
                <FaUserCircle className="h-4 w-4" />
                {user?.name.split(" ")[0] || "Admin"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <div className="flex items-center gap-2">
                  <FaSignOutAlt /> Logout
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
