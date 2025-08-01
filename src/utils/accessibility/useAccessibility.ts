import { useCallback, useEffect, useRef } from 'react';

interface AccessibilityOptions {
  announceDelay?: number;
  politeness?: 'polite' | 'assertive';
}

/**
 * useAccessibility Hook
 * 
 * Provides accessibility utilities for screen reader announcements,
 * focus management, and keyboard navigation.
 * 
 * Features:
 * - Live region announcements for dynamic content
 * - Focus trap management for modals
 * - Keyboard navigation helpers
 * - ARIA attribute management
 */
export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const { announceDelay = 100, politeness = 'polite' } = options;
  const announcerRef = useRef<HTMLDivElement | null>(null);
  const focusTrapRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Create screen reader announcer element
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', politeness);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current && document.body.contains(announcerRef.current)) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, [politeness]);

  // Announce message to screen readers
// eslint-disable-next-line react-hooks/exhaustive-deps
  const announceToScreenReader = useCallback((message: string) => {
    if (announcerRef.current) {
      // Clear previous announcement
      announcerRef.current.textContent = '';

      // Set new announcement after delay to ensure it's read
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      }, announceDelay);
    }
  }, [announceDelay]);

  // Release focus trap and restore previous focus
// eslint-disable-next-line react-hooks/exhaustive-deps
  const releaseFocusTrap = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
    focusTrapRef.current = null;
  }, []);

  // Create focus trap for modals/overlays
// eslint-disable-next-line react-hooks/exhaustive-deps
  const createFocusTrap = useCallback((element: HTMLElement) => {
    // Store current focus
    previousFocusRef.current = document.activeElement as HTMLElement;
    focusTrapRef.current = element;

    // Get all focusable elements
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element
    firstFocusable?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        releaseFocusTrap();
      }
    };

    element.addEventListener('keydown', handleTabKey);
    element.addEventListener('keydown', handleEscapeKey);

    return () => {
      element.removeEventListener('keydown', handleTabKey);
      element.removeEventListener('keydown', handleEscapeKey);
    };
  }, [releaseFocusTrap]);

  // Get appropriate ARIA label for interactive elements
// eslint-disable-next-line react-hooks/exhaustive-deps
  const getAriaLabel = useCallback((elementType: string, context: string) => {
    const labels: Record<string, string> = {
      'tarot-card': `Select ${context} tarot card`,
      'planet': `View details for ${context}`,
      'chat-input': `Type your message to ${context}`,
      'spread-position': `${context} position in spread`,
      'cosmic-weather': `Current cosmic weather: ${context}`,
    };

    return labels[elementType] || context;
  }, []);

  // Check if user prefers reduced motion
// eslint-disable-next-line react-hooks/exhaustive-deps
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Keyboard navigation helper
// eslint-disable-next-line react-hooks/exhaustive-deps
  const handleKeyboardNavigation = useCallback((
    e: React.KeyboardEvent,
    callbacks: {
      onEnter?: () => void;
      onSpace?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
    }
  ) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        callbacks.onEnter?.();
        break;
      case ' ':
        e.preventDefault();
        callbacks.onSpace?.();
        break;
      case 'Escape':
        e.preventDefault();
        callbacks.onEscape?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        callbacks.onArrowUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        callbacks.onArrowDown?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        callbacks.onArrowLeft?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        callbacks.onArrowRight?.();
        break;
    }
  }, []);

  return {
    announceToScreenReader,
    createFocusTrap,
    releaseFocusTrap,
    getAriaLabel,
    prefersReducedMotion,
    handleKeyboardNavigation,
  };
};