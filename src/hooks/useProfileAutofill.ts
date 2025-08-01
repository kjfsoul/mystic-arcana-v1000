import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileDataService, ProfileData } from '@/services/ProfileDataService';

interface AutofillOptions {
  includeCoordinates?: boolean;
  autoLoad?: boolean;
}

export function useProfileAutofill(options: AutofillOptions = {}) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile data on mount or user change
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user || !options.autoLoad) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await ProfileDataService.loadProfile(user.id);
        setProfileData(data);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, options.autoLoad]);

  // Subscribe to profile changes
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const unsubscribe = ProfileDataService.subscribe((data) => {
      setProfileData(data);
    });

    return unsubscribe;
  }, []);

  // Get autofill values
  const getAutofillValues = () => {
    const data = profileData || ProfileDataService.getAutofillData();
    
    return {
      birthDate: data.birthDate || '',
      birthTime: data.birthTime || '',
      birthLocation: data.birthLocation || '',
      birthCoordinates: options.includeCoordinates ? data.birthCoordinates : undefined,
      preferredTarotReader: data.preferredTarotReader || ''
    };
  };

  // Save profile field
  const saveProfileField = async (field: keyof ProfileData, value: any) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      const success = await ProfileDataService.updateField(user.id, field, value);
      if (!success) {
        setError('Failed to save profile data');
      }
      return success;
    } catch (err) {
      console.error('Failed to save profile field:', err);
      setError('Failed to save profile data');
      return false;
    }
  };

  // Save all profile data
  const saveProfile = async (data: Partial<ProfileData>) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      const success = await ProfileDataService.saveProfile(user.id, data);
      if (!success) {
        setError('Failed to save profile data');
      }
      return success;
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile data');
      return false;
    }
  };

  // Format birth info for display
  const getFormattedBirthInfo = () => {
    return ProfileDataService.formatBirthDateTime();
  };

  return {
    profileData,
    isLoading,
    error,
    getAutofillValues,
    saveProfileField,
    saveProfile,
    getFormattedBirthInfo,
    // Individual field getters for convenience
    birthDate: profileData?.birthDate || '',
    birthTime: profileData?.birthTime || '',
    birthLocation: profileData?.birthLocation || '',
    birthCoordinates: profileData?.birthCoordinates,
    preferredTarotReader: profileData?.preferredTarotReader || ''
  };
}