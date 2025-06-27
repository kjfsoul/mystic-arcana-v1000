import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  chosen_reader?: string;
  preferences?: Record<string, unknown>;
}

export const profileService = {
  async createProfile(userId: string, profileData: UserProfile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: userId,
        ...profileData
      }]);
    
    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
    
    return data;
  },

  async updateProfile(userId: string, profileData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    return data;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Ignore "not found" error
      console.error('Error fetching profile:', error);
      throw error;
    }
    
    return data;
  }
};