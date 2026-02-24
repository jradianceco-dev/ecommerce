/**
 * Client-Side Database Services Layer
 * Used in client components and browser context
 * All queries go through these functions
 */

import { createClient } from "./client";
import type {
  UserProfile,
  Product,
  CartItem,
  Order,
  OrderItem,
  WishlistItem,
  ProductFilters,
  CreateOrderInput,
  ProductReview,
} from "@/types";

/* Profile Services */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}

/* Product Services */
export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  try {
    const supabase = createClient();
    let query = supabase.from("products").select("*");

    // Fix: Only apply is_active filter if explicitly provided
    // For admin catalog views, pass is_active: undefined to see all products
    // For customer views, pass is_active: true to see only active products
    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );
    }

    // Pagination using range
    if (filters?.limit || filters?.offset) {
      const start = filters?.offset ?? 0;
      const limit = filters?.limit ?? 50;
      query = query.range(start, start + limit - 1);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(
  productId: string,
): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getProductsByIds(
  productIds: string[],
): Promise<Product[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching products by ids:", error);
    return [];
  }
}

// Get trending products (based on recent orders)
export async function getTrendingProducts(
  limit: number = 8,
): Promise<Product[]> {
  try {
    const supabase = createClient();

    // Get recent order items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (error) throw error;

    // Count total quantity sold per product
    const productCounts: { [key: string]: number } = {};
    orderItems?.forEach((item) => {
      productCounts[item.product_id] =
        (productCounts[item.product_id] || 0) + item.quantity;
    });

    // Get top products by order count
    const topProductIds = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => productId);

    if (topProductIds.length === 0) {
      // Fallback to recent products if no orders
      return getProducts({ limit });
    }

    return getProductsByIds(topProductIds);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    // Fallback to regular products
    return getProducts({ limit });
  }
}

// Get best seller products (based on total quantity sold)
export async function getBestSellerProducts(
  limit: number = 8,
): Promise<Product[]> {
  try {
    const supabase = createClient();

    // Get all order items grouped by product_id with total quantity
    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select("product_id, quantity");

    if (error) throw error;

    // Count total quantity sold per product
    const productCounts: { [key: string]: number } = {};
    orderItems?.forEach((item) => {
      productCounts[item.product_id] =
        (productCounts[item.product_id] || 0) + item.quantity;
    });

    // Get top products by total sales
    const topProductIds = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => productId);

    if (topProductIds.length === 0) {
      // Fallback to regular products if no orders
      return getProducts({ limit });
    }

    return getProductsByIds(topProductIds);
  } catch (error) {
    console.error("Error fetching best seller products:", error);
    // Fallback to regular products
    return getProducts({ limit });
  }
}

export async function addProductReview(
  productId: string,
  userId: string,
  rating: number,
  title: string | null,
  review_text: string | null,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      user_id: userId,
      rating,
      title,
      review_text,
      is_verified_purchase: false,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding review:", error);
    return false;
  }
}

/* Cart Services */
export async function getCartItems(userId: string): Promise<CartItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
): Promise<CartItem | null> {
  try {
    const supabase = createClient();

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Insert new item
    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return null;
  }
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating cart item:", error);
    return false;
  }
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return false;
  }
}

export async function clearCart(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return false;
  }
}

/* Wishlist Services */

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("wishlist")
      .select("*, products(*)")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
}

export async function addToWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("wishlist").insert({
      user_id: userId,
      product_id: productId,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return false;
  }
}

export async function removeFromWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return false;
  }
}

export async function isInWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
}

/* Order Services */

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching order items:", error);
    return [];
  }
}

export async function createOrder(
  userId: string,
  orderData: CreateOrderInput,
): Promise<Order | null> {
  try {
    const supabase = createClient();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: `ORD-${Date.now()}`,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping_cost: orderData.shipping_cost,
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address || null,
        billing_address: orderData.billing_address || null,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error("Failed to create order");

    // Get product names for order items
    const productIds = orderData.items.map((item) => item.product_id);
    const products = await getProductsByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p.name]));

    // Add order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: productMap.get(item.product_id) || "Unknown Product",
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear user's cart
    await clearCart(userId);

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

/* Review Services */

export async function getProductReviews(
  productId: string,
): Promise<ProductReview[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

/**
 * Get average rating for a product
 * @param productId - Product ID to get rating for
 * @returns Average rating (0-5) and total review count
 */
export async function getProductAverageRating(
  productId: string,
): Promise<{ averageRating: number; totalReviews: number }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", productId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalReviews = data.length;
    const sumRatings = data.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = sumRatings / totalReviews;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
    };
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return { averageRating: 0, totalReviews: 0 };
  }
}

/**
 * Get ratings for multiple products at once
 * @param productIds - Array of product IDs
 * @returns Map of product ID to rating data
 */
export async function getProductsAverageRatings(
  productIds: string[],
): Promise<Map<string, { averageRating: number; totalReviews: number }>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("product_reviews")
      .select("product_id, rating")
      .in("product_id", productIds);

    if (error) throw error;

    const ratingsMap = new Map<string, { sum: number; count: number }>();

    // Initialize map
    productIds.forEach((id) => {
      ratingsMap.set(id, { sum: 0, count: 0 });
    });

    // Aggregate ratings
    data?.forEach((review) => {
      const current = ratingsMap.get(review.product_id) || { sum: 0, count: 0 };
      ratingsMap.set(review.product_id, {
        sum: current.sum + (review.rating || 0),
        count: current.count + 1,
      });
    });

    // Convert to final format
    const result = new Map<string, { averageRating: number; totalReviews: number }>();
    ratingsMap.forEach((value, key) => {
      result.set(key, {
        averageRating: value.count > 0 ? Math.round((value.sum / value.count) * 10) / 10 : 0,
        totalReviews: value.count,
      });
    });

    return result;
  } catch (error) {
    console.error("Error fetching products ratings:", error);
    // Return empty map on error
    return new Map();
  }
}
