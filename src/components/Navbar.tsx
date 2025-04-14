
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Computer, PlusCircle, List } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Computer className="h-6 w-6 text-primary" />
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight text-primary">PC Pal Data Vault</h1>
          </Link>
        </div>
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
              <span>Dashboard</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
