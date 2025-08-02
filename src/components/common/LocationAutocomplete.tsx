'use client';
 
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, X } from 'lucide-react';
interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}
interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onLocationSelect?: (location: { name: string; lat: number; lon: number }) => void;
}
export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "City, State/Country",
  className = "",
  onLocationSelect
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Debounced search
 
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value.length >= 3) {
        searchLocations(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [value]);
  // Handle clicks outside to close suggestions
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const searchLocations = async (query: string) => {
    try {
      setIsLoading(true);
      
      // Use Nominatim (OpenStreetMap) API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
      );
      
      if (response.ok) {
        const results: LocationSuggestion[] = await response.json();
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };
  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const locationName = suggestion.display_name.split(',').slice(0, 3).join(',').trim();
    onChange(locationName);
    setShowSuggestions(false);
    
    if (onLocationSelect) {
      onLocationSelect({
        name: locationName,
        lat: parseFloat(suggestion.lat),
        lon: parseFloat(suggestion.lon)
      });
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };
  const clearInput = () => {
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">
          <MapPin className="w-4 h-4" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 3 && setShowSuggestions(suggestions.length > 0)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 bg-purple-900/30 border border-purple-500/30 
            rounded-lg text-white placeholder-purple-400 focus:border-purple-400 
            focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-purple-400"
            >
              <Search className="w-4 h-4" />
            </motion.div>
          )}
          
          {value && !isLoading && (
            <button
              onClick={clearInput}
              className="text-purple-400 hover:text-purple-300 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-purple-900/95 backdrop-blur-md border border-purple-500/30 
              rounded-lg shadow-2xl max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-purple-500/20 last:border-b-0
                  ${index === selectedIndex 
                    ? 'bg-purple-700/50 text-white' 
                    : 'text-purple-200 hover:bg-purple-800/30'
                  }`}
                whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                type="button"
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 text-purple-400 flex-shrink-0" />
                  <span className="truncate">
                    {suggestion.display_name.split(',').slice(0, 3).join(',').trim()}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
