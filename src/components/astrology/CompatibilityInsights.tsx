'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BirthData } from "@/lib/astrology/AstronomicalCalculator";
import { CompatibilityReport } from "./CompatibilityReport";
import { LocationInput } from "@/components/forms/LocationInput";
interface CompatibilityInsightsProps {
  userBirthData: BirthData;
  onBack: () => void;
}
interface Person2Data {
  name: string;
  date: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}
export const CompatibilityInsights: React.FC<CompatibilityInsightsProps> = ({
  userBirthData,
  onBack,
}) => {
  const [showForm, setShowForm] = useState(true);
  const [person2Data, setPerson2Data] = useState<Person2Data>({
    name: '',
    date: '',
    city: '',
    country: '',
    latitude: 0,
    longitude: 0
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (person2Data.name && person2Data.date && person2Data.city && person2Data.latitude && person2Data.longitude) {
      setShowForm(false);
    }
  };
  const handleFormChange = (field: keyof Person2Data, value: string) => {
    setPerson2Data(prev => ({ ...prev, [field]: value }));
  };
  const handleLocationSelect = (location: { city: string; country: string; latitude: number; longitude: number }) => {
    setPerson2Data(prev => ({
      ...prev,
      city: location.city,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude
    }));
  };
  const handleBackToForm = () => {
    setShowForm(true);
  };
  if (!showForm && person2Data.name) {
    // Convert person2Data to BirthData format
    const person2BirthData: BirthData = {
      name: person2Data.name,
      birthDate: (() => {
        const date = person2Data.date;
        if (typeof date === 'string') return date;
        if (date && typeof date === 'object' && 'toISOString' in date) {
          return (date as Date).toISOString();
        }
        return String(date);
      })(),
      date: new Date(person2Data.date),
      city: person2Data.city,
      country: person2Data.country,
      latitude: person2Data.latitude,
      longitude: person2Data.longitude,
      timezone: 'UTC'
    };
    return (
      <CompatibilityReport
        person1Data={userBirthData}
        person2Data={person2BirthData}
        onBack={handleBackToForm}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            ← Back to Astrology
          </button>
          
          <h1 className="text-3xl font-bold text-white text-center flex-1">
            💫 Compatibility Analysis
          </h1>
          
          <div className="w-24"></div> {/* Spacer */}
        </motion.div>
        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Enter Partner&apos;s Birth Information
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Partner&apos;s Name
              </label>
              <input
                type="text"
                value={person2Data.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:border-purple-400 focus:outline-none"
                placeholder="Enter partner&apos;s name"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Birth Date & Time
              </label>
              <input
                type="datetime-local"
                value={person2Data.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:border-purple-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Birth Location
              </label>
              <LocationInput
                onLocationSelect={handleLocationSelect}
                initialValue={person2Data.city ? `${person2Data.city}, ${person2Data.country}` : ''}
                placeholder="Enter birth city, country"
                className="w-full"
              />
              {person2Data.city && (
                <p className="text-white/60 text-sm mt-2">
                  Selected: {person2Data.city}, {person2Data.country}
                </p>
              )}
            </div>
            <motion.button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Calculate Compatibility ✨
            </motion.button>
          </form>
          <div className="mt-6 text-center text-white/60 text-sm">
            <p>⭐ Analysis uses authentic astronomical calculations with Swiss Ephemeris data</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
