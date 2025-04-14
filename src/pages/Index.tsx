
import React from "react";
import PCForm from "@/components/PCForm";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <PCForm />
        </div>
      </main>
    </div>
  );
};

export default Index;
