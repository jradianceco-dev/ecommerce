"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingCart, Plus, Minus } from "lucide-react";
import { Product } from "@/types";
import {
  addToCart,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "@/utils/supabase/services";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  showQuickAdd = true,
  className = "",
}: ProductCardProps) {
  const user = useUser();
  const { success, error: showError } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [rating, setRating] = useState<{ average: number; count: number }>({
    average: 0,
    count: 0,
  });

  // Check if product is in wishlist on mount
  useEffect(() => {
    if (user) {
      isInWishlist(user.id, product.id).then(setIsWishlisted);
    }
  }, [user, product.id]);

  // Fetch product rating on mount
  useEffect(() => {
    let aborted = false;

    async function loadRating() {
      try {
        const { getProductAverageRating } = await import(
          "@/utils/supabase/services"
        );
        const { averageRating, totalReviews } =
          await getProductAverageRating(product.id);
        if (!aborted) {
          setRating({ average: averageRating, count: totalReviews });
        }
      } catch (error) {
        // Silently handle errors (don't log abort errors)
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!aborted && errorMessage && !errorMessage.includes('abort')) {
          console.error("Error loading rating:", errorMessage);
        }
      }
    }
    loadRating();

    return () => {
      aborted = true;
    };
  }, [product.id]);

  // Calculate display price
  const displayPrice = product.discount_price || product.price;
  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - (product.discount_price || 0)) / product.price) * 100,
      )
    : 0;

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showError("Please log in to add items to cart");
      return;
    }

    setLoading(true);
    try {
      const successResult = await addToCart(user.id, product.id, quantity);
      if (successResult) {
        success(`Added ${quantity} ${product.name} to cart!`);
      } else {
        showError("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showError("Please log in to manage wishlist");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const successResult = await removeFromWishlist(user.id, product.id);
        if (successResult) {
          setIsWishlisted(false);
          success("Removed from wishlist");
        }
      } else {
        const successResult = await addToWishlist(user.id, product.id);
        if (successResult) {
          setIsWishlisted(true);
          success("Added to wishlist");
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showError("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  // Render star rating
  const renderStars = () => {
    const fullStars = Math.floor(rating.average);
    const hasHalfStar = rating.average % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={12}
            className="text-yellow-400 fill-current"
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star size={12} className="text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star size={12} className="text-yellow-400 fill-current" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={12}
            className="text-gray-300"
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group block ${className}`}>
      {/* Product Image - Clickable for navigation */}
      <Link
        href={`/products/${product.slug}`}
        className="block"
      >
        <div className="relative aspect-square w-full rounded-t-xl overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={`${product.name} - Image 1`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart size={48} />
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              -{discountPercentage}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlistToggle(e);
            }}
            disabled={wishlistLoading}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
            } ${wishlistLoading ? "opacity-50" : ""}`}
          >
            <Heart size={16} className={isWishlisted ? "fill-current" : ""} />
          </button>

          {/* Out of Stock Overlay */}
          {product.stock_quantity <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info Section - Clickable for navigation */}
        <div className="p-4 space-y-3">
          {/* Category */}
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            {product.category}
          </div>

          {/* Product Name */}
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-radiance-goldColor transition-colors">
            {product.name}
          </h3>

          {/* Rating with actual data */}
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="text-xs text-gray-500 ml-1">
              ({rating.count})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-radiance-goldColor font-bold">
              ₦{displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-gray-500 text-sm line-through">
                ₦{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="text-xs text-gray-500">
            {product.stock_quantity > 0
              ? `${product.stock_quantity} in stock`
              : "Out of stock"}
          </div>
        </div>
      </Link>

      {/* Quick Add Section - OUTSIDE the Link to prevent navigation */}
      {showQuickAdd && product.stock_quantity > 0 && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-4">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleQuantityChange(-1);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-medium">{quantity}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleQuantityChange(1);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="w-full bg-radiance-charcoalTextColor text-white py-3 px-4 rounded-lg font-medium hover:bg-radiance-goldColor transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <ShoppingCart size={16} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
