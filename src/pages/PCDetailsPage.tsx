
import React from "react";
import PCDetails from "@/components/PCDetails";
import Navbar from "@/components/Navbar";

const PCDetailsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PCDetails />
      </main>
    </div>
  );
};

export default PCDetailsPage;
