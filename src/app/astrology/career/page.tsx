"use client";

import React, { useState, useEffect } from "react";
import { InteractiveCareerInsights } from "@/components/astrology/InteractiveCareerInsights";
import { BirthData } from "@/lib/astrology/AstronomicalCalculator";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
interface UserProfile {
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  latitude: number | null;
  longitude: number | null;
}
export default function CareerPage() {
  const [, setProfile] = useState<UserProfile | null>(null);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Please sign in to view your career insights");
          setLoading(false);
          return;
        }
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("birth_date, birth_time, birth_location, latitude, longitude")
          .eq("user_id", user.id)
          .single();
        if (profileError || !profileData) {
          setError("Profile not found. Please complete your profile first.");
          setLoading(false);
          return;
        }
        if (
          !profileData.birth_date ||
          !profileData.latitude ||
          !profileData.longitude
        ) {
          setError(
            "Birth information incomplete. Please complete your profile first.",
          );
          setLoading(false);
          return;
        }
        setProfile(profileData);
        // Convert to BirthData format
        const birthDateTime = new Date(
          `${profileData.birth_date}T${profileData.birth_time || "12:00:00"}`,
        );

        const formattedBirthData: BirthData = {
          name: "User",
          birthDate: birthDateTime.toISOString(), // Required string field
          birthTime: profileData.birth_time || "12:00:00",
          birthLocation: profileData.birth_location || "Unknown",
          date: birthDateTime, // For backward compatibility
          latitude: profileData.latitude,
          longitude: profileData.longitude,
          timezone: "UTC",
          city: profileData.birth_location || "Unknown",
          country: "Unknown",
        };
        setBirthData(formattedBirthData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadUserProfile();
  }, []);
  // handleBack function removed - using inline back navigation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">🔮</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Career Insights
            </h1>
            <p className="text-white/70">
              Loading your cosmic career blueprint...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Career Insights
            </h1>
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-6">
              <p className="text-red-200 mb-4">{error}</p>
              {error.includes("Profile") && (
                <Link
                  href="/profile"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Complete Profile →
                </Link>
              )}
              {error.includes("sign in") && (
                <Link
                  href="/auth/signin"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Sign In →
                </Link>
              )}
            </div>
            <button
              onClick={() => window.history.back()}
              className="text-white/70 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        </div>
      </div>
    );
  }
  if (!birthData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Career Insights Unavailable
            </h1>
            <p className="text-white/70 mb-6">
              Unable to generate career insights without complete birth data.
            </p>
            <Link
              href="/profile"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Complete Profile →
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <InteractiveCareerInsights birthData={birthData} />
    </div>
  );
}
