
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PC, PCFormData } from "@/lib/types";
import { getAllPCs, addPC, updatePC, deletePC, searchPCs } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface PCContextType {
  pcs: PC[];
  loading: boolean;
  searchQuery: string;
  filteredPCs: PC[];
  addNewPC: (pcData: PCFormData) => Promise<PC | null>;
  updateExistingPC: (id: string, pcData: Partial<PCFormData>) => Promise<PC | null>;
  deleteExistingPC: (id: string) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  refreshPCs: () => Promise<void>;
}

const PCContext = createContext<PCContextType | undefined>(undefined);

export const PCProvider = ({ children }: { children: ReactNode }) => {
  const [pcs, setPCs] = useState<PC[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredPCs, setFilteredPCs] = useState<PC[]>([]);
  const { toast } = useToast();

  // Function to load PCs from storage
  const refreshPCs = async () => {
    setLoading(true);
    try {
      const loadedPCs = await getAllPCs();
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
  };

  // Initial load of PCs
  useEffect(() => {
    refreshPCs();
  }, []);

  // Filter PCs when search query changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === "") {
        setFilteredPCs(pcs);
      } else {
        setLoading(true);
        try {
          const results = await searchPCs(searchQuery);
          setFilteredPCs(results);
        } catch (error) {
          console.error("Error searching PCs:", error);
          setFilteredPCs(pcs.filter(
            pc =>
              pc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              pc.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
              pc.ipAddress.includes(searchQuery)
          ));
        } finally {
          setLoading(false);
        }
      }
    };

    performSearch();
  }, [searchQuery, pcs]);

  // Add a new PC
  const addNewPC = async (pcData: PCFormData): Promise<PC | null> => {
    try {
      const newPC = await addPC(pcData);
      if (newPC) {
        setPCs((prevPCs) => [newPC, ...prevPCs]);
        toast({
          title: "Success",
          description: `PC "${pcData.name}" added successfully`,
        });
      }
      return newPC;
    } catch (error: any) {
      console.error("Error adding PC:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add PC",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update an existing PC
  const updateExistingPC = async (id: string, pcData: Partial<PCFormData>): Promise<PC | null> => {
    try {
      const updatedPC = await updatePC(id, pcData);
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
    } catch (error: any) {
      console.error("Error updating PC:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update PC",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete a PC
  const deleteExistingPC = async (id: string): Promise<boolean> => {
    try {
      const result = await deletePC(id);
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
        refreshPCs,
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
