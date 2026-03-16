/**
 * =============================================================================
 * Product Recommendations Component
 * =============================================================================
 *
 * Shows "You May Also Like" recommendations based on:
 * - Same category
 * - Similar products
 * - Recently viewed (future)
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { getProducts } from "@/utils/supabase/services";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductRecommendationsProps {
  currentProductId: string;
  currentCategory: string;
  limit?: number;
  title?: string;
}

export default function ProductRecommendations({
  currentProductId,
  currentCategory,
  limit = 4,
  title = "You May Also Like",
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [currentProductId, currentCategory, limit]);

  async function loadRecommendations() {
    try {
      setLoading(true);

      // Get products from same category (excluding current product)
      const products = await getProducts({
        category: currentCategory,
        limit: limit * 2, // Get more to filter out current
        is_active: true,
      });

      // Filter out current product and limit results
      const filtered = (products as Product[])
        .filter((p) => p.id !== currentProductId)
        .slice(0, limit);

      setRecommendations(filtered);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || recommendations.length === 0) {
    return null; // Don't show if loading or no recommendations
  }

  return (
    <div className="mt-16 pt-12 border-t border-gray-100">
      <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showQuickAdd={true}
            viewMode="vertical"
          />
        ))}
      </div>
    </div>
  );
}
