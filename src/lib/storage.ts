
import { PC, PCFormData } from "./types";

const STORAGE_KEY = "pc-data-vault";

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get all PCs from local storage
export const getAllPCs = (): PC[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Get a PC by ID
export const getPCById = (id: string): PC | undefined => {
  const pcs = getAllPCs();
  return pcs.find((pc) => pc.id === id);
};

// Add a new PC
export const addPC = (pcData: PCFormData): PC => {
  const pcs = getAllPCs();
  const timestamp = Date.now();
  
  const newPC: PC = {
    id: generateId(),
    ...pcData,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  pcs.push(newPC);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pcs));
  
  return newPC;
};

// Update an existing PC
export const updatePC = (id: string, pcData: Partial<PCFormData>): PC | null => {
  const pcs = getAllPCs();
  const index = pcs.findIndex((pc) => pc.id === id);
  
  if (index === -1) return null;
  
  pcs[index] = {
    ...pcs[index],
    ...pcData,
    updatedAt: Date.now(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pcs));
  
  return pcs[index];
};

// Delete a PC
export const deletePC = (id: string): boolean => {
  const pcs = getAllPCs();
  const filteredPCs = pcs.filter((pc) => pc.id !== id);
  
  if (filteredPCs.length === pcs.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPCs));
  
  return true;
};

// Search PCs by name or owner
export const searchPCs = (query: string): PC[] => {
  const pcs = getAllPCs();
  const lowerQuery = query.toLowerCase();
  
  return pcs.filter(
    (pc) =>
      pc.name.toLowerCase().includes(lowerQuery) ||
      pc.owner.toLowerCase().includes(lowerQuery) ||
      pc.ipAddress.includes(lowerQuery)
  );
};
