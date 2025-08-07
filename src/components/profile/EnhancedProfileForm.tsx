"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Clock, Sparkles, Save } from "lucide-react";
// import { useAuth } from '@/contexts/AuthContext'; // TODO: Re-enable when user context needed
import { useProfileAutofill } from "@/hooks/useProfileAutofill";
import { LocationInput } from "@/components/astrology/LocationInput";
import styles from "./EnhancedProfileForm.module.css";
const tarotReaders = [
  { id: "sage", name: "Sage - The Wisdom Keeper", icon: "🔮" },
  { id: "luna", name: "Luna - The Moon Guide", icon: "🌙" },
  { id: "mystic", name: "Mystic - The Spirit Walker", icon: "✨" },
  { id: "oracle", name: "Oracle - The Truth Seer", icon: "👁️" },
];
interface EnhancedProfileFormProps {
  onComplete?: () => void;
  embedded?: boolean;
}
export const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({
  onComplete,
  embedded = false,
}) => {
  // const { user } = useAuth(); // Removed unused user
  const { profileData, isLoading, error, saveProfile, getAutofillValues } =
    useProfileAutofill({ autoLoad: true });
  // Form state
  const [formData, setFormData] = useState({
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    birthCoordinates: undefined as { lat: number; lng: number } | undefined,
    preferredTarotReader: "sage",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  // Load autofill data when profile loads

  useEffect(() => {
    const autofillData = getAutofillValues();
    setFormData({
      birthDate: autofillData.birthDate || "",
      birthTime: autofillData.birthTime || "",
      birthLocation: autofillData.birthLocation || "",
      birthCoordinates: autofillData.birthCoordinates,
      preferredTarotReader: autofillData.preferredTarotReader || "sage",
    });
  }, [profileData]);
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Birth date is required
    if (!formData.birthDate) {
      errors.birthDate = "Birth date is required";
    }

    // Validate date format and range
    if (formData.birthDate) {
      const date = new Date(formData.birthDate);
      const now = new Date();

      if (isNaN(date.getTime())) {
        errors.birthDate = "Invalid date format";
      } else if (date > now) {
        errors.birthDate = "Birth date cannot be in the future";
      } else if (date < new Date("1900-01-01")) {
        errors.birthDate = "Birth date must be after 1900";
      }
    }

    // Validate time format if provided
    if (
      formData.birthTime &&
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.birthTime)
    ) {
      errors.birthTime = "Invalid time format (use HH:MM)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const success = await saveProfile({
        birthDate: formData.birthDate,
        birthTime: formData.birthTime || undefined,
        birthLocation: formData.birthLocation || undefined,
        birthCoordinates: formData.birthCoordinates,
        preferredTarotReader: formData.preferredTarotReader,
      });

      if (success) {
        setSaveSuccess(true);
        if (onComplete) {
          setTimeout(onComplete, 1500);
        }
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };
  // Handle location change
  const handleLocationChange = (
    location: string,
    coordinates?: { lat: number; lng: number },
  ) => {
    setFormData((prev) => ({
      ...prev,
      birthLocation: location,
      birthCoordinates: coordinates,
    }));
  };
  return (
    <motion.div
      className={`${styles.container} ${embedded ? styles.embedded : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!embedded && (
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Sparkles className="w-6 h-6" />
            Your Cosmic Profile
          </h2>
          <p className={styles.subtitle}>
            Complete your profile to receive personalized cosmic guidance
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Birth Information Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <User className="w-5 h-5" />
            Birth Information
          </h3>
          <p className={styles.sectionDescription}>
            Your birth details allow us to calculate accurate astrological
            charts and provide personalized readings.
          </p>
          <div className={styles.fieldGroup}>
            {/* Birth Date */}
            <div className={styles.field}>
              <label className={styles.label}>
                <Calendar className="w-4 h-4" />
                Birth Date *
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birthDate: e.target.value,
                  }))
                }
                className={styles.input}
                required
                max={new Date().toISOString().split("T")[0]}
                min="1900-01-01"
              />
              {validationErrors.birthDate && (
                <p className={styles.error}>{validationErrors.birthDate}</p>
              )}
            </div>
            {/* Birth Time */}
            <div className={styles.field}>
              <label className={styles.label}>
                <Clock className="w-4 h-4" />
                Birth Time <span className={styles.optional}>(Optional)</span>
              </label>
              <input
                type="time"
                value={formData.birthTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birthTime: e.target.value,
                  }))
                }
                className={styles.input}
                placeholder="HH:MM"
              />
              <p className={styles.helpText}>
                More accurate birth time enables precise rising sign
                calculations
              </p>
              {validationErrors.birthTime && (
                <p className={styles.error}>{validationErrors.birthTime}</p>
              )}
            </div>
          </div>
          {/* Birth Location */}
          <div className={styles.field}>
            <LocationInput
              value={formData.birthLocation}
              onChange={handleLocationChange}
              label="Birth Location"
              placeholder="Enter city name (e.g., Atlanta, GA)"
            />
            <p className={styles.helpText}>
              Helps calculate precise planetary positions for your birth chart
            </p>
          </div>
        </div>
        {/* Reading Preferences Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Sparkles className="w-5 h-5" />
            Reading Preferences
          </h3>

          <div className={styles.field}>
            <label className={styles.label}>Preferred Tarot Reader</label>
            <div className={styles.readerGrid}>
              {tarotReaders.map((reader) => (
                <button
                  key={reader.id}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredTarotReader: reader.id,
                    }))
                  }
                  className={`${styles.readerOption} ${
                    formData.preferredTarotReader === reader.id
                      ? styles.readerSelected
                      : ""
                  }`}
                >
                  <span className={styles.readerIcon}>{reader.icon}</span>
                  <span className={styles.readerName}>{reader.name}</span>
                </button>
              ))}
            </div>
            <p className={styles.helpText}>
              Your chosen reader will provide personalized interpretations
            </p>
          </div>
        </div>
        {/* Error Message */}
        {error && (
          <motion.div
            className={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
        {/* Success Message */}
        {saveSuccess && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ✨ Your cosmic profile has been saved!
          </motion.div>
        )}
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSaving || isLoading}
          className={styles.submitButton}
        >
          {isSaving ? (
            <>
              <div className={styles.spinner} />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Profile
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
