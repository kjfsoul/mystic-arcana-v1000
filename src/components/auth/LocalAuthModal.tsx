"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./LocalAuthModal.module.css";
interface LocalAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}
/**
 * Local Authentication Modal
 *
 * Provides a simple, beautiful authentication interface that works without external services.
 * Features:
 * - Sign in / Sign up forms
 * - Guest access option
 * - Smooth animations
 * - Error handling
 * - Responsive design
 */
export const LocalAuthModal: React.FC<LocalAuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = "signin",
}) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        // Validation for signup
        if (!formData.name.trim()) {
          setError("Name is required");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }
        const result = await signUp(formData.email, formData.password);
        if (result.error) {
          setError(result.error.message || "Failed to create account");
        } else {
          onClose();
        }
      } else {
        // Sign in
        const result = await signIn(formData.email, formData.password);
        if (result.error) {
          setError(result.error.message || "Failed to sign in");
        } else {
          onClose();
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  const handleGuestAccess = () => {
    // For now, just close the modal - guest access can be implemented later
    onClose();
  };
  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
    setFormData({
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    });
  };
  if (!isOpen) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <AnimatePresence>
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>
              {mode === "signin" ? "🌟 Welcome Back" : "✨ Join Mystic Arcana"}
            </h2>
            <p className={styles.subtitle}>
              {mode === "signin"
                ? "Sign in to access your cosmic journey"
                : "Create your account to unlock the full experience"}
            </p>
            <button className={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          </div>
          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Your mystical name"
                  required
                />
              </div>
            )}
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {mode === "signup" && (
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}
            {error && <div className={styles.error}>⚠️ {error}</div>}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.loading}>
                  <span className={styles.spinner}>✨</span>
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </span>
              ) : mode === "signin" ? (
                "🔮 Sign In"
              ) : (
                "🌟 Create Account"
              )}
            </button>
          </form>
          {/* Divider */}
          <div className={styles.divider}>
            <span>or</span>
          </div>
          {/* Guest Access */}
          <button
            type="button"
            className={styles.guestButton}
            onClick={handleGuestAccess}
          >
            👤 Continue as Guest
          </button>
          {/* Mode Switch */}
          <div className={styles.modeSwitch}>
            <p>
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
              <button
                type="button"
                className={styles.switchButton}
                onClick={switchMode}
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
          {/* Features */}
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🃏</span>
              <span>Unlimited tarot readings</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⭐</span>
              <span>Personalized astrology</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>💾</span>
              <span>Save your readings</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
