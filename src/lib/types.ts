
export interface PC {
  id: string;
  name: string;
  owner: string;
  ipAddress: string;
  photo: string;
  createdAt: number;
  updatedAt: number;
}

export type PCFormData = Omit<PC, 'id' | 'createdAt' | 'updatedAt'>;
