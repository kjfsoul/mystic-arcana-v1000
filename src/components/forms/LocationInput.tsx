'use client';
 
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}
/* eslint-disable no-unused-vars */
interface LocationInputProps {
  onLocationSelect: (location: LocationData) => void;
  initialValue?: string;
  className?: string;
  placeholder?: string;
}
/* eslint-enable no-unused-vars */
interface GeocodingResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  timezone?: string;
}
export const LocationInput: React.FC<LocationInputProps> = ({
  onLocationSelect,
  initialValue = '',
  className = '',
  placeholder = 'Enter city, country'
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  // Debounced search
 
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(async () => {
      await searchLocations(query);
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);
  const searchLocations = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const results = await response.json();
        setSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect({
          city: '',
          country: '',
          latitude: latitude,
          longitude: longitude,
        });
      },
      (error) => {
        setGpsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            alert('Location request timed out.');
            break;
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectLocation(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };
  const selectLocation = (location: GeocodingResult) => {
    const displayName = `${location.name}, ${location.country}`;
    setQuery(displayName);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    onLocationSelect({
      city: location.name,
      country: location.country,
      latitude: location.lat,
      longitude: location.lon,
      timezone: location.timezone
    });
  };
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-20"
        />
        
        {/* GPS Button */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gpsLoading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-purple-400 hover:text-purple-300 disabled:opacity-50"
          title="Use current location"
        >
          {gpsLoading ? (
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-purple-500/30 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {suggestions.map((location, index) => (
              <motion.button
                key={`${location.lat}-${location.lon}`}
                type="button"
                onClick={() => selectLocation(location)}
                className={`w-full px-4 py-3 text-left hover:bg-purple-500/20 border-b border-purple-500/10 last:border-b-0 transition-colors ${
                  index === selectedIndex ? 'bg-purple-500/20' : ''
                }`}
                whileHover={{ x: 4 }}
              >
                <div className="text-white font-medium">{location.name}</div>
                <div className="text-gray-400 text-sm">
                  {location.state ? `${location.state}, ` : ''}{location.country}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
