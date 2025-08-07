import { SpreadType } from "./tarot"; // Corrected path
import { ArcanaType } from "@/constants/EventTypes";

export interface Database {
  tarotCards: {
    id: string;
    name: string;
    arcana: ArcanaType;
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
