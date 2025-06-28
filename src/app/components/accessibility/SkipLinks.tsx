'use client';
import { motion } from 'framer-motion';

export default function SkipLinks() {
  return (
    <motion.a
      href="#main"
      className="sr-only skip-link"
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        background: 'rgba(255, 215, 0, 0.1)',
        padding: '0.5rem',
        zIndex: '1000',
        transition: '0.3s all ease',
      }}
    >
      Skip to main content
    </motion.a>
  );
}
