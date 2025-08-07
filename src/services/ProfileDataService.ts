import { supabase } from '@/lib/supabase/client';
export interface ProfileData {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  birthCoordinates?: {
    lat: number;
    lng: number;
  };
  preferredTarotReader?: string;
  timezone?: string;
}
// interface StoredProfile extends ProfileData {
//   user_id: string;
//   updated_at: string;
// } // Commented out - not currently used
class ProfileDataServiceClass {
  private static instance: ProfileDataServiceClass;
  private cachedProfile: ProfileData | null = null;
  private listeners: Set<(profile: ProfileData) => void> = new Set();
  private constructor() {
    // Initialize auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        this.clearCache();
      }
    });
  }
  static getInstance(): ProfileDataServiceClass {
    if (!ProfileDataServiceClass.instance) {
      ProfileDataServiceClass.instance = new ProfileDataServiceClass();
    }
    return ProfileDataServiceClass.instance;
  }
  /**
   * Load profile data from database
   */
  async loadProfile(userId: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('birth_date, birth_time, birth_location, birth_coordinates, preferred_tarot_reader, timezone')
        .eq('user_id', userId)
        .single();
      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }
      const profile: ProfileData = {
        birthDate: data?.birth_date,
        birthTime: data?.birth_time,
        birthLocation: data?.birth_location,
        birthCoordinates: data?.birth_coordinates,
        preferredTarotReader: data?.preferred_tarot_reader,
        timezone: data?.timezone
      };
      this.cachedProfile = profile;
      this.notifyListeners(profile);
      
      // Store in localStorage for offline access
      this.saveToLocalStorage(profile);
      
      return profile;
    } catch (error) {
      console.error('Failed to load profile:', error);
      
      // Try to load from localStorage as fallback
      return this.loadFromLocalStorage();
    }
  }
  /**
   * Save profile data
   */
  async saveProfile(userId: string, data: Partial<ProfileData>): Promise<boolean> {
    try {
      const updates = {
        user_id: userId,
        birth_date: data.birthDate,
        birth_time: data.birthTime,
        birth_location: data.birthLocation,
        birth_coordinates: data.birthCoordinates,
        preferred_tarot_reader: data.preferredTarotReader,
        timezone: data.timezone,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from('user_profiles')
        .upsert(updates, { onConflict: 'user_id' });
      if (error) {
        console.error('Error saving profile:', error);
        return false;
      }
      // Update cache
      this.cachedProfile = { ...this.cachedProfile, ...data };
      this.notifyListeners(this.cachedProfile);
      this.saveToLocalStorage(this.cachedProfile);
      return true;
    } catch (error) {
      console.error('Failed to save profile:', error);
      return false;
    }
  }
  /**
   * Get current profile data
   */
  getProfile(): ProfileData | null {
    if (this.cachedProfile) {
      return this.cachedProfile;
    }
    
    // Try localStorage as fallback
    return this.loadFromLocalStorage();
  }
  /**
   * Subscribe to profile changes
   */
  subscribe(callback: (profile: ProfileData) => void): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current data if available
    if (this.cachedProfile) {
      callback(this.cachedProfile);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }
  /**
   * Get autofill data for birth information
   */
  getAutofillData(): {
    birthDate?: string;
    birthTime?: string;
    birthLocation?: string;
    birthCoordinates?: { lat: number; lng: number };
    preferredTarotReader?: string;
  } {
    const profile = this.getProfile();
    
    return {
      birthDate: profile?.birthDate,
      birthTime: profile?.birthTime,
      birthLocation: profile?.birthLocation,
      birthCoordinates: profile?.birthCoordinates,
      preferredTarotReader: profile?.preferredTarotReader
    };
  }
  /**
   * Update specific field
   */
  async updateField(userId: string, field: keyof ProfileData, value: any): Promise<boolean> {
    const updates = { [field]: value };
    return this.saveProfile(userId, updates);
  }
  /**
   * Clear cache
   */
  private clearCache(): void {
    this.cachedProfile = null;
    localStorage.removeItem('mystic_arcana_profile');
    this.notifyListeners({});
  }
  /**
   * Notify all listeners
   */
  private notifyListeners(profile: ProfileData): void {
    this.listeners.forEach(callback => {
      try {
        callback(profile);
      } catch (error) {
        console.error('Profile listener error:', error);
      }
    });
  }
  /**
   * Save to localStorage
   */
  private saveToLocalStorage(profile: ProfileData): void {
    try {
      localStorage.setItem('mystic_arcana_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save profile to localStorage:', error);
    }
  }
  /**
   * Load from localStorage
   */
  private loadFromLocalStorage(): ProfileData | null {
    try {
      const stored = localStorage.getItem('mystic_arcana_profile');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load profile from localStorage:', error);
    }
    return null;
  }
  /**
   * Format birth datetime for display
   */
  formatBirthDateTime(): string {
    const profile = this.getProfile();
    if (!profile?.birthDate) return '';
    
    let result = profile.birthDate;
    if (profile.birthTime) {
      result += ` at ${profile.birthTime}`;
    }
    if (profile.birthLocation) {
      result += ` in ${profile.birthLocation}`;
    }
    
    return result;
  }
}
// Export singleton instance
export const ProfileDataService = ProfileDataServiceClass.getInstance();
