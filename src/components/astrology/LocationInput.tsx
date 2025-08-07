"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./LocationInput.module.css";
interface LocationSuggestion {
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  context?: Array<{ text: string; id: string }>;
}
/* eslint-disable no-unused-vars */
interface LocationInputProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  onCoordinatesFound?: (lat: number, lng: number) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
}
/* eslint-enable no-unused-vars */
// Mapbox API endpoint (you can also use other geocoding services)
const GEOCODING_API = "https://api.mapbox.com/geocoding/v5/mapbox.places";
export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onCoordinatesFound,
  placeholder = "Enter city name (e.g., Atlanta, GA)",
  required = false,
  className = "",
  label = "Birth Location",
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Fetch location suggestions

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // First try Mapbox if we have an API key
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

      if (mapboxToken) {
        const response = await fetch(
          `${GEOCODING_API}/${encodeURIComponent(searchQuery)}.json?` +
            `access_token=${mapboxToken}&` +
            `types=place,locality,district&` +
            `limit=5`,
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.features || []);
          setShowSuggestions(true);
          return;
        }
      }
      // Fallback to Nominatim (OpenStreetMap) - no API key required
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `format=json&` +
          `limit=5&` +
          `featuretype=city,town,village`,
      );
      if (nominatimResponse.ok) {
        const data = await nominatimResponse.json();
        // Convert Nominatim format to our format
        const convertedSuggestions: LocationSuggestion[] = data.map(
          (item: any) => ({
            place_name: item.display_name,
            center: [parseFloat(item.lon), parseFloat(item.lat)],
          }),
        );
        setSuggestions(convertedSuggestions);
        setShowSuggestions(true);
      } else {
        setError("Unable to fetch location suggestions");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Error searching for locations");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Debounced search

  useEffect(() => {
    if (query !== value) {
      onChange(query);
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (query.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, fetchSuggestions, onChange, value]);
  // Handle click outside

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectLocation(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };
  // Select a location
  const selectLocation = (location: LocationSuggestion) => {
    const locationName =
      location.place_name.split(",")[0] +
      ", " +
      (location.place_name.split(",")[1] || "").trim();

    setQuery(locationName);
    onChange(locationName, {
      lat: location.center[1],
      lng: location.center[0],
    });

    if (onCoordinatesFound) {
      onCoordinatesFound(location.center[1], location.center[0]);
    }

    setShowSuggestions(false);
    setSelectedIndex(-1);
  };
  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange(query, { lat: latitude, lng: longitude });
        if (onCoordinatesFound) {
          onCoordinatesFound(latitude, longitude);
        }
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setError("Location request timed out");
            break;
          default:
            setError("An unknown error occurred");
        }
      },
    );
  };
  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}{" "}
          {!required && <span className={styles.optional}>(Optional)</span>}
        </label>
      )}

      <div className={styles.inputWrapper}>
        <div className={styles.inputContainer}>
          <Search className={styles.searchIcon} />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            required={required}
            className={styles.input}
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className={styles.clearButton}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className={styles.locationButton}
            title="Use current location"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </button>
        </div>
        {/* Suggestions dropdown */}
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
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectLocation(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`${styles.suggestionItem} ${
                    index === selectedIndex ? styles.suggestionSelected : ""
                  }`}
                >
                  <MapPin className={styles.suggestionIcon} />
                  <span className={styles.suggestionText}>
                    {suggestion.place_name}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Loading indicator */}
        {isLoading && (
          <div className={styles.loadingIndicator}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Searching locations...</span>
          </div>
        )}
        {/* Error message */}
        {error && (
          <motion.div
            className={styles.error}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
      </div>

      <p className={styles.helpText}>
        Start typing a city name or click the pin icon to use your current
        location
      </p>
    </div>
  );
};
