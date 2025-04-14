
import React from "react";
import PCEditForm from "@/components/PCEditForm";
import Navbar from "@/components/Navbar";

const PCEditPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PCEditForm />
      </main>
    </div>
  );
};

export default PCEditPage;
