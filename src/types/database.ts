export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      decks: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          deck_id: string;
          name: string;
          card_number: number | null;
          suit: string | null;
          arcana_type: 'major' | 'minor';
          meaning_upright: string;
          meaning_reversed: string;
          image_url: string | null;
          keywords: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deck_id: string;
          name: string;
          card_number?: number | null;
          suit?: string | null;
          arcana_type: 'major' | 'minor';
          meaning_upright: string;
          meaning_reversed: string;
          image_url?: string | null;
          keywords?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deck_id?: string;
          name?: string;
          card_number?: number | null;
          suit?: string | null;
          arcana_type?: 'major' | 'minor';
          meaning_upright?: string;
          meaning_reversed?: string;
          image_url?: string | null;
          keywords?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          birth_date: string | null;
          birth_time: string | null;
          birth_location: string | null;
          chosen_reader: string | null;
          preferences: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_location?: string | null;
          chosen_reader?: string | null;
          preferences?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_location?: string | null;
          chosen_reader?: string | null;
          preferences?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tarot_readings: {
        Row: {
          id: string;
          user_id: string;
          spread_type: 'single' | 'three-card' | 'celtic-cross';
          cards_drawn: Record<string, unknown>;
          interpretation_text: string;
          cosmic_influence: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          spread_type: 'single' | 'three-card' | 'celtic-cross';
          cards_drawn: Record<string, unknown>;
          interpretation_text: string;
          cosmic_influence?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          spread_type?: 'single' | 'three-card' | 'celtic-cross';
          cards_drawn?: Record<string, unknown>;
          interpretation_text?: string;
          cosmic_influence?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}