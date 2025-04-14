import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Computer, PlusCircle, List, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex items-center justify-between h-16 py-4">
        {/* Logo and title */}
        <div className="flex items-center gap-2">
          <Computer className="h-6 w-6 text-primary" />
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight text-primary">Location</h1>
          </Link>
        </div>

        {/* Navbar items container */}
        {isAuthenticated && (
          <div className="flex items-center gap-4 lg:gap-8">
            {/* "Add PC" button visible only on mobile */}
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Add PC</span>
              </Button>
            </Link>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                onClick={() => setMenuOpen(!menuOpen)}
                className="gap-2"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" className="gap-2">
                  <List className="h-4 w-4" />
                  <span>Saved PC's</span>
                </Button>
              </Link>
              <Button variant="ghost" className="gap-2" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isAuthenticated && menuOpen && (
        <div className="lg:hidden border-t bg-background px-4 pb-4">
          <nav className="flex flex-col gap-2 pt-2">
            <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <List className="h-4 w-4" />
                <span>Saved PC's</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
