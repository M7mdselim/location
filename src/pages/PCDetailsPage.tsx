
import React, { useEffect } from "react";
import PCDetails from "@/components/PCDetails";
import Navbar from "@/components/Navbar";
import { useParams } from "react-router-dom";
import { usePC } from "@/contexts/PCContext";

const PCDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { refreshPCs } = usePC();
  
  // Ensure PC data is fresh when viewing details
  useEffect(() => {
    if (id) {
      refreshPCs();
    }
  }, [id, refreshPCs]);

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
