/**
 * Wishlist Context
 * 
 * Provides global wishlist state management with Supabase synchronization.
 * - Fetches wishlist from Supabase on mount
 * - Updates wishlist in real-time when items are added/removed
 * - Syncs across components
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "./UserContext";
import type { WishlistItem, Product } from "@/types";

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  refreshWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch wishlist from Supabase
  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          id,
          product_id,
          added_at,
          product:products (
            id,
            name,
            slug,
            category,
            price,
            discount_price,
            stock_quantity,
            images,
            is_active
          )
        `)
        .eq("user_id", user.id)
        .order("added_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match WishlistItem type
      const transformedWishlist: WishlistItem[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: user.id,
        product_id: item.product_id,
        added_at: item.added_at,
        product: item.product as Product,
      }));

      setWishlist(transformedWishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load wishlist when user logs in
  useEffect(() => {
    refreshWishlist();
  }, [user, refreshWishlist]);

  // Add to wishlist
  const handleAddToWishlist = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          product_id: productId,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh wishlist to update UI
      await refreshWishlist();
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return false;
    }
  }, [user, refreshWishlist]);

  // Remove from wishlist
  const handleRemoveFromWishlist = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;

      // Refresh wishlist to update UI
      await refreshWishlist();
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return false;
    }
  }, [user, refreshWishlist]);

  // Check if product is in wishlist
  const checkIsInWishlist = useCallback((productId: string) => {
    return wishlist.some((item) => item.product_id === productId);
  }, [wishlist]);

  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  const value = useMemo(() => ({
    wishlist,
    wishlistCount,
    isLoading,
    refreshWishlist,
    addToWishlist: handleAddToWishlist,
    removeFromWishlist: handleRemoveFromWishlist,
    isInWishlist: checkIsInWishlist,
  }), [wishlist, wishlistCount, isLoading, refreshWishlist, handleAddToWishlist, handleRemoveFromWishlist, checkIsInWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
