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
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check if product is in wishlist on mount
  useEffect(() => {
    if (user) {
      isInWishlist(user.id, product.id).then(setIsWishlisted);
    }
  }, [user, product.id]);

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
      alert("Please log in to add items to cart");
      return;
    }

    setLoading(true);
    try {
      const success = await addToCart(user.id, product.id, quantity);
      if (success) {
        alert(`Added ${quantity} ${product.name} to cart!`);
      } else {
        alert("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Please log in to manage wishlist");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const success = await removeFromWishlist(user.id, product.id);
        if (success) {
          setIsWishlisted(false);
        }
      } else {
        const success = await addToWishlist(user.id, product.id);
        if (success) {
          setIsWishlisted(true);
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group block ${className}`}
    >
      {/* Product Image */}
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
          onClick={handleWishlistToggle}
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

      {/* Product Info Section*/}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="text-xs text-gray-500 uppercase tracking-wider">
          {product.category}
        </div>

        {/* Product Name */}
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-radiance-goldColor transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className="text-yellow-400 fill-current"
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">(4.5)</span>{" "}
          {/* Fetch actual rating average later*/}
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

        {/* Quick Add Section */}
        {showQuickAdd && product.stock_quantity > 0 && (
          <div className="space-y-2">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
              <button
                onClick={(e) => {
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
              className="w-full bg-radiance-charcoalTextColor text-white py-2 px-4 rounded-lg font-medium hover:bg-radiance-goldColor transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Stock Status */}
        <div className="text-xs text-gray-500">
          {product.stock_quantity > 0
            ? `${product.stock_quantity} in stock`
            : "Out of stock"}
        </div>
      </div>
    </Link>
  );
}
