
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Computer, PlusCircle, List, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Computer className="h-6 w-6 text-primary" />
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight text-primary">Location</h1>
          </Link>
        </div>
        {isAuthenticated && (
          <nav className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Add PC</span>
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" className="gap-2">
                <List className="h-4 w-4" />
                <span>Saved PC's</span>
              </Button>
            </Link>
            <Button variant="ghost" className="gap-2" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
