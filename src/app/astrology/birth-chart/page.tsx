"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { InteractiveBirthChart } from "@/components/astrology/InteractiveBirthChart";
import { BirthData } from "@/types/astrology";
import {
  PlanetPosition,
  HousePosition,
} from "@/lib/astrology/AstronomicalCalculator";
export default function BirthChartPage() {
  const [birthData, setBirthData] = useState<BirthData>({
    name: "Sample Person",
    birthDate: "1990-06-15T14:30:00Z", // Required string field
    birthTime: "14:30",
    birthLocation: "New York, NY, USA",
    date: new Date("1990-06-15T14:30:00Z"), // For backward compatibility
    latitude: 40.7128, // New York City
    longitude: -74.006,
    timezone: "America/New_York",
    city: "New York",
    country: "United States",
  });
  const [formData, setFormData] = useState({
    date: "1990-06-15",
    time: "14:30",
    latitude: "40.7128",
    longitude: "-74.0060",
    timezone: "America/New_York",
  });
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const combinedDateTime = new Date(`${formData.date}T${formData.time}:00`);

    setBirthData({
      name: "Form Input",
      birthDate: combinedDateTime.toISOString(),
      birthTime: formData.time,
      birthLocation: "Unknown Location",
      date: combinedDateTime,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      timezone: formData.timezone,
      city: "Unknown", // Would need to be geocoded
      country: "Unknown",
    });
  };
  const handlePlanetClick = (planet: PlanetPosition) => {
    console.log("Planet clicked:", planet);
  };
  const handleHouseClick = (house: HousePosition) => {
    console.log("House clicked:", house);
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgba(25, 25, 112, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%)",
        padding: "2rem",
        color: "white",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            textAlign: "center",
            marginBottom: "2rem",
            background: "linear-gradient(45deg, #FFD700, #DDA0DD)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Interactive Birth Chart
        </h1>

        {/* Birth Data Form */}
        <motion.form
          onSubmit={handleFormSubmit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: "rgba(138, 43, 226, 0.1)",
            border: "1px solid rgba(138, 43, 226, 0.3)",
            borderRadius: "15px",
            padding: "1.5rem",
            marginBottom: "2rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <h3 style={{ marginBottom: "1rem", color: "#DDA0DD" }}>
            Enter Birth Information
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#DDA0DD",
                }}
              >
                Birth Date:
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  background: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#DDA0DD",
                }}
              >
                Birth Time:
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  background: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#DDA0DD",
                }}
              >
                Latitude:
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                placeholder="40.7128"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  background: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#DDA0DD",
                }}
              >
                Longitude:
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                placeholder="-74.0060"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                  background: "rgba(0, 0, 0, 0.3)",
                  color: "white",
                }}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 2rem",
              background: "linear-gradient(45deg, #FFD700, #FFA500)",
              color: "#191970",
              border: "none",
              borderRadius: "25px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Calculate Chart
          </motion.button>
        </motion.form>
        {/* Interactive Birth Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <InteractiveBirthChart
            birthData={birthData}
            onPlanetClick={handlePlanetClick}
            onHouseClick={handleHouseClick}
          />
        </motion.div>
        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            background: "rgba(72, 61, 139, 0.1)",
            border: "1px solid rgba(72, 61, 139, 0.3)",
            borderRadius: "15px",
            padding: "1.5rem",
            marginTop: "2rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <h3 style={{ marginBottom: "1rem", color: "#DDA0DD" }}>
            How to Use the Interactive Chart
          </h3>
          <ul style={{ lineHeight: "1.6", color: "#C0C0C0" }}>
            <li>
              🪐 <strong>Click any planet</strong> to see detailed information
              about its position and meaning
            </li>
            <li>
              🏠 <strong>Click house numbers</strong> to learn about different
              life areas
            </li>
            <li>
              ♈ <strong>Click zodiac symbols</strong> to explore sign
              characteristics
            </li>
            <li>
              ▶️ <strong>Use the animation toggle</strong> to start/stop
              planetary movements
            </li>
            <li>
              📱 <strong>Touch and zoom</strong> on mobile devices for better
              interaction
            </li>
            <li>
              🔄 <strong>Update birth data</strong> above to generate your
              personal chart
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
