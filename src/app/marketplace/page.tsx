'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MYSTIC_PRODUCTS, createCheckoutSession } from '@/lib/stripe/initStripe';
import { MercuryRetrogradeBanner } from '@/components/astrology/MercuryRetrogradeBanner';

interface Product {
  key: keyof typeof MYSTIC_PRODUCTS;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  metadata: Record<string, string>;
  featured?: boolean;
}

export default function MarketplacePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert MYSTIC_PRODUCTS to array format
  const products: Product[] = Object.entries(MYSTIC_PRODUCTS).map(([key, product]) => ({
    key: key as keyof typeof MYSTIC_PRODUCTS,
    ...product,
    featured: key === 'retrograde_collection'
  }));

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
            <div className="w-32"></div>
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
          {products.map((product, index) => (
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

              {/* Product Image Placeholder */}
              <div className={`h-48 ${
                product.featured 
                  ? 'bg-gradient-to-br from-red-800/30 to-purple-800/30' 
                  : 'bg-gradient-to-br from-purple-800/30 to-blue-800/30'
              } flex items-center justify-center`}>
                <div className="text-6xl opacity-50">
                  {product.key === 'retrograde_collection' ? '👗' : 
                   product.key === 'crystal_starter_kit' ? '💎' : '🔮'}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">{product.description}</p>
                
                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(product.metadata).slice(0, 2).map(([key, value]) => (
                    <span 
                      key={key}
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.featured 
                          ? 'bg-red-500/20 text-red-300' 
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {value.replace(/_/g, ' ')}
                    </span>
                  ))}
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
    </div>
  );
}