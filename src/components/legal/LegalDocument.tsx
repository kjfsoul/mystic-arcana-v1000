"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
interface LegalDocumentProps {
  content: string;
  title: string;
}
export const LegalDocument: React.FC<LegalDocumentProps> = ({
  content,
  title,
}) => {
  const [stars, setStars] = useState<
    Array<{ left: number; top: number; duration: number; delay: number }>
  >([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Generate star positions only on client side to avoid hydration mismatch
    const starData = Array.from({ length: 50 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
    setStars(starData);
    setMounted(true);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      {/* Background Stars - Only render after mount to avoid hydration issues */}
      {mounted && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {stars.map((star, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
              }}
            />
          ))}
        </div>
      )}
      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-purple-400 mx-auto rounded-full"></div>
        </motion.div>
        {/* Legal Document Content */}
        <motion.div
          className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="prose prose-invert prose-lg max-w-none text-gray-100 prose-headings:text-white prose-headings:font-semibold prose-a:text-amber-400 prose-a:hover:text-amber-300 prose-strong:text-white prose-table:text-gray-200 prose-th:text-white prose-th:border-white/20 prose-td:border-white/10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </motion.div>
        {/* Back to Home Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Mystic Arcana
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};
