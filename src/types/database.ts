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