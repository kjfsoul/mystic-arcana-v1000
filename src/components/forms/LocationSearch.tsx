'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geocodeLocation, getSuggestions, getPopularLocations, LocationResult } from '@/lib/location/GeocodingService';
import styles from './LocationSearch.module.css';

interface LocationSearchProps {
  value?: LocationResult | null;
  onChange: (location: LocationResult | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onChange,
  placeholder = "Enter city, state, country, or ZIP code",
  label = "Birth Location",
  error,
  className
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update query when value changes
  useEffect(() => {
    if (value) {
      setQuery(value.name);
    } else {
      setQuery('');
    }
  }, [value]);

  // Get suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 2) {
        const newSuggestions = await getSuggestions(query);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce API calls

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSearchError('');
    
    if (newQuery !== value?.name) {
      onChange(null); // Clear selection when typing
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (query.length === 0) {
      setSuggestions(getPopularLocations());
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (location: LocationResult) => {
    setQuery(location.name);
    onChange(location);
    setShowSuggestions(false);
    setSearchError('');
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setSearchError('');
    
    try {
      const result = await geocodeLocation(query);
      
      if ('latitude' in result) {
        // Success
        onChange(result);
        setQuery(result.name);
        setShowSuggestions(false);
      } else {
        // Error
        setSearchError(result.message);
        onChange(null);
      }
    } catch {
      setSearchError('Unable to search for location. Please try again.');
      onChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && showSuggestions) {
        handleSuggestionClick(suggestions[0]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className={`${styles.input} ${error || searchError ? styles.inputError : ''} ${value ? styles.inputSelected : ''}`}
          disabled={isLoading}
        />
        
        <button
          type="button"
          onClick={handleSearch}
          className={styles.searchButton}
          disabled={isLoading || !query.trim()}
          aria-label="Search location"
        >
          {isLoading ? (
            <motion.div
              className={styles.spinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⟳
            </motion.div>
          ) : (
            '🔍'
          )}
        </button>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              className={styles.suggestions}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {query.length === 0 && (
                <div className={styles.suggestionHeader}>
                  Popular Locations
                </div>
              )}
              
              {suggestions.map((location, index) => (
                <motion.button
                  key={`${location.latitude}-${location.longitude}`}
                  type="button"
                  className={styles.suggestion}
                  onClick={() => handleSuggestionClick(location)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(138, 43, 226, 0.1)' }}
                >
                  <div className={styles.suggestionIcon}>📍</div>
                  <div className={styles.suggestionContent}>
                    <div className={styles.suggestionName}>
                      {location.name}
                    </div>
                    {location.timezone && (
                      <div className={styles.suggestionDetails}>
                        {location.timezone.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(error || searchError) && (
        <motion.div
          className={styles.errorMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error || searchError}
        </motion.div>
      )}

      {value && (
        <motion.div
          className={styles.selectedLocation}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.selectedIcon}>✓</div>
          <div className={styles.selectedContent}>
            <div className={styles.selectedName}>{value.name}</div>
            <div className={styles.selectedCoords}>
              {value.latitude.toFixed(4)}°, {value.longitude.toFixed(4)}°
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};