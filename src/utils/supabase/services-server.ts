/**
 * Server-Side Database Services Layer
 *
 * Used in server components, API routes, and server actions
 * All queries go through these functions
 *
 * Error Handling:
 * - All functions return null/empty array on error (no throws)
 * - AbortError and network errors are not logged to console
 * - Only meaningful errors are logged for debugging
 */

import { createStaticClient } from "./static-client";
import type { UserProfile, Product, ProductFilters } from "@/types";

/**
 * Helper function to check if error is an abort error
 */
function isAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'AbortError' || error.message.includes('abort');
  }
  return false;
}

/**
 * Helper function to log errors (filters out abort errors)
 */
function logError(message: string, error: unknown): void {
  if (isAbortError(error)) {
    return; // Don't log abort errors
  }
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (errorMessage) {
    console.error(message, errorMessage);
  }
}

/* Profile Services */

/**
 * Get user profile by ID
 * @param userId - User ID to fetch
 * @returns UserProfile or null if not found/error
 */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      return null;
    }

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      logError("Error fetching profile:", error);
      return null;
    }
    return data;
  } catch (error) {
    logError("Error fetching profile:", error);
    return null;
  }
}

/**
 * Update user profile
 * @param userId - User ID to update
 * @param updates - Fields to update
 * @returns Updated UserProfile or null on error
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      return null;
    }

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      logError("Error updating profile:", error);
      return null;
    }
    return data;
  } catch (error) {
    logError("Error updating profile:", error);
    return null;
  }
}

/* Product Services */

/**
 * Get products with optional filters
 * @param filters - Optional filters (category, search, limit, offset, is_active)
 * @returns Array of products (empty array on error)
 */
export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  try {
    const supabase = createStaticClient();
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

    if (error) {
      logError("Error fetching products:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    logError("Error fetching products:", error);
    return [];
  }
}

/**
 * Get product by ID
 * @param productId - Product ID to fetch
 * @returns Product or null if not found/error
 */
export async function getProductById(
  productId: string,
): Promise<Product | null> {
  try {
    // Validate input
    if (!productId || typeof productId !== 'string') {
      return null;
    }

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      logError("Error fetching product:", error);
      return null;
    }
    return data;
  } catch (error) {
    logError("Error fetching product:", error);
    return null;
  }
}

/**
 * Get multiple products by IDs
 * @param productIds - Array of product IDs
 * @returns Array of products (empty array on error)
 */
export async function getProductsByIds(
  productIds: string[],
): Promise<Product[]> {
  try {
    // Validate input
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return [];
    }

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (error) {
      logError("Error fetching products by ids:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    logError("Error fetching products by ids:", error);
    return [];
  }
}

/**
 * Get trending products (based on recent orders in last 30 days)
 * @param limit - Maximum number of products to return (default: 8)
 * @returns Array of trending products
 */
export async function getTrendingProducts(
  limit: number = 8,
): Promise<Product[]> {
  try {
    const supabase = createStaticClient();

    // Get recent order items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .limit(1000); // Limit to prevent fetching too many rows

    if (error) {
      logError("Error fetching trending products:", error);
      return getProducts({ limit }); // Fallback
    }

    // Count total quantity sold per product using Map for better type safety
    const productCounts = new Map<string, number>();
    orderItems?.forEach((item) => {
      const current = productCounts.get(item.product_id) || 0;
      productCounts.set(item.product_id, current + item.quantity);
    });

    // Get top products by order count
    const topProductIds = Array.from(productCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => productId);

    if (topProductIds.length === 0) {
      return getProducts({ limit }); // Fallback
    }

    return getProductsByIds(topProductIds);
  } catch (error) {
    logError("Error fetching trending products:", error);
    return getProducts({ limit }); // Fallback
  }
}

/**
 * Get best seller products (based on total quantity sold)
 * @param limit - Maximum number of products to return (default: 8)
 * @returns Array of best seller products
 */
export async function getBestSellerProducts(
  limit: number = 8,
): Promise<Product[]> {
  try {
    const supabase = createStaticClient();

    // Get all order items with limit to prevent fetching too many rows
    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .limit(5000); // Limit to prevent fetching too many rows

    if (error) {
      logError("Error fetching best seller products:", error);
      return getProducts({ limit }); // Fallback
    }

    // Count total quantity sold per product using Map for better type safety
    const productCounts = new Map<string, number>();
    orderItems?.forEach((item) => {
      const current = productCounts.get(item.product_id) || 0;
      productCounts.set(item.product_id, current + item.quantity);
    });

    // Get top products by total sales
    const topProductIds = Array.from(productCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => productId);

    if (topProductIds.length === 0) {
      return getProducts({ limit }); // Fallback
    }

    return getProductsByIds(topProductIds);
  } catch (error) {
    logError("Error fetching best seller products:", error);
    return getProducts({ limit }); // Fallback
  }
}

/**
 * Add product review
 * @param productId - Product ID to review
 * @param userId - User ID adding review
 * @param rating - Rating (1-5)
 * @param title - Review title
 * @param review_text - Review text
 * @returns true on success, false on error
 */
export async function addProductReview(
  productId: string,
  userId: string,
  rating: number,
  title: string | null,
  review_text: string | null,
): Promise<boolean> {
  try {
    // Validate inputs
    if (!productId || typeof productId !== 'string' ||
        !userId || typeof userId !== 'string' ||
        rating < 1 || rating > 5) {
      return false;
    }

    const supabase = createStaticClient();
    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      user_id: userId,
      rating,
      title,
      review_text,
      is_verified_purchase: false,
    });

    if (error) {
      logError("Error adding review:", error);
      return false;
    }
    return true;
  } catch (error) {
    logError("Error adding review:", error);
    return false;
  }
}

/**
 * Get product by slug for SEO-optimized product pages
 * Only returns active products
 * @param slug - Product slug
 * @returns Product or null if not found/error
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Validate input
    if (!slug || typeof slug !== 'string') {
      return null;
    }

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      logError("Error fetching product by slug:", error);
      return null;
    }
    return data;
  } catch (error) {
    logError("Error fetching product by slug:", error);
    return null;
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
    // Validate input
    if (!productId || typeof productId !== 'string') {
      return { averageRating: 0, totalReviews: 0 };
    }

    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", productId);

    if (error) {
      logError("Error fetching average rating:", error);
      return { averageRating: 0, totalReviews: 0 };
    }

    if (!data || data.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalReviews = data.length;
    const sumRatings = data.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = sumRatings / totalReviews;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    };
  } catch (error) {
    logError("Error fetching average rating:", error);
    return { averageRating: 0, totalReviews: 0 };
  }
}

/**
 * Get all product slugs for sitemap generation
 * Only returns active products
 * @returns Array of { slug, updated_at }
 */
export async function getAllProductSlugs(): Promise<Array<{ slug: string; updated_at: string }>> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      logError("Error fetching product slugs:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    logError("Error fetching product slugs:", error);
    return [];
  }
}

/**
 * Get product count (for pagination)
 * @param filters - Optional filters
 * @returns Total count of products
 */
export async function getProductCount(
  filters?: Omit<ProductFilters, 'limit' | 'offset'>
): Promise<number> {
  try {
    const supabase = createStaticClient();
    let query = supabase.from("products").select("*", { count: 'exact', head: true });

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

    const { count, error } = await query;

    if (error) {
      logError("Error fetching product count:", error);
      return 0;
    }
    return count || 0;
  } catch (error) {
    logError("Error fetching product count:", error);
    return 0;
  }
}
