'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { MYSTIC_PRODUCTS, createCheckoutSession, ProductMetadata, CelestialEventType } from '@/lib/stripe/initStripe';
import { MercuryRetrogradeBanner } from '@/components/astrology/MercuryRetrogradeBanner';
import { FilterSidebar, FilterState } from '@/components/marketplace/FilterSidebar';
import { WishlistService, useWishlist, ProductKey } from '@/lib/marketplace/wishlist';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  key: keyof typeof MYSTIC_PRODUCTS;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  metadata: ProductMetadata;
  featured?: boolean;
}

export default function MarketplacePage() {
  const { user, isGuest } = useAuth();
  const { wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount } = useWishlist();
  
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'name'>('featured');
  const [filters, setFilters] = useState<FilterState>({
    celestialEvents: [],
    productTypes: [],
    elements: [],
    moonPhases: [],
    priceRange: [0, 10000],
    showLimitedEdition: false
  });

  // Convert MYSTIC_PRODUCTS to array format
  const allProducts: Product[] = Object.entries(MYSTIC_PRODUCTS).map(([key, product]) => ({
    key: key as keyof typeof MYSTIC_PRODUCTS,
    ...product,
    featured: key === 'retrograde_collection'
  }));

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = allProducts.filter(product => {
      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Celestial events filter
      if (filters.celestialEvents.length > 0) {
        const cosmicAlignment = product.metadata.cosmic_alignment;
        if (!cosmicAlignment) return false;
        const hasMatchingEvent = filters.celestialEvents.some(event => 
          cosmicAlignment.includes(event as CelestialEventType)
        );
        if (!hasMatchingEvent) return false;
      }

      // Product type filter
      if (filters.productTypes.length > 0) {
        if (!filters.productTypes.includes(product.metadata.type)) return false;
      }

      // Element filter
      if (filters.elements.length > 0) {
        if (!product.metadata.element || !filters.elements.includes(product.metadata.element)) return false;
      }

      // Moon phase filter
      if (filters.moonPhases.length > 0) {
        if (!product.metadata.moon_phase || !filters.moonPhases.includes(product.metadata.moon_phase)) return false;
      }

      // Limited edition filter
      if (filters.showLimitedEdition) {
        if (product.metadata.limited_edition !== 'true') return false;
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }

    return filtered;
  }, [allProducts, filters, sortBy]);

  const handlePurchase = async (productKey: keyof typeof MYSTIC_PRODUCTS) => {
    try {
      setLoading(productKey);
      setError(null);
      
      await createCheckoutSession(productKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
      console.error('Purchase error:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleWishlistToggle = async (productKey: ProductKey) => {
    if (isGuest) {
      setError('Please sign in to add items to your wishlist');
      return;
    }

    try {
      if (isInWishlist(productKey)) {
        await removeFromWishlist(productKey);
      } else {
        await addToWishlist(productKey);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update wishlist');
      console.error('Wishlist error:', err);
    }
  };

  const getProductEmoji = (productKey: string) => {
    const emojiMap: Record<string, string> = {
      'retrograde_collection': '👗',
      'full_moon_crystal_set': '🌕',
      'eclipse_protection_candles': '🕯️',
      'saturn_return_journal': '📖',
      'venus_love_oil': '🧴',
      'crystal_starter_kit': '💎',
      'new_moon_intention_set': '🌑',
      'solstice_celebration_bundle': '☀️',
      'tarot_deck_premium': '🔮',
      'moon_phase_jewelry': '💍'
    };
    return emojiMap[productKey] || '✨';
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  const scrollToRetrograde = () => {
    const element = document.getElementById('retrograde-collection');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              ← Back to Mystic Arcana
            </Link>
            <h1 className="text-4xl font-bold text-white text-center flex-1">
              🌟 Mystic Marketplace 🌟
            </h1>
            <div className="flex items-center gap-4">
              {/* Wishlist Counter */}
              {!isGuest && (
                <motion.div
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-xl">💖</span>
                  <span className="text-white font-semibold">{wishlistCount}</span>
                </motion.div>
              )}
              
              {/* Filter Toggle */}
              <motion.button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 bg-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-lg px-4 py-2 text-white hover:bg-purple-600/30 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">🎛️</span>
                <span className="font-semibold">Filters</span>
              </motion.button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <span className="text-white/70">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="featured" className="bg-purple-900">Featured</option>
                <option value="price_low" className="bg-purple-900">Price: Low to High</option>
                <option value="price_high" className="bg-purple-900">Price: High to Low</option>
                <option value="name" className="bg-purple-900">Name</option>
              </select>
            </div>
            
            <div className="text-white/70">
              {filteredProducts.length} of {allProducts.length} cosmic treasures
            </div>
          </div>

          {/* Mercury Retrograde Banner */}
          <div className="mb-8">
            <MercuryRetrogradeBanner onMarketplaceClick={scrollToRetrograde} />
          </div>

          <motion.p 
            className="text-xl text-center text-white/80 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Curated cosmic treasures aligned with celestial energies
          </motion.p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div 
          className="max-w-6xl mx-auto px-6 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-red-300 hover:text-red-100 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.key}
              id={product.key === 'retrograde_collection' ? 'retrograde-collection' : undefined}
              className={`relative rounded-2xl overflow-hidden ${
                product.featured 
                  ? 'bg-gradient-to-br from-red-900/40 to-purple-900/40 border-2 border-red-500/30' 
                  : 'bg-white/10 border border-white/20'
              } backdrop-blur-md`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            >
              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <motion.div 
                    className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ☿ RETROGRADE SPECIAL
                  </motion.div>
                </div>
              )}

              {/* Wishlist Button */}
              {!isGuest && (
                <motion.button
                  onClick={() => handleWishlistToggle(product.key)}
                  className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full backdrop-blur-md border transition-all ${
                    isInWishlist(product.key)
                      ? 'bg-red-500/20 border-red-400/50 text-red-300'
                      : 'bg-white/10 border-white/20 text-white/70 hover:text-red-300'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isInWishlist(product.key) ? '💖' : '🤍'}
                </motion.button>
              )}

              {/* Product Image Placeholder */}
              <div className={`h-48 ${
                product.featured 
                  ? 'bg-gradient-to-br from-red-800/30 to-purple-800/30' 
                  : 'bg-gradient-to-br from-purple-800/30 to-blue-800/30'
              } flex items-center justify-center`}>
                <div className="text-6xl opacity-50">
                  {getProductEmoji(product.key)}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">{product.description}</p>
                
                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* Celestial Events */}
                  {product.metadata.cosmic_alignment?.slice(0, 2).map((event) => (
                    <span 
                      key={event}
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.featured 
                          ? 'bg-red-500/20 text-red-300' 
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      ✨ {event.replace(/_/g, ' ')}
                    </span>
                  ))}
                  
                  {/* Element */}
                  {product.metadata.element && (
                    <span 
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.featured 
                          ? 'bg-orange-500/20 text-orange-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      🌈 {product.metadata.element}
                    </span>
                  )}
                  
                  {/* Limited Edition */}
                  {product.metadata.limited_edition === 'true' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                      💫 Limited Edition
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-white">
                    {formatPrice(product.price, product.currency)}
                  </div>
                  
                  <motion.button
                    onClick={() => handlePurchase(product.key)}
                    disabled={loading === product.key}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      product.featured
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    whileHover={{ scale: loading === product.key ? 1 : 1.05 }}
                    whileTap={{ scale: loading === product.key ? 1 : 0.95 }}
                  >
                    {loading === product.key ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Buy Now'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <motion.div 
          className="mt-16 text-center text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="bg-white/5 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-3">🛡️ Secure Cosmic Commerce</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-purple-300 font-medium">🔒 Secure Payments</div>
                <div>Protected by Stripe encryption</div>
              </div>
              <div>
                <div className="text-purple-300 font-medium">🚚 Cosmic Shipping</div>
                <div>Worldwide delivery in 5-10 business days</div>
              </div>
              <div>
                <div className="text-purple-300 font-medium">✨ Energy Guarantee</div>
                <div>30-day satisfaction guarantee</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        productCount={filteredProducts.length}
      />
    </div>
  );
}