import { Link, NavLink } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Navbar() {
  
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-primary" : "text-foreground/80 hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-wide">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Season Enterprises
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/" end className={linkCls}>
            Home
          </NavLink>
          <a href="#featured" className="text-foreground/80 hover:text-foreground">
            Featured
          </a>
          <a href="#about" className="text-foreground/80 hover:text-foreground">
            About
          </a>
          <NavLink to="/contact" className={linkCls}>
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" /> Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <NavLink to="/account">
                <DropdownMenuItem>Profile</DropdownMenuItem>
              </NavLink>
              <NavLink to="/cart">
                <DropdownMenuItem>Orders</DropdownMenuItem>
              </NavLink>
              <NavLink to="/signin">
                <DropdownMenuItem>Sign in</DropdownMenuItem>
              </NavLink>
              <NavLink to="/signup">
                <DropdownMenuItem>Create account</DropdownMenuItem>
              </NavLink>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
