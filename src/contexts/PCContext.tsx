
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PC, PCFormData } from "@/lib/types";
import { getAllPCs, addPC, updatePC, deletePC, searchPCs } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface PCContextType {
  pcs: PC[];
  loading: boolean;
  searchQuery: string;
  filteredPCs: PC[];
  addNewPC: (pcData: PCFormData) => PC;
  updateExistingPC: (id: string, pcData: Partial<PCFormData>) => PC | null;
  deleteExistingPC: (id: string) => boolean;
  setSearchQuery: (query: string) => void;
}

const PCContext = createContext<PCContextType | undefined>(undefined);

export const PCProvider = ({ children }: { children: ReactNode }) => {
  const [pcs, setPCs] = useState<PC[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredPCs, setFilteredPCs] = useState<PC[]>([]);
  const { toast } = useToast();

  // Initial load of PCs
  useEffect(() => {
    try {
      const loadedPCs = getAllPCs();
      setPCs(loadedPCs);
    } catch (error) {
      console.error("Error loading PCs:", error);
      toast({
        title: "Error",
        description: "Failed to load PC data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Filter PCs when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPCs(pcs);
    } else {
      setFilteredPCs(searchPCs(searchQuery));
    }
  }, [searchQuery, pcs]);

  // Add a new PC
  const addNewPC = (pcData: PCFormData): PC => {
    try {
      const newPC = addPC(pcData);
      setPCs((prevPCs) => [...prevPCs, newPC]);
      toast({
        title: "Success",
        description: `PC "${pcData.name}" added successfully`,
      });
      return newPC;
    } catch (error) {
      console.error("Error adding PC:", error);
      toast({
        title: "Error",
        description: "Failed to add PC",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update an existing PC
  const updateExistingPC = (id: string, pcData: Partial<PCFormData>): PC | null => {
    try {
      const updatedPC = updatePC(id, pcData);
      if (updatedPC) {
        setPCs((prevPCs) =>
          prevPCs.map((pc) => (pc.id === id ? updatedPC : pc))
        );
        toast({
          title: "Success",
          description: `PC "${updatedPC.name}" updated successfully`,
        });
      }
      return updatedPC;
    } catch (error) {
      console.error("Error updating PC:", error);
      toast({
        title: "Error",
        description: "Failed to update PC",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete a PC
  const deleteExistingPC = (id: string): boolean => {
    try {
      const result = deletePC(id);
      if (result) {
        setPCs((prevPCs) => prevPCs.filter((pc) => pc.id !== id));
        toast({
          title: "Success",
          description: "PC deleted successfully",
        });
      }
      return result;
    } catch (error) {
      console.error("Error deleting PC:", error);
      toast({
        title: "Error",
        description: "Failed to delete PC",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <PCContext.Provider
      value={{
        pcs,
        loading,
        searchQuery,
        filteredPCs,
        addNewPC,
        updateExistingPC,
        deleteExistingPC,
        setSearchQuery,
      }}
    >
      {children}
    </PCContext.Provider>
  );
};

export const usePC = (): PCContextType => {
  const context = useContext(PCContext);
  if (context === undefined) {
    throw new Error("usePC must be used within a PCProvider");
  }
  return context;
};
