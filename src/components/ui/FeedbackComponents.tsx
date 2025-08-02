 
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle, X, Info } from 'lucide-react';
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message,
  className = "" 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      <Loader2 className={`${sizeClasses[size]} text-purple-400 animate-spin`} />
      {message && (
        <p className="mt-3 text-sm text-gray-400">{message}</p>
      )}
    </motion.div>
  );
};
interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onRetry, 
  onClose,
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`bg-red-500/10 border border-red-500/30 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-red-200 text-sm sm:text-base break-words">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs sm:text-sm text-red-300 hover:text-red-200 underline transition-colors"
            >
              Try again
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
            aria-label="Close error message"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
interface SuccessMessageProps {
  message: string;
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
  className?: string;
}
export const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  message, 
  onClose,
  autoHide = true,
  duration = 3000,
  className = "" 
}) => {
 
  React.useEffect(() => {
    if (autoHide && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onClose, duration]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`bg-green-500/10 border border-green-500/30 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        <p className="text-green-200 text-sm sm:text-base flex-1">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-green-400 hover:text-green-300 transition-colors"
            aria-label="Close success message"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
interface InfoMessageProps {
  message: string;
  onClose?: () => void;
  className?: string;
}
export const InfoMessage: React.FC<InfoMessageProps> = ({ 
  message, 
  onClose,
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-blue-200 text-sm sm:text-base flex-1">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-blue-400 hover:text-blue-300 transition-colors"
            aria-label="Close info message"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message = "Loading...",
  fullScreen = false 
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${
            fullScreen ? 'fixed' : 'absolute'
          } inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50`}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900/90 rounded-2xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl"
          >
            <LoadingSpinner size="lg" message={message} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
// Mobile-optimized card skeleton loader
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gray-800/50 rounded-lg p-4 space-y-3"
        >
          <div className="h-6 bg-gray-700/50 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-700/50 rounded animate-pulse" />
            <div className="h-4 bg-gray-700/50 rounded animate-pulse w-3/4" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-700/50 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-700/50 rounded animate-pulse" />
          </div>
        </motion.div>
      ))}
    </>
  );
};
// Floating action button for mobile
interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  className = ""
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };
  return (
    <motion.button
      className={`fixed ${positionClasses[position]} bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-40 ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      {icon}
    </motion.button>
  );
};
// Pull to refresh component for mobile
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}
export const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
  onRefresh, 
  children,
  threshold = 80 
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startY || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      setPullDistance(Math.min(diff, threshold * 1.5));
    }
  };
  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  };
  return (
    <div className="relative">
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex justify-center py-4"
            style={{ transform: `translateY(${pullDistance}px)` }}
          >
            <LoadingSpinner 
              size="sm" 
              message={isRefreshing ? "Refreshing..." : pullDistance >= threshold ? "Release to refresh" : "Pull to refresh"} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div
        ref={containerRef}
        className="overflow-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pullDistance > 0 ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};
