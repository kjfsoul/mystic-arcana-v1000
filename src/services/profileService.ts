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
      // First try to get existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      // If profile exists, return it
      if (data) {
        return data;
      }
      
      // If no profile exists, use upsert to handle race conditions
      console.log(`Creating profile for user ${userId}`);
      const { data: newProfile, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          birth_date: null,
          birth_time: null,
          birth_location: null,
          chosen_reader: null,
          preferences: {}
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();
      
      if (upsertError) {
        console.error('Error upserting profile:', upsertError);
        throw upsertError;
      }
      
      return newProfile;
    } catch (error) {
      console.error('Profile service error:', error);
      throw error;
    }
  }
};
