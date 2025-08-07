"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./UserTimeline.module.css";
export interface LifeEvent {
  id: string;
  year: number;
  month?: number;
  title: string;
  category: string;
  description?: string;
  significance: "low" | "medium" | "high" | "transformative";
}
interface UserTimelineProps {
  events?: LifeEvent[];
  onEventsChange?: (events: LifeEvent[]) => void;
  className?: string;
}
const EVENT_CATEGORIES = [
  "Birth & Family",
  "Education",
  "Career",
  "Relationships",
  "Health",
  "Travel",
  "Spiritual",
  "Creative",
  "Financial",
  "Loss & Challenges",
  "Achievements",
  "Other",
];
const SIGNIFICANCE_LEVELS = [
  { value: "low", label: "Minor", color: "#87CEEB" },
  { value: "medium", label: "Moderate", color: "#DDA0DD" },
  { value: "high", label: "Major", color: "#FF69B4" },
  { value: "transformative", label: "Life-Changing", color: "#FFD700" },
];
export const UserTimeline: React.FC<UserTimelineProps> = ({
  events = [],
  onEventsChange,
  className,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<LifeEvent>>({
    title: "",
    year: new Date().getFullYear(),
    category: EVENT_CATEGORIES[0],
    significance: "medium",
    description: "",
  });
  const sortedEvents = [...events].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (a.month || 0) - (b.month || 0);
  });
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.year) return;
    const event: LifeEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      year: newEvent.year,
      month: newEvent.month,
      category: newEvent.category || EVENT_CATEGORIES[0],
      significance:
        (newEvent.significance as LifeEvent["significance"]) || "medium",
      description: newEvent.description,
    };
    const updatedEvents = [...events, event];
    onEventsChange?.(updatedEvents);
    setNewEvent({
      title: "",
      year: new Date().getFullYear(),
      category: EVENT_CATEGORIES[0],
      significance: "medium",
      description: "",
    });
    setShowAddForm(false);
  };
  const handleEditEvent = (event: LifeEvent) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowAddForm(true);
  };
  const handleUpdateEvent = () => {
    if (!editingEvent || !newEvent.title || !newEvent.year) return;
    const updatedEvent: LifeEvent = {
      ...editingEvent,
      title: newEvent.title,
      year: newEvent.year,
      month: newEvent.month,
      category: newEvent.category || EVENT_CATEGORIES[0],
      significance:
        (newEvent.significance as LifeEvent["significance"]) || "medium",
      description: newEvent.description,
    };
    const updatedEvents = events.map((e) =>
      e.id === editingEvent.id ? updatedEvent : e,
    );
    onEventsChange?.(updatedEvents);
    setEditingEvent(null);
    setNewEvent({
      title: "",
      year: new Date().getFullYear(),
      category: EVENT_CATEGORIES[0],
      significance: "medium",
      description: "",
    });
    setShowAddForm(false);
  };
  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter((e) => e.id !== eventId);
    onEventsChange?.(updatedEvents);
  };
  const getSignificanceColor = (significance: LifeEvent["significance"]) => {
    return (
      SIGNIFICANCE_LEVELS.find((level) => level.value === significance)
        ?.color || "#DDA0DD"
    );
  };
  const renderEventForm = () => (
    <motion.div
      className={styles.eventForm}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.formHeader}>
        <h4>{editingEvent ? "Edit Life Event" : "Add Life Event"}</h4>
        <button
          className={styles.closeButton}
          onClick={() => {
            setShowAddForm(false);
            setEditingEvent(null);
            setNewEvent({
              title: "",
              year: new Date().getFullYear(),
              category: EVENT_CATEGORIES[0],
              significance: "medium",
              description: "",
            });
          }}
        >
          ✕
        </button>
      </div>
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label>Event Title *</label>
          <input
            type="text"
            value={newEvent.title || ""}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            placeholder="e.g., Started college, Got married, Changed career"
            required
          />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label>Year *</label>
            <input
              type="number"
              value={newEvent.year || ""}
              onChange={(e) =>
                setNewEvent({ ...newEvent, year: parseInt(e.target.value) })
              }
              min="1900"
              max={new Date().getFullYear() + 10}
              required
            />
          </div>
          <div className={styles.formField}>
            <label>Month (Optional)</label>
            <select
              value={newEvent.month || ""}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  month: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            >
              <option value="">Select month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleDateString("en-US", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label>Category</label>
            <select
              value={newEvent.category || EVENT_CATEGORIES[0]}
              onChange={(e) =>
                setNewEvent({ ...newEvent, category: e.target.value })
              }
            >
              {EVENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formField}>
            <label>Significance</label>
            <select
              value={newEvent.significance || "medium"}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  significance: e.target.value as LifeEvent["significance"],
                })
              }
            >
              {SIGNIFICANCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.formField}>
          <label>Description (Optional)</label>
          <textarea
            value={newEvent.description || ""}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
            placeholder="Add more details about this event and its impact on your life..."
            rows={3}
          />
        </div>
      </div>
      <div className={styles.formActions}>
        <button
          className={styles.saveButton}
          onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
          disabled={!newEvent.title || !newEvent.year}
        >
          {editingEvent ? "Update Event" : "Add Event"}
        </button>
        <button
          className={styles.cancelButton}
          onClick={() => {
            setShowAddForm(false);
            setEditingEvent(null);
          }}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3>✨ Your Life Journey Timeline</h3>
          <p className={styles.subtitle}>
            Map the key moments and transformative events that shaped who you
            are today
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          + Add Life Event
        </button>
      </div>
      <AnimatePresence>{showAddForm && renderEventForm()}</AnimatePresence>
      {sortedEvents.length === 0 && !showAddForm && (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.emptyIcon}>📅</div>
          <h4>Your timeline awaits</h4>
          <p>
            Start mapping your life journey by adding significant events and
            milestones.
          </p>
          <button
            className={styles.addFirstButton}
            onClick={() => setShowAddForm(true)}
          >
            Add Your First Event
          </button>
        </motion.div>
      )}
      {sortedEvents.length > 0 && (
        <div className={styles.timeline}>
          <div className={styles.timelineAxis} />
          {sortedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className={styles.timelineEvent}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={styles.eventMarker}
                style={{
                  backgroundColor: getSignificanceColor(event.significance),
                }}
              />
              <div
                className={`${styles.eventCard} ${index % 2 === 0 ? styles.left : styles.right}`}
              >
                <div className={styles.eventHeader}>
                  <div className={styles.eventDate}>
                    {event.month
                      ? `${new Date(2000, event.month - 1).toLocaleDateString("en-US", { month: "short" })} `
                      : ""}
                    {event.year}
                  </div>
                  <div className={styles.eventActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditEvent(event)}
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h4 className={styles.eventTitle}>{event.title}</h4>
                <div className={styles.eventMeta}>
                  <span className={styles.eventCategory}>{event.category}</span>
                  <span
                    className={styles.eventSignificance}
                    style={{ color: getSignificanceColor(event.significance) }}
                  >
                    {
                      SIGNIFICANCE_LEVELS.find(
                        (level) => level.value === event.significance,
                      )?.label
                    }
                  </span>
                </div>
                {event.description && (
                  <p className={styles.eventDescription}>{event.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {sortedEvents.length > 0 && (
        <div className={styles.timelineInsights}>
          <h4>🔮 Timeline Insights</h4>
          <div className={styles.insights}>
            <div className={styles.insight}>
              <span className={styles.insightLabel}>Total Events:</span>
              <span className={styles.insightValue}>{sortedEvents.length}</span>
            </div>
            <div className={styles.insight}>
              <span className={styles.insightLabel}>
                Life-Changing Moments:
              </span>
              <span className={styles.insightValue}>
                {
                  sortedEvents.filter(
                    (e) => e.significance === "transformative",
                  ).length
                }
              </span>
            </div>
            <div className={styles.insight}>
              <span className={styles.insightLabel}>Most Active Period:</span>
              <span className={styles.insightValue}>
                {sortedEvents.length > 0
                  ? Object.entries(
                      sortedEvents.reduce(
                        (acc, event) => {
                          const decade = Math.floor(event.year / 10) * 10;
                          acc[decade] = (acc[decade] || 0) + 1;
                          return acc;
                        },
                        {} as Record<number, number>,
                      ),
                    ).sort(([, a], [, b]) => b - a)[0]?.[0] + "s"
                  : "N/A"}
              </span>
            </div>
          </div>
          <p className={styles.insightNote}>
            Your timeline will help reveal patterns and themes for deeper
            astrological analysis in the Advanced Chart.
          </p>
        </div>
      )}
    </div>
  );
};
