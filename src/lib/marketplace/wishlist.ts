 
import { supabase } from '@/lib/supabase/client';
import { MYSTIC_PRODUCTS } from '@/lib/stripe/initStripe';
export type ProductKey = keyof typeof MYSTIC_PRODUCTS;
export interface WishlistItem {
  id: string;
  user_id: string;
  product_key: ProductKey;
  added_at: string;
  product_data?: {
    name: string;
    price: number;
    currency: string;
    images: string[];
    metadata: any;
  };
}
export class WishlistService {
  /**
   * Add a product to the user's wishlist
   */
  static async addToWishlist(productKey: ProductKey): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User must be authenticated to add to wishlist' };
      }
      // Check if item already exists in wishlist
      const { data: existingItem } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_key', productKey)
        .single();
      if (existingItem) {
        return { success: false, error: 'Item already in wishlist' };
      }
      // Add to wishlist
      const product = MYSTIC_PRODUCTS[productKey];
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_key: productKey,
          product_data: {
            name: product.name,
            price: product.price,
            currency: product.currency,
            images: product.images,
            metadata: product.metadata
          }
        });
      if (error) {
        console.error('Error adding to wishlist:', error);
        return { success: false, error: 'Failed to add item to wishlist' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
  /**
   * Remove a product from the user's wishlist
   */
  static async removeFromWishlist(productKey: ProductKey): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User must be authenticated' };
      }
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_key', productKey);
      if (error) {
        console.error('Error removing from wishlist:', error);
        return { success: false, error: 'Failed to remove item from wishlist' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
  /**
   * Get all items in the user's wishlist
   */
  static async getWishlist(): Promise<{ success: boolean; data?: WishlistItem[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User must be authenticated' };
      }
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });
      if (error) {
        console.error('Error fetching wishlist:', error);
        return { success: false, error: 'Failed to fetch wishlist' };
      }
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
  /**
   * Check if a product is in the user's wishlist
   */
  static async isInWishlist(productKey: ProductKey): Promise<{ success: boolean; isInWishlist?: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: true, isInWishlist: false };
      }
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_key', productKey)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error checking wishlist:', error);
        return { success: false, error: 'Failed to check wishlist status' };
      }
      return { success: true, isInWishlist: !!data };
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
  /**
   * Get wishlist item count for the user
   */
  static async getWishlistCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: true, count: 0 };
      }
      const { count, error } = await supabase
        .from('wishlist_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (error) {
        console.error('Error getting wishlist count:', error);
        return { success: false, error: 'Failed to get wishlist count' };
      }
      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
  /**
   * Clear the entire wishlist for the user
   */
  static async clearWishlist(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User must be authenticated' };
      }
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);
      if (error) {
        console.error('Error clearing wishlist:', error);
        return { success: false, error: 'Failed to clear wishlist' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
  /**
   * Get products from wishlist that match specific filters
   */
  static async getFilteredWishlist(filters: {
    celestialEvents?: string[];
    productTypes?: string[];
    elements?: string[];
  }): Promise<{ success: boolean; data?: WishlistItem[]; error?: string }> {
    try {
      const wishlistResult = await this.getWishlist();
      
      if (!wishlistResult.success || !wishlistResult.data) {
        return wishlistResult;
      }
      let filteredItems = wishlistResult.data;
      // Apply celestial event filter
      if (filters.celestialEvents && filters.celestialEvents.length > 0) {
        filteredItems = filteredItems.filter(item => {
          const cosmicAlignment = item.product_data?.metadata?.cosmic_alignment;
          if (!cosmicAlignment) return false;
          const alignmentArray = Array.isArray(cosmicAlignment) ? cosmicAlignment : [cosmicAlignment];
          return filters.celestialEvents!.some(event => alignmentArray.includes(event));
        });
      }
      // Apply product type filter
      if (filters.productTypes && filters.productTypes.length > 0) {
        filteredItems = filteredItems.filter(item => {
          const type = item.product_data?.metadata?.type;
          return type && filters.productTypes!.includes(type);
        });
      }
      // Apply element filter
      if (filters.elements && filters.elements.length > 0) {
        filteredItems = filteredItems.filter(item => {
          const element = item.product_data?.metadata?.element;
          return element && filters.elements!.includes(element);
        });
      }
      return { success: true, data: filteredItems };
    } catch (error) {
      console.error('Error getting filtered wishlist:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}
/**
 * Hook for managing wishlist state in React components
 */
export function useWishlist() {
  const [wishlistItems, setWishlistItems] = React.useState<WishlistItem[]>([]);
  const [wishlistCount, setWishlistCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const refreshWishlist = async () => {
    setLoading(true);
    try {
      const result = await WishlistService.getWishlist();
      if (result.success && result.data) {
        setWishlistItems(result.data);
        setWishlistCount(result.data.length);
      }
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    } finally {
      setLoading(false);
    }
  };
  const addToWishlist = async (productKey: ProductKey) => {
    const result = await WishlistService.addToWishlist(productKey);
    if (result.success) {
      await refreshWishlist();
    }
    return result;
  };
  const removeFromWishlist = async (productKey: ProductKey) => {
    const result = await WishlistService.removeFromWishlist(productKey);
    if (result.success) {
      await refreshWishlist();
    }
    return result;
  };
  const isInWishlist = (productKey: ProductKey) => {
    return wishlistItems.some(item => item.product_key === productKey);
  };
 
  React.useEffect(() => {
    refreshWishlist();
  }, []);
  return {
    wishlistItems,
    wishlistCount,
    loading,
    refreshWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };
}
// Import React for the hook
import React from 'react';
