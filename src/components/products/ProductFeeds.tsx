"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter, Grid, List } from "lucide-react";
import { Product, ProductFilters } from "@/types";
import { getProducts } from "@/utils/supabase/services-client";
import ProductCard from "./ProductCard";
import ProductDetail from "./ProductDetail";

interface ProductFeedsProps {
  initialFilters?: ProductFilters;
  showSearch?: boolean;
  showFilters?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ProductFeeds({
  initialFilters = {},
  showSearch = true,
  showFilters = true,
  title = "Products",
  subtitle,
  className = "",
}: ProductFeedsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialFilters.category || "",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    | "newest"
    | "price-low"
    | "price-high"
    | "rating"
    | "trending"
    | "best-sellers"
  >("newest");

  // Fetch products
  const fetchProducts = useCallback(async (filters: ProductFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(filters);
      setProducts(data);
    } catch (err) {
      setError("Failed to load products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts(initialFilters);
  }, [initialFilters, fetchProducts]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.discount_price || a.price) - (b.discount_price || b.price);
        case "price-high":
          return (b.discount_price || b.price) - (a.discount_price || a.price);
        case "rating":
          // For now, sort by creation date as rating sort placeholder
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "trending":
          // For trending, prioritize recently created products (placeholder)
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "best-sellers":
          // For best sellers, sort by stock quantity (higher = more popular)
          return b.stock_quantity - a.stock_quantity;
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is applied in real-time via filteredProducts
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  // Handle close product detail
  const handleCloseProductDetail = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchProducts(initialFilters)}
            className="mt-4 px-4 py-2 bg-radiance-goldColor text-white rounded-lg hover:bg-radiance-charcoalTextColor transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center space-y-2">
          {title && (
            <h2 className="text-3xl font-black tracking-tight">{title}</h2>
          )}
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
      )}

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {/* Search Bar */}
          {showSearch && (
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-radiance-goldColor"
                >
                  <Search size={16} />
                </button>
              </div>
            </form>
          )}

          {/* Filters and Sort */}
          {showFilters && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-radiance-goldColor focus:border-transparent text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="trending">Trending</option>
                  <option value="best-sellers">Best Sellers</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-radiance-goldColor text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-radiance-goldColor text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-center text-sm text-gray-600">
        {filteredProducts.length} product
        {filteredProducts.length !== 1 ? "s" : ""} found
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={handleProductClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No products found matching your criteria.
          </p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={handleCloseProductDetail}
        />
      )}
    </div>
  );
}
