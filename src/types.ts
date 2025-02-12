export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  registrationDate: string;
  referrerId?: string;
  createdAt: string;
  updatedAt: string;
  pets: Pet[];
  visits?: Visit[];
  rewards?: Reward[];
}

export interface Pet {
  id: string;
  clientId: string;
  name: string;
  species: string;
  breed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: string;
  clientId: string;
  type: 'DIRECT' | 'SECOND_LEVEL';
  status: 'PENDING' | 'CLAIMED';
  dateEarned: string;
  dateClaimed?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  clientId: string;
  petId: string;
  visitDate: string;
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  pet?: Pet;
}