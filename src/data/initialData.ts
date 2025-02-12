import { Client, Reward } from '../types';

export const initialClients: Client[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    phone: '555-0001',
    registrationDate: '2024-03-15',
    pets: [
      {
        id: '1',
        name: 'Max',
        species: 'Perro',
        breed: 'Labrador'
      }
    ]
  }
];

export const initialRewards: Reward[] = [];