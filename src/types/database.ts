import { SpreadType } from '../types/tarot'; // Corrected path

export interface Database {
  tarotCards: {
    id: string;
    name: string;
    arcana: 'major' | 'minor';
    // ... other card properties
  };
  readings: {
    id: string;
    userId: string;
    spreadType: SpreadType;
    // ... other reading properties
  };
  // Add other database table interfaces as needed
}
