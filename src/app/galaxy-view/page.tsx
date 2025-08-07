"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { HighPerformanceStarField } from "../../components/astronomical/HighPerformanceStarField/HighPerformanceStarField";
import { GalaxyBackground } from "../../components/effects/GalaxyBackground/GalaxyBackground";
import styles from "./page.module.css";
export default function GalaxyView() {
  const router = useRouter();
  const [viewPerspective, setViewPerspective] = useState<
    "earth" | "moon" | "mars" | "deep-space"
  >("earth");
  const [showStarField, setShowStarField] = useState(true);
  const handleBackToLobby = () => {
    router.push("/");
  };
  const perspectives = [
    {
      id: "earth",
      name: "🌍 Earth View",
      description: "Your current perspective",
    },
    { id: "moon", name: "🌙 Moon View", description: "Lunar perspective" },
    {
      id: "mars",
      name: "♂️ Mars Perspective",
      description: "The red planet view",
    },
    {
      id: "deep-space",
      name: "🌌 Deep Space",
      description: "Beyond the solar system",
    },
  ];
  return (
    <div className={styles.container}>
      {/* Background Layers */}
      <div className={styles.backgroundLayer}>
        <GalaxyBackground intensity={1.0} showMilkyWay={true} animated={true} />
      </div>

      {showStarField && (
        <div className={styles.starFieldLayer}>
          <HighPerformanceStarField
            renderConfig={{
              maxStars: viewPerspective === "deep-space" ? 200000 : 100000,
              minMagnitude: viewPerspective === "deep-space" ? 7.0 : 6.5,
            }}
          />
        </div>
      )}
      {/* UI Overlay */}
      <motion.div
        className={styles.uiOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Back Button */}
        <button
          className={styles.backButton}
          onClick={handleBackToLobby}
          aria-label="Back to Cosmic Lobby"
        >
          ← Back
        </button>
        {/* Title */}
        <motion.div
          className={styles.header}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
        >
          <h1 className={styles.title}>Cosmic Explorer</h1>
          <p className={styles.subtitle}>
            Journey through the celestial realms
          </p>
        </motion.div>
        {/* Perspective Controls */}
        <motion.div
          className={styles.controls}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className={styles.controlsTitle}>Choose Your Perspective</h2>
          <div className={styles.perspectiveGrid}>
            {perspectives.map((perspective) => (
              <motion.button
                key={perspective.id}
                className={`${styles.perspectiveButton} ${
                  viewPerspective === perspective.id ? styles.active : ""
                }`}
                onClick={() =>
                  setViewPerspective(
                    perspective.id as "earth" | "moon" | "mars" | "deep-space",
                  )
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={styles.perspectiveName}>
                  {perspective.name}
                </span>
                <span className={styles.perspectiveDesc}>
                  {perspective.description}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
        {/* Toggle Controls */}
        <motion.div
          className={styles.toggles}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={showStarField}
              onChange={(e) => setShowStarField(e.target.checked)}
            />
            <span>High-Performance Stars</span>
          </label>
        </motion.div>
        {/* Impulse Buy Element */}
        <motion.div
          className={styles.specialOffer}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 3, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
        >
          <span className={styles.offerIcon}>✨</span>
          <div className={styles.offerContent}>
            <h3>Cosmic Explorer Bundle</h3>
            <p>Unlock all celestial perspectives</p>
            <button className={styles.offerButton}>Learn More</button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
