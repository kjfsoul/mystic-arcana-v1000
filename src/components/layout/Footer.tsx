"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-3 bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
                Mystic Arcana
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Your AI-powered gateway to tarot wisdom and astrological
                insights. Discover the cosmic patterns that guide your journey
                through the stars.
              </p>
              <div className="flex space-x-4">
                <motion.div
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🔮
                </motion.div>
                <motion.div
                  className="text-2xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  ✨
                </motion.div>
                <motion.div
                  className="text-2xl"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  🌙
                </motion.div>
              </div>
            </motion.div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/galaxy-view"
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm"
                >
                  Galaxy View
                </Link>
              </li>
              <li>
                <Link
                  href="/astronomical-demo"
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm"
                >
                  Astronomical Demo
                </Link>
              </li>
            </ul>
          </div>
          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm flex items-center"
                >
                  <span className="mr-2">🔒</span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center"
                >
                  <span className="mr-2">📜</span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm flex items-center"
                >
                  <span className="mr-2">🍪</span>
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/disclaimer"
                  className="text-gray-300 hover:text-rose-400 transition-colors text-sm flex items-center"
                >
                  <span className="mr-2">⚠️</span>
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Mystic Arcana, LLC. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Made with</span>
            <motion.span
              className="text-red-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              ❤️
            </motion.span>
            <span className="text-gray-400 text-sm">and cosmic energy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
