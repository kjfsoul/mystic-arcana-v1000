'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BirthData } from "@/lib/astrology/AstronomicalCalculator";
import { CompatibilityReport } from "./CompatibilityReport";

interface CompatibilityInsightsProps {
  userBirthData: BirthData;
  onBack: () => void;
}

interface Person2Data {
  name: string;
  date: string;
  city: string;
  country: string;
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
    country: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (person2Data.name && person2Data.date && person2Data.city) {
      setShowForm(false);
    }
  };

  const handleFormChange = (field: keyof Person2Data, value: string) => {
    setPerson2Data(prev => ({ ...prev, [field]: value }));
  };

  const handleBackToForm = () => {
    setShowForm(true);
  };

  if (!showForm && person2Data.name) {
    // Convert person2Data to BirthData format
    const person2BirthData: BirthData = {
      name: person2Data.name,
      date: new Date(person2Data.date),
      city: person2Data.city,
      country: person2Data.country,
      latitude: 0, // Will be geocoded by the API
      longitude: 0, // Will be geocoded by the API
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Birth City
                </label>
                <input
                  type="text"
                  value={person2Data.city}
                  onChange={(e) => handleFormChange('city', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:border-purple-400 focus:outline-none"
                  placeholder="City of birth"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={person2Data.country}
                  onChange={(e) => handleFormChange('country', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:border-purple-400 focus:outline-none"
                  placeholder="Country"
                  required
                />
              </div>
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