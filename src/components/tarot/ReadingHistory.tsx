"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetReadings } from '@/hooks/useTarotAPI';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Trash2,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

interface ReadingHistoryProps {
  className?: string;
}

export const ReadingHistory: React.FC<ReadingHistoryProps> = ({ className = "" }) => {
  const { user, isGuest } = useAuth();
  const { data, loading, error, getReadings, deleteReading } = useGetReadings();
  
  const [selectedReading, setSelectedReading] = useState<string | null>(null);
  const [filterSpread, setFilterSpread] = useState<string>('');
  const [searchTags, setSearchTags] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load readings on mount and when filters change
  useEffect(() => {
    if (user && !isGuest) {
      getReadings({
        userId: user.id,
        spreadType: filterSpread as 'single' | 'three-card' | 'celtic-cross' || undefined,
        tags: searchTags || undefined,
        page,
        limit: 10,
        sort: 'created_at',
        order: 'desc'
      });
    }
  }, [user, isGuest, filterSpread, searchTags, page, getReadings]);

  const handleDelete = async (readingId: string) => {
    if (!user) return;
    
    try {
      await deleteReading(readingId, user.id);
      setDeleteConfirm(null);
      setSelectedReading(null);
    } catch (error) {
      console.error('Failed to delete reading:', error);
    }
  };

  const formatSpreadType = (type: string) => {
    switch (type) {
      case 'single': return 'Single Card';
      case 'three-card': return 'Three Card Spread';
      case 'celtic-cross': return 'Celtic Cross';
      default: return type;
    }
  };

  if (isGuest) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Sign In to View History</h3>
          <p className="text-gray-400">Create an account to save and review your tarot readings</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} p-4 md:p-6`}>
      {/* Header with Filters */}
      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">Reading History</h2>
        
        {/* Filters */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTags}
              onChange={(e) => setSearchTags(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <select
            value={filterSpread}
            onChange={(e) => setFilterSpread(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
          >
            <option value="">All Spreads</option>
            <option value="single">Single Card</option>
            <option value="three-card">Three Card</option>
            <option value="celtic-cross">Celtic Cross</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
          <button
            onClick={() => getReadings({ userId: user!.id })}
            className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
          >
            Try again
          </button>
        </motion.div>
      )}

      {/* Readings List */}
      {!loading && !error && (
        <>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {data?.readings?.map((reading) => (
                <motion.div
                  key={reading.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-800/70 hover:border-purple-500/50 ${
                    selectedReading === reading.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedReading(reading.id === selectedReading ? null : reading.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white">
                          {formatSpreadType(reading.spreadType)}
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded">
                          {reading.cards?.length || 0} cards
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(reading.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(reading.createdAt), 'h:mm a')}</span>
                        </div>
                      </div>

                      {reading.question && (
                        <p className="mt-2 text-sm text-gray-300 italic">
                          &ldquo;{reading.question}&rdquo;
                        </p>
                      )}

                      {reading.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {reading.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <ChevronRight 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedReading === reading.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedReading === reading.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t border-gray-700"
                      >
                        {/* Cards */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Cards Drawn:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {reading.cards?.map((card, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-700/50 rounded p-2 text-sm"
                              >
                                <div className="font-medium text-white">
                                  {card.name}
                                  {card.isReversed && (
                                    <span className="text-xs text-yellow-400 ml-1">(Reversed)</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Position: {card.position}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interpretation */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Interpretation:</h4>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">
                            {reading.interpretation}
                          </p>
                        </div>

                        {/* Notes */}
                        {reading.notes && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Notes:</h4>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">
                              {reading.notes}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-2 mt-4">
                          {deleteConfirm === reading.id ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(null);
                                }}
                                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(reading.id);
                                }}
                                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                              >
                                Confirm Delete
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(reading.id);
                              }}
                              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {(!data?.readings || data.readings.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-400">
                <p className="text-lg mb-2">No readings found</p>
                <p className="text-sm">Start a new tarot reading to build your history</p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.total > 10 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {page} of {Math.ceil(data.pagination.total / 10)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data.pagination.hasMore}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};