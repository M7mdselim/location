import { PC, PCFormData, supabasePCToPC } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Tables } from "@/integrations/supabase/types";

const STORAGE_KEY = "pc-data-vault";

// Get all PCs from Supabase
export const getAllPCs = async (): Promise<PC[]> => {
  try {
    const { data: pcs, error } = await supabase
      .from("pcs")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching PCs:", error);
      const localData = localStorage.getItem(STORAGE_KEY);
      return localData ? JSON.parse(localData) : [];
    }

    const pcIds = pcs.map(pc => pc.id);
    const { data: photos, error: photosError } = await supabase
      .from("pc_photos")
      .select("*")
      .in("pc_id", pcIds);

    if (photosError) {
      console.error("Error fetching PC photos:", photosError);
    }

    const photosByPcId = (photos || []).reduce<Record<string, Tables<"pc_photos">[]>>((acc, photo) => {
      if (!acc[photo.pc_id]) {
        acc[photo.pc_id] = [];
      }
      acc[photo.pc_id].push(photo);
      return acc;
    }, {});

    return pcs.map(pc => supabasePCToPC(pc, photosByPcId[pc.id] || []));
  } catch (error) {
    console.error("Error in getAllPCs:", error);
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
};

// Get a PC by ID
export const getPCById = async (id: string): Promise<PC | undefined> => {
  try {
    const { data: pc, error } = await supabase
      .from("pcs")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      console.error("Error fetching PC:", error);
      const pcs = localStorage.getItem(STORAGE_KEY);
      return pcs ? JSON.parse(pcs).find((pc: PC) => pc.id === id) : undefined;
    }

    const { data: photos, error: photosError } = await supabase
      .from("pc_photos")
      .select("*")
      .eq("pc_id", id);

    if (photosError) {
      console.error("Error fetching PC photos:", photosError);
    }

    return supabasePCToPC(pc, photos || []);
  } catch (error) {
    console.error("Error in getPCById:", error);
    const pcs = localStorage.getItem(STORAGE_KEY);
    return pcs ? JSON.parse(pcs).find((pc: PC) => pc.id === id) : undefined;
  }
};

// Check if PC name already exists
export const checkPCNameExists = async (name: string, excludeId?: string): Promise<boolean> => {
  try {
    let query = supabase
      .from("pcs")
      .select("id")
      .eq("name", name);
      
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error checking PC name:", error);
      return false;
    }
    
    return data.length > 0;
  } catch (error) {
    console.error("Error in checkPCNameExists:", error);
    return false;
  }
};

// Upload photo to Supabase Storage
export const uploadPhoto = async (photoBase64: string): Promise<string> => {
  try {
    const base64Data = photoBase64.split(',')[1];
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
    const filename = `${uuidv4()}.jpg`;
    
    const { data, error } = await supabase
      .storage
      .from("pc_photos")
      .upload(filename, blob);
      
    if (error) {
      console.error("Error uploading photo:", error);
      return photoBase64;
    }
    
    const { data: { publicUrl } } = supabase
      .storage
      .from("pc_photos")
      .getPublicUrl(data.path);
      
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadPhoto:", error);
    return photoBase64;
  }
};

// Add a new PC with photos
export const addPC = async (pcData: PCFormData): Promise<PC | null> => {
  try {
    const exists = await checkPCNameExists(pcData.name);
    if (exists) {
      throw new Error(`A PC with the name "${pcData.name}" already exists.`);
    }
    
    let mainPhotoUrl = "";
    let photoUrls: string[] = [];
    
    if (pcData.photo) {
      mainPhotoUrl = await uploadPhoto(pcData.photo);
      photoUrls.push(mainPhotoUrl);
    }
    
    if (pcData.photos && pcData.photos.length > 0) {
      const additionalPhotos = await Promise.all(
        pcData.photos.map(photo => uploadPhoto(photo))
      );
      photoUrls = [...new Set([...photoUrls, ...additionalPhotos])];
    }
    
    const { data: newPC, error } = await supabase
      .from("pcs")
      .insert({
        name: pcData.name,
        owner: pcData.owner,
        ip_address: pcData.ipAddress
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error adding PC:", error);
      throw error;
    }
    
    if (photoUrls.length > 0) {
      const photoInserts = photoUrls.map(url => ({
        pc_id: newPC.id,
        photo_url: url
      }));
      
      const { error: photoError } = await supabase
        .from("pc_photos")
        .insert(photoInserts);
        
      if (photoError) {
        console.error("Error adding PC photos:", photoError);
      }
    }
    
    return supabasePCToPC(newPC, photoUrls.map(url => ({ 
      id: uuidv4(), 
      pc_id: newPC.id, 
      photo_url: url,
      created_at: new Date().toISOString()
    })));
  } catch (error) {
    console.error("Error in addPC:", error);
    
    if (error instanceof Error && error.message.includes("already exists")) {
      throw error;
    }
    
    try {
      const pcs = localStorage.getItem(STORAGE_KEY);
      const timestamp = Date.now();
      
      const newPC: PC = {
        id: uuidv4(),
        ...pcData,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      const updatedPCs = pcs ? [...JSON.parse(pcs), newPC] : [newPC];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPCs));
      
      return newPC;
    } catch (localError) {
      console.error("Error in local fallback:", localError);
      return null;
    }
  }
};

// Update an existing PC
export const updatePC = async (id: string, pcData: Partial<PCFormData>): Promise<PC | null> => {
  try {
    if (pcData.name) {
      const exists = await checkPCNameExists(pcData.name, id);
      if (exists) {
        throw new Error(`A PC with the name "${pcData.name}" already exists.`);
      }
    }
    
    const existingPC = await getPCById(id);
    if (!existingPC) {
      throw new Error("PC not found");
    }
    
    let photoUrls: string[] = [];
    
    if (pcData.photo && pcData.photo !== existingPC.photo && !pcData.photo.startsWith("http")) {
      const mainPhotoUrl = await uploadPhoto(pcData.photo);
      photoUrls.push(mainPhotoUrl);
      
      pcData.photo = mainPhotoUrl;
    } else if (pcData.photo) {
      photoUrls.push(pcData.photo);
    }
    
    if (pcData.photos && pcData.photos.length > 0) {
      const processedPhotos = await Promise.all(
        pcData.photos.map(async (photo) => {
          if (!photo.startsWith("http")) {
            return await uploadPhoto(photo);
          }
          return photo;
        })
      );
      
      photoUrls = [...new Set([...photoUrls, ...processedPhotos])].slice(0, 5);
    }
    
    const updateData: any = {};
    if (pcData.name) updateData.name = pcData.name;
    if (pcData.owner) updateData.owner = pcData.owner;
    if (pcData.ipAddress) updateData.ip_address = pcData.ipAddress;
    
    const { data: updatedPC, error } = await supabase
      .from("pcs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating PC:", error);
      throw error;
    }
    
    if (photoUrls.length > 0) {
      const { error: deleteError } = await supabase
        .from("pc_photos")
        .delete()
        .eq("pc_id", id);
        
      if (deleteError) {
        console.error("Error deleting existing photos:", deleteError);
      }
      
      const photoInserts = photoUrls.map(url => ({
        pc_id: id,
        photo_url: url
      }));
      
      const { error: photoError } = await supabase
        .from("pc_photos")
        .insert(photoInserts);
        
      if (photoError) {
        console.error("Error updating PC photos:", photoError);
      }
    }
    
    const { data: photos, error: photosError } = await supabase
      .from("pc_photos")
      .select("*")
      .eq("pc_id", id);
      
    if (photosError) {
      console.error("Error fetching updated PC photos:", photosError);
    }
    
    return supabasePCToPC(updatedPC, photos || []);
  } catch (error) {
    console.error("Error in updatePC:", error);
    
    if (error instanceof Error && error.message.includes("already exists")) {
      throw error;
    }
    
    try {
      const pcs = localStorage.getItem(STORAGE_KEY);
      if (!pcs) return null;
      
      const parsedPCs: PC[] = JSON.parse(pcs);
      const index = parsedPCs.findIndex((pc) => pc.id === id);
      
      if (index === -1) return null;
      
      parsedPCs[index] = {
        ...parsedPCs[index],
        ...pcData,
        updatedAt: Date.now(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedPCs));
      
      return parsedPCs[index];
    } catch (localError) {
      console.error("Error in local fallback:", localError);
      return null;
    }
  }
};

// Delete a PC
export const deletePC = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("pcs")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("Error deleting PC:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deletePC:", error);
    
    try {
      const pcs = localStorage.getItem(STORAGE_KEY);
      if (!pcs) return false;
      
      const parsedPCs: PC[] = JSON.parse(pcs);
      const filteredPCs = parsedPCs.filter((pc) => pc.id !== id);
      
      if (filteredPCs.length === parsedPCs.length) return false;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPCs));
      
      return true;
    } catch (localError) {
      console.error("Error in local fallback:", localError);
      return false;
    }
  }
};

// Search PCs by name, owner, IP, or MAC
export const searchPCs = async (query: string): Promise<PC[]> => {
  try {
    const lowerQuery = query.toLowerCase();
    
    const { data: pcs, error } = await supabase
      .from("pcs")
      .select("*")
      .or(`name.ilike.%${lowerQuery}%,owner.ilike.%${lowerQuery}%,ip_address.ilike.%${lowerQuery}%,mac_address.ilike.%${lowerQuery}%`);
      
    if (error) {
      console.error("Error searching PCs:", error);
      throw error;
    }
    
    const pcIds = pcs.map(pc => pc.id);
    
    if (pcIds.length === 0) {
      return [];
    }
    
    const { data: photos, error: photosError } = await supabase
      .from("pc_photos")
      .select("*")
      .in("pc_id", pcIds);
      
    if (photosError) {
      console.error("Error fetching PC photos for search:", photosError);
    }
    
    const photosByPcId = (photos || []).reduce<Record<string, Tables<"pc_photos">[]>>((acc, photo) => {
      if (!acc[photo.pc_id]) {
        acc[photo.pc_id] = [];
      }
      acc[photo.pc_id].push(photo);
      return acc;
    }, {});
    
    return pcs.map(pc => supabasePCToPC(pc, photosByPcId[pc.id] || []));
  } catch (error) {
    console.error("Error in searchPCs:", error);
    
    try {
      const pcs = localStorage.getItem(STORAGE_KEY);
      if (!pcs) return [];
      
      const parsedPCs: PC[] = JSON.parse(pcs);
      const lowerQuery = query.toLowerCase();
      
      return parsedPCs.filter(
        (pc) =>
          pc.name.toLowerCase().includes(lowerQuery) ||
          pc.owner.toLowerCase().includes(lowerQuery) ||
          pc.ipAddress.includes(lowerQuery) ||
          (pc.macAddress && pc.macAddress.toLowerCase().includes(lowerQuery))
      );
    } catch (localError) {
      console.error("Error in local fallback:", localError);
      return [];
    }
  }
};
