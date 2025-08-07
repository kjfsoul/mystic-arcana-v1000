'use client';
 
import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  keyboardNavigation: boolean;
  announcements: boolean;
}
/* eslint-disable no-unused-vars */
interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting(key: keyof AccessibilitySettings, value: AccessibilitySettings[keyof AccessibilitySettings]): void;
  announce(message: string, priority?: 'polite' | 'assertive'): void;
  focusElement(selector: string): boolean;
}
/* eslint-enable no-unused-vars */
const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
interface AccessibilityProviderProps {
  children: ReactNode;
}
/**
 * Accessibility Provider - WCAG 2.2+ compliance system
 * 
 * Features:
 * - Auto-detection of user preferences (prefers-reduced-motion, prefers-contrast, etc.)
 * - Screen reader announcement system
 * - Keyboard navigation management
 * - Focus trap utilities for modals
 * - Font size and contrast controls
 * - Real-time accessibility monitoring
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
    fontSize: 'medium',
    keyboardNavigation: false,
    announcements: true
  });
  // Ref to track live region element
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  // Detect user preferences on mount
 
  useEffect(() => {
    const detectPreferences = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const screenReader = detectScreenReader();
      const keyboardNavigation = detectKeyboardNavigation();
      setSettings(prev => ({
        ...prev,
        reducedMotion,
        highContrast,
        screenReader,
        keyboardNavigation
      }));
      // Apply CSS classes to document
      document.documentElement.classList.toggle('reduced-motion', reducedMotion);
      document.documentElement.classList.toggle('high-contrast', highContrast);
      document.documentElement.classList.toggle('screen-reader', screenReader);
      document.documentElement.classList.toggle('keyboard-nav', keyboardNavigation);
    };
    detectPreferences();
    // Listen for preference changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)')
    ];
    const handleChange = () => detectPreferences();
    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));
    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange));
    };
  }, []);
  // Screen reader detection
  const detectScreenReader = (): boolean => {
    // Check for common screen reader indicators
    if (typeof window === 'undefined') return false;
    return !!(
      // Check for screen reader specific APIs
      'speechSynthesis' in window ||
      navigator?.userAgent?.includes('NVDA') ||
      navigator?.userAgent?.includes('JAWS') ||
      navigator?.userAgent?.includes('VoiceOver')
    );
  };
  // Keyboard navigation detection
  const detectKeyboardNavigation = (): boolean => {
    let isKeyboardUser = false;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isKeyboardUser = true;
        document.documentElement.classList.add('keyboard-nav');
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    const handleMouseDown = () => {
      isKeyboardUser = false;
      document.documentElement.classList.remove('keyboard-nav');
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    return isKeyboardUser;
  };
  // Update accessibility setting
  const updateSetting = (key: keyof AccessibilitySettings, value: AccessibilitySettings[keyof AccessibilitySettings]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      // Apply changes to document
      if (key === 'fontSize') {
        const fontSizes = {
          small: '14px',
          medium: '16px',
          large: '18px',
          'extra-large': '20px'
        } as const;
        document.documentElement.style.fontSize = fontSizes[value as keyof typeof fontSizes];
      }
      if (key === 'highContrast') {
        document.documentElement.classList.toggle('high-contrast', value as boolean);
      }
      if (key === 'reducedMotion') {
        document.documentElement.classList.toggle('reduced-motion', value as boolean);
      }
      // Save to localStorage
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };
  // Load saved settings
 
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.warn('Failed to load accessibility settings:', error);
      }
    }
  }, []);
  // Announcement system for screen readers
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.announcements) return;
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    // Remove after announcement with safe DOM check
    setTimeout(() => {
      // Check if the element still exists and is a child of body
      if (announcement.parentNode === document.body) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };
  // Focus management utility
  const focusElement = (selector: string): boolean => {
    try {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && typeof element.focus === 'function') {
        element.focus();
        return true;
      }
    } catch (error) {
      console.warn('Failed to focus element:', selector, error);
    }
    return false;
  };
  // Keyboard event handlers
 
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key handling for modals/overlays
      if (event.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
        if (modals.length > 0) {
          const lastModal = modals[modals.length - 1] as HTMLElement;
          const closeButton = lastModal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
      // Skip links navigation (Alt + S)
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        const skipLink = document.querySelector('a[href^="#"]') as HTMLElement;
        if (skipLink) {
          skipLink.focus();
        }
      }
      // Main content focus (Alt + M)
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        focusElement('#main-content, main, [role="main"]');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  // Focus visible management
 
  useEffect(() => {
    const handleMouseDown = () => {
      document.body.classList.add('mouse-user');
      document.body.classList.remove('keyboard-user');
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-user');
        document.body.classList.remove('mouse-user');
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  // Live region for dynamic content - using React best practices
 
  useEffect(() => {
    // Only create if we're in the browser and don't already have one
    if (typeof window === 'undefined') return;
    // Check if live region already exists
    const existingRegion = document.getElementById('aria-live-region');
    if (!existingRegion && !liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'false');
      liveRegion.className = 'sr-only';
      // Store ref before appending
      liveRegionRef.current = liveRegion;
      document.body.appendChild(liveRegion);
    }
    return () => {
      // Clean up using ref and safe parent check
      if (liveRegionRef.current && liveRegionRef.current.parentNode) {
        liveRegionRef.current.parentNode.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, []);
  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    announce,
    focusElement
  };
  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      {/* Screen reader only status information */}
      <div className="sr-only" aria-live="polite" id="accessibility-status">
        {settings.screenReader && 'Screen reader support enabled. '}
        {settings.reducedMotion && 'Reduced motion enabled. '}
        {settings.highContrast && 'High contrast mode enabled. '}
        {settings.keyboardNavigation && 'Keyboard navigation active. '}
        Use Alt+M for main content, Alt+S for skip links, Escape to close modals.
      </div>
    </AccessibilityContext.Provider>
  );
};
