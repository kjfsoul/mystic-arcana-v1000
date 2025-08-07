"use client";
 
import { DrawnCard } from '@/services/tarot/TarotAPIClient';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
interface SessionReading {
  id: string;
  timestamp: Date;
  spreadType: 'single' | 'three-card' | 'celtic-cross';
  cards: DrawnCard[];
  interpretation?: string;
  question?: string;
  notes?: string;
  isSaved: boolean;
}
interface JournalEntry {
  id: string;
  timestamp: Date;
  readingId?: string;
  content: string;
  mood?: string;
  tags: string[];
}
/* eslint-disable no-unused-vars */
interface TarotSessionContextType {
  // Session readings (temporary, before saving to DB)
  sessionReadings: SessionReading[];
  addSessionReading: (reading: Omit<SessionReading, 'id' | 'timestamp' | 'isSaved'>) => string;
  updateSessionReading: (id: string, updates: Partial<SessionReading>) => void;
  markReadingAsSaved: (sessionId: string, savedId: string) => void;
  removeSessionReading: (id: string) => void;
  getSessionReading: (id: string) => SessionReading | undefined;
  // Journal entries (local storage backed)
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => string;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  removeJournalEntry: (id: string) => void;
  getJournalEntriesForReading: (readingId: string) => JournalEntry[];
  // Session stats
  sessionStats: {
    totalReadings: number;
    savedReadings: number;
    unsavedReadings: number;
    journalEntries: number;
    mostUsedSpread: string;
  };
  // Clear session data
  clearSession: () => void;
}
/* eslint-enable no-unused-vars */
const TarotSessionContext = createContext<TarotSessionContextType | undefined>(undefined);
const JOURNAL_STORAGE_KEY = 'tarot_journal_entries';
const SESSION_STORAGE_KEY = 'tarot_session_readings';
export const TarotSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionReadings, setSessionReadings] = useState<SessionReading[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  // Load from local storage on mount
 
  useEffect(() => {
    try {
      // Load journal entries
      const storedJournal = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (storedJournal) {
        const parsed = JSON.parse(storedJournal);
        setJournalEntries(parsed.map((entry: JournalEntry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        })));
      }
      // Load session readings
      const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        setSessionReadings(parsed.map((reading: SessionReading) => ({
          ...reading,
          timestamp: new Date(reading.timestamp)
        })));
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  }, []);
  // Save to storage when data changes
 
  useEffect(() => {
    try {
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(journalEntries));
    } catch (error) {
      console.error('Failed to save journal entries:', error);
    }
  }, [journalEntries]);
 
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionReadings));
    } catch (error) {
      console.error('Failed to save session readings:', error);
    }
  }, [sessionReadings]);
  // Session reading methods
 
  const addSessionReading = useCallback((reading: Omit<SessionReading, 'id' | 'timestamp' | 'isSaved'>) => {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReading: SessionReading = {
      ...reading,
      id,
      timestamp: new Date(),
      isSaved: false
    };
    setSessionReadings(prev => [...prev, newReading]);
    return id;
  }, []);
 
  const updateSessionReading = useCallback((id: string, updates: Partial<SessionReading>) => {
    setSessionReadings(prev => prev.map(reading => 
      reading.id === id ? { ...reading, ...updates } : reading
    ));
  }, []);
 
  const markReadingAsSaved = useCallback(
    (sessionId: string) => {
      updateSessionReading(sessionId, { isSaved: true });
    },
    [updateSessionReading]
  );
 
  const removeSessionReading = useCallback((id: string) => {
    setSessionReadings(prev => prev.filter(reading => reading.id !== id));
  }, []);
 
  const getSessionReading = useCallback((id: string) => {
    return sessionReadings.find(reading => reading.id === id);
  }, [sessionReadings]);
  // Journal entry methods
 
  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const id = `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEntry: JournalEntry = {
      ...entry,
      id,
      timestamp: new Date()
    };
    setJournalEntries(prev => [...prev, newEntry]);
    return id;
  }, []);
 
  const updateJournalEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  }, []);
 
  const removeJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);
 
  const getJournalEntriesForReading = useCallback((readingId: string) => {
    return journalEntries.filter(entry => entry.readingId === readingId);
  }, [journalEntries]);
  // Calculate session stats
  const sessionStats = {
    totalReadings: sessionReadings.length,
    savedReadings: sessionReadings.filter(r => r.isSaved).length,
    unsavedReadings: sessionReadings.filter(r => !r.isSaved).length,
    journalEntries: journalEntries.length,
    mostUsedSpread: sessionReadings.length > 0 
      ? (() => {
          const counts = sessionReadings.reduce((acc, reading) => {
            acc[reading.spreadType] = (acc[reading.spreadType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
        })()
      : 'none'
  };
  // Clear all session data
 
  const clearSession = useCallback(() => {
    setSessionReadings([]);
    setJournalEntries([]);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(JOURNAL_STORAGE_KEY);
  }, []);
  const value: TarotSessionContextType = {
    sessionReadings,
    addSessionReading,
    updateSessionReading,
    markReadingAsSaved,
    removeSessionReading,
    getSessionReading,
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    removeJournalEntry,
    getJournalEntriesForReading,
    sessionStats,
    clearSession
  };
  return (
    <TarotSessionContext.Provider value={value}>
      {children}
    </TarotSessionContext.Provider>
  );
};
export const useTarotSession = () => {
  const context = useContext(TarotSessionContext);
  if (!context) {
    throw new Error('useTarotSession must be used within TarotSessionProvider');
  }
  return context;
};
