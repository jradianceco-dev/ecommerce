/**
 * Server-Side Database Services Layer
 *
 * Used in server components, API routes, and server actions
 * All queries go through these functions
 */

import { createStaticClient } from "./static-client";
import type { UserProfile, Product, ProductFilters } from "@/types";

/* Profile Services */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const supabase = createStaticClient();
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
    const supabase = createStaticClient();
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
    const supabase = createStaticClient();
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
    const supabase = createStaticClient();
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
    const supabase = createStaticClient();

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
    const supabase = createStaticClient();

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
    const supabase = createStaticClient();
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

/**
 * Get product by slug for SEO-optimized product pages
 * CQS: Query method - only retrieves data without modifying state
 * Uses static client to avoid cookie issues during static generation
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

/**
 * Get average rating for a product (server-side)
 * @param productId - Product ID to get rating for
 * @returns Average rating (0-5) and total review count
 */
export async function getProductAverageRating(
  productId: string,
): Promise<{ averageRating: number; totalReviews: number }> {
  try {
    const supabase = createStaticClient();
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
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    };
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return { averageRating: 0, totalReviews: 0 };
  }
}

/**
 * Get all product slugs for sitemap generation
 * CQS: Query method - only retrieves data for sitemap
 * Uses static client to avoid cookie issues during static generation
 */
export async function getAllProductSlugs(): Promise<Array<{ slug: string; updated_at: string }>> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching product slugs:", error);
    return [];
  }
}
