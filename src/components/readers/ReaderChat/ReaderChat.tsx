"use client";
import React, { useState, useRef } from "react";
import { useAccessibility } from "../../../utils/accessibility/useAccessibility";
import styles from "./ReaderChat.module.css";
interface ReaderChatProps {
  onSendMessage: (_message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}
/**
 * ReaderChat Component
 *
 * Chat interface for communicating with the virtual reader.
 * Includes accessibility features and keyboard shortcuts.
 */
export const ReaderChat: React.FC<ReaderChatProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Ask your question to the cosmos...",
  className = "",
}) => {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { handleKeyboardNavigation } = useAccessibility();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't send while composing (for international keyboards)
    if (isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    handleKeyboardNavigation(e, {
      onEscape: () => {
        setMessage("");
        textareaRef.current?.blur();
      },
    });
  };
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };
  const quickQuestions = [
    "What does my future hold?",
    "What should I focus on today?",
    "How can I find clarity?",
    "What energy surrounds me now?",
  ];
  const handleQuickQuestion = (question: string) => {
    if (!disabled) {
      onSendMessage(question);
    }
  };
  return (
    <div className={`${styles.chatContainer} ${className}`}>
      {/* Quick question buttons */}
      <div
        className={styles.quickQuestions}
        role="group"
        aria-label="Quick questions"
      >
        {quickQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuickQuestion(question)}
            disabled={disabled}
            className={styles.quickButton}
            type="button"
          >
            {question}
          </button>
        ))}
      </div>
      {/* Main chat input */}
      <form onSubmit={handleSubmit} className={styles.chatForm}>
        <div className={styles.inputContainer}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={styles.messageInput}
            rows={1}
            aria-label="Type your message to the reader"
            aria-describedby="chat-help"
          />

          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className={styles.sendButton}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </div>
        <div id="chat-help" className={styles.helpText}>
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  );
};
