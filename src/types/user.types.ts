export interface UserProfile {
  user_id: string;
  email: string;
  birth_date: string;
  location: string;
  preferences: {
    theme: string;
    notification_settings: {
      emails: boolean;
      push: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}
