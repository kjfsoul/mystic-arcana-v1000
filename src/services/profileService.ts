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
      }])
      .select()
      .single();
    
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
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle missing records gracefully
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      // If no profile exists, create one
      if (!data) {
        console.log(`Creating profile for user ${userId}`);
        return await this.createProfile(userId, {});
      }
      
      return data;
    } catch (error) {
      console.error('Profile service error:', error);
      throw error;
    }
  }
};