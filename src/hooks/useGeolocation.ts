 
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GeoLocation } from '../types/astronomical';
interface GeolocationState {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
}
interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  fallbackLocation?: GeoLocation;
}
/**
 * useGeolocation Hook
 * 
 * Manages user's geographic location for astronomical calculations.
 * Handles permissions, fallbacks, and timezone detection.
 */
export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    fallbackLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
      elevation: 10,
      timezone: 'America/New_York'
    }
  } = options;
  // Memoize fallback location to prevent infinite loops
 
  const memoizedFallbackLocation = useMemo(() => fallbackLocation, [fallbackLocation]);
  // Prevent multiple simultaneous requests
  const isRequestingRef = useRef(false);
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    permission: 'unknown'
  });
  // Get timezone from coordinates
  const getTimezoneFromCoords = async (lat: number, lon: number): Promise<string> => {
    try {
      // Try to use Intl.DateTimeFormat to get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) return timezone;
      // Fallback: estimate timezone from longitude
      const offsetHours = Math.round(lon / 15);
      // This is a rough approximation - in production, use a proper timezone API
      if (offsetHours >= -12 && offsetHours <= 12) {
        return `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
      }
      return 'UTC';
    } catch {
      return 'UTC';
    }
  };
  // Get elevation estimate (placeholder - would use elevation API in production)
  const getElevationEstimate = (): number => {
    // Placeholder elevation calculation
    // In production, use a proper elevation API like Google Elevation API
    return 0;
  };
  // Request geolocation permission and get position
 
  const requestLocation = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isRequestingRef.current) {
      return;
    }
    
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        permission: 'denied',
        location: memoizedFallbackLocation
      }));
      return;
    }
    isRequestingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Check permission status if available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permission: permission.state }));
        if (permission.state === 'denied') {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Geolocation permission denied',
            location: memoizedFallbackLocation
          }));
          isRequestingRef.current = false;
          return;
        }
      }
      // Get current position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, altitude } = position.coords;
          try {
            const timezone = await getTimezoneFromCoords(latitude, longitude);
            const elevation = altitude || getElevationEstimate();
            const location: GeoLocation = {
              latitude,
              longitude,
              elevation,
              timezone
            };
            setState(prev => ({
              ...prev,
              location,
              loading: false,
              error: null,
              permission: 'granted'
            }));
            isRequestingRef.current = false;
          } catch {
            // Use coordinates even if timezone detection fails
            const location: GeoLocation = {
              latitude,
              longitude,
              elevation: altitude || 0,
              timezone: memoizedFallbackLocation.timezone
            };
            setState(prev => ({
              ...prev,
              location,
              loading: false,
              error: null,
              permission: 'granted'
            }));
            isRequestingRef.current = false;
          }
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
            permission: error.code === error.PERMISSION_DENIED ? 'denied' : prev.permission,
            location: memoizedFallbackLocation
          }));
          isRequestingRef.current = false;
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        location: memoizedFallbackLocation
      }));
      isRequestingRef.current = false;
    }
  }, [enableHighAccuracy, maximumAge, timeout, memoizedFallbackLocation]);
  // Watch position for continuous updates
  const watchLocation = () => {
    if (!navigator.geolocation) return null;
    return navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, altitude } = position.coords;
        const timezone = await getTimezoneFromCoords(latitude, longitude);
        const elevation = altitude || getElevationEstimate();
        const location: GeoLocation = {
          latitude,
          longitude,
          elevation,
          timezone
        };
        setState(prev => ({
          ...prev,
          location,
          error: null
        }));
      },
      (error) => {
        console.warn('Geolocation watch error:', error);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );
  };
  // Clear location data
  const clearLocation = () => {
    setState(prev => ({
      ...prev,
      location: null,
      error: null
    }));
  };
  // Use fallback location
  const useFallback = () => {
    setState(prev => ({
      ...prev,
      location: memoizedFallbackLocation,
      error: null,
      loading: false
    }));
  };
  // Auto-request location on mount (only once)
 
  useEffect(() => {
    requestLocation();
  }, [requestLocation]); // Empty dependency array to run only once
  return {
    ...state,
    requestLocation,
    watchLocation,
    clearLocation,
    useFallback,
    hasLocation: !!state.location,
    isLocationAccurate: state.permission === 'granted' && !!state.location
  };
};
