
import React from "react";
import Dashboard from "@/components/Dashboard";
import Navbar from "@/components/Navbar";

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Dashboard />
      </main>
    </div>
  );
};

export default DashboardPage;
