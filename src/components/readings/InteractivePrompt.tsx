"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InteractionPrompt, UserResponse } from "@/types/UserInteraction";
import { memoryLogger } from "@/lib/mem/memoryLogger";
import { MessageCircle, ChevronRight, Sparkles } from "lucide-react";
import { PromptType } from "@/constants/EventTypes";

interface InteractivePromptProps {
  prompt: InteractionPrompt;
  userId: string;
  sessionId: string;
  readerId: string;
  onResponse?: (response: UserResponse) => void;
  onComplete?: () => void;
  className?: string;
}

export const InteractivePromptComponent: React.FC<InteractivePromptProps> = ({
  prompt,
  userId,
  sessionId,
  readerId,
  onResponse,
  onComplete,
  className = "",
}) => {
  const [response, setResponse] = useState<string | number | boolean>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const startTime = useRef(Date.now());
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    startTime.current = Date.now();
  }, [prompt.id]);

  const handleSubmit = async () => {
    if (!response && !selectedOption) return;

    setIsSubmitting(true);
    const responseTime = Date.now() - startTime.current;

    const userResponse: UserResponse = {
      promptId: prompt.id,
      userId,
      sessionId,
      readerId,
      response: selectedOption || response,
      responseTime,
      timestamp: new Date().toISOString(),
      metadata: prompt.metadata,
    };

    try {
      await memoryLogger.logInteraction(userResponse);

      if (onResponse) {
        onResponse(userResponse);
      }

      setShowThinking(true);
      setTimeout(() => {
        setShowThinking(false);
        if (onComplete) {
          onComplete();
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to log interaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReflectionPrompt = () => (
    <div className="space-y-4">
      <textarea
        value={response as string}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Share your thoughts..."
        className="w-full p-4 bg-black/30 backdrop-blur-sm border border-purple-500/30 
                   rounded-lg text-white placeholder-purple-300/50 resize-none
                   focus:outline-none focus:border-purple-400/50 focus:ring-2 
                   focus:ring-purple-500/20 transition-all duration-300"
        rows={3}
        disabled={isSubmitting}
      />
      <button
        onClick={handleSubmit}
        disabled={!response || isSubmitting}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
                   text-white rounded-lg font-medium disabled:opacity-50 
                   hover:from-purple-700 hover:to-indigo-700 transition-all 
                   duration-300 flex items-center gap-2"
      >
        <span>Share</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {prompt.options?.map((option) => (
        <motion.button
          key={option.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSelectedOption(option.value);
            setResponse(option.value);
            handleSubmit();
          }}
          disabled={isSubmitting}
          className={`w-full p-4 text-left rounded-lg transition-all duration-300
                      ${
                        selectedOption === option.value
                          ? "bg-purple-600/30 border-purple-400"
                          : "bg-black/30 border-purple-500/30 hover:bg-purple-900/20"
                      }
                      border backdrop-blur-sm disabled:opacity-50`}
        >
          <span className="text-white">{option.label}</span>
        </motion.button>
      ))}
    </div>
  );

  const renderScalePrompt = () => {
    const min = prompt.minValue || 1;
    const max = prompt.maxValue || 10;
    const value = (response as number) || min;

    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-purple-300">
          <span>{prompt.labels?.min || min}</span>
          <span className="text-white font-medium">{value}</span>
          <span>{prompt.labels?.max || max}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setResponse(parseInt(e.target.value))}
          className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer
                     slider-thumb"
          disabled={isSubmitting}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
                     text-white rounded-lg font-medium disabled:opacity-50 
                     hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
        >
          Continue
        </button>
      </div>
    );
  };

  const renderBinaryPrompt = () => (
    <div className="flex gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setResponse(true);
          handleSubmit();
        }}
        disabled={isSubmitting}
        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 
                   text-white rounded-lg font-medium disabled:opacity-50 
                   hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
      >
        Yes
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setResponse(false);
          handleSubmit();
        }}
        disabled={isSubmitting}
        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 
                   text-white rounded-lg font-medium disabled:opacity-50 
                   hover:from-red-700 hover:to-pink-700 transition-all duration-300"
      >
        No
      </motion.button>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className={`relative p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 
                    backdrop-blur-md rounded-xl border border-purple-500/30 ${className}`}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <MessageCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-1">
              {prompt.question}
            </h3>
            {prompt.context && (
              <p className="text-sm text-purple-300/70">{prompt.context}</p>
            )}
          </div>
        </div>

        {!showThinking ? (
          <>
            {prompt.type === PromptType.REFLECTION && renderReflectionPrompt()}
            {prompt.type === PromptType.MULTIPLE_CHOICE &&
              renderMultipleChoice()}
            {prompt.type === PromptType.SCALE && renderScalePrompt()}
            {prompt.type === PromptType.BINARY && renderBinaryPrompt()}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-8"
          >
            <div className="flex items-center gap-2 text-purple-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm">
                Sophia is contemplating your response...
              </span>
            </div>
          </motion.div>
        )}

        <div className="absolute -top-2 -right-2">
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InteractivePromptComponent;
