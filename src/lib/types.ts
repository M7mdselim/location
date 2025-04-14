
import { Tables } from "@/integrations/supabase/types";

// Type for PC data from Supabase
export type SupabasePC = Tables<"pcs">;
export type SupabasePCPhoto = Tables<"pc_photos">;

// Our application PC type (with compatibility for both local storage and Supabase)
export interface PC {
  id: string;
  name: string;
  owner: string;
  ipAddress: string;
  photo: string;
  photos?: string[]; // Support for multiple photos
  createdAt: number;
  updatedAt: number;
}

export type PCFormData = Omit<PC, 'id' | 'createdAt' | 'updatedAt'>;

// Conversion functions between Supabase and our app formats
export const supabasePCToPC = (pc: SupabasePC, photos: SupabasePCPhoto[] = []): PC => {
  return {
    id: pc.id,
    name: pc.name,
    owner: pc.owner,
    ipAddress: pc.ip_address,
    photo: photos.length > 0 ? photos[0].photo_url : "",
    photos: photos.map(p => p.photo_url),
    createdAt: new Date(pc.created_at).getTime(),
    updatedAt: new Date(pc.updated_at).getTime(),
  };
};

export const pcToSupabasePC = (pc: PCFormData) => {
  return {
    name: pc.name,
    owner: pc.owner,
    ip_address: pc.ipAddress,
  };
};
