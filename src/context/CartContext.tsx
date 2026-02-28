/**
 * Cart Context
 * 
 * Provides global cart state management with Supabase synchronization.
 * - Fetches cart from Supabase on mount
 * - Updates cart in real-time when items are added/removed
 * - Syncs across components
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "./UserContext";
import type { CartItem, Product } from "@/types";

interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, delta: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart from Supabase
  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          product_id,
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

      // Transform the data to match CartItem type
      const transformedCart: CartItem[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: user.id,
        product_id: item.product_id,
        quantity: item.quantity,
        added_at: item.added_at,
        updated_at: item.updated_at,
        product: item.product as Product,
      }));

      setCart(transformedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load cart when user logs in
  useEffect(() => {
    refreshCart();
  }, [user, refreshCart]);

  // Add item to cart - Single Responsibility: handles both insert and update
  const addItem = useCallback(async (productId: string, quantity: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const supabase = createClient();

      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      let result;
      if (existingItem) {
        // Update quantity
        const { data, error } = await supabase
          .from("cart_items")
          .update({ 
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingItem.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        // Update local state immediately for real-time UI
        setCart((prev) =>
          prev.map((c) =>
            c.id === existingItem.id 
              ? { ...c, quantity: c.quantity + quantity }
              : c
          )
        );
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          })
          .select(`
            id,
            quantity,
            product_id,
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
          .single();

        if (error) throw error;
        result = data;
        
        // Update local state immediately for real-time UI
        if (result) {
          const newItem: CartItem = {
            id: result.id,
            user_id: user.id,
            product_id: result.product_id,
            quantity: result.quantity,
            added_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product: result.product as unknown as Product,
          };
          setCart((prev) => [...prev, newItem]);
        }
      }

      return !!result;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  }, [user]);

  // Update quantity
  const updateQuantity = useCallback(async (cartItemId: string, delta: number) => {
    const item = cart.find((c) => c.id === cartItemId);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity + delta);

    if (newQuantity === 0) {
      await removeItem(cartItemId);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", cartItemId);

      if (error) throw error;

      // Update local state
      setCart((prev) =>
        prev.map((c) =>
          c.id === cartItemId ? { ...c, quantity: newQuantity } : c
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  }, [cart]);

  // Remove item
  const removeItem = useCallback(async (cartItemId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;

      // Update local state
      setCart((prev) => prev.filter((c) => c.id !== cartItemId));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  }, []);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, [user]);

  // Calculate totals
  const totalItems = useMemo(() => 
    cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(() => 
    cart.reduce((acc, item) => {
      const price = item.product?.discount_price || item.product?.price || 0;
      return acc + price * item.quantity;
    }, 0),
    [cart]
  );

  const value = useMemo(() => ({
    cart,
    totalItems,
    totalPrice,
    isLoading,
    refreshCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }), [cart, totalItems, totalPrice, isLoading, refreshCart, addItem, updateQuantity, removeItem, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
