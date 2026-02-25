/**
 * Product Detail Page - Client Component
 * 
 * Handles interactive features:
 * - Add to cart
 * - Wishlist toggle
 * - Share product
 * - Quantity selector
 * - Image gallery
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Star, ShoppingCart, Heart, Share2, Check, Plus, Minus, X } from "lucide-react";
import { Product } from "@/types";
import { addToCart, addToWishlist, removeFromWishlist, isInWishlist, getProductAverageRating } from "@/utils/supabase/services";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

interface ProductDetailClientProps {
  product: Product;
  breadcrumbItems: Array<{ name: string; url: string; position: number }>;
  hasDiscount: boolean;
  discountPercentage: number;
  displayPrice: number;
}

function ProductDetailContent({
  product,
  breadcrumbItems,
  hasDiscount,
  discountPercentage,
  displayPrice,
}: ProductDetailClientProps) {
  const user = useUser();
  const { success, error: showError } = useToast();
  const searchParams = useSearchParams();
  
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rating, setRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 });

  // Load wishlist status and rating on mount
  useEffect(() => {
    let aborted = false;

    async function loadData() {
      try {
        // Load wishlist status
        if (user) {
          const wishlisted = await isInWishlist(user.id, product.id);
          if (!aborted) setIsWishlisted(wishlisted);
        }

        // Load rating
        const { averageRating, totalReviews } = await getProductAverageRating(product.id);
        if (!aborted) setRating({ average: averageRating, count: totalReviews });
      } catch (error) {
        // Silently handle errors (don't log abort errors)
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!aborted && errorMessage && !errorMessage.includes('abort')) {
          console.error("Error loading product data:", errorMessage);
        }
      }
    }

    loadData();

    return () => {
      aborted = true;
    };
  }, [user, product.id]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      showError("Please log in to add items to cart");
      return;
    }

    setCartLoading(true);
    try {
      const successResult = await addToCart(user.id, product.id, quantity);
      if (successResult) {
        success(`Added ${quantity} x ${product.name} to cart!`);
        setQuantity(1);
      } else {
        showError("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError("Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
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

  // Handle share
  const handleShare = async () => {
    setShareLoading(true);
    try {
      const shareData = {
        title: product.name,
        text: `Check out ${product.name} on JRADIANCE`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        success("Thanks for sharing!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        success("Link copied to clipboard!");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error);
      }
    } finally {
      setShareLoading(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(quantity + delta, product.stock_quantity));
    setQuantity(newQuantity);
  };

  // Render star rating
  const renderStars = () => {
    const fullStars = Math.floor(rating.average);
    const hasHalfStar = rating.average % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={`full-${i}`} size={16} className="text-yellow-400 fill-current" />
          ))}
          {hasHalfStar && (
            <div className="relative">
              <Star size={16} className="text-gray-300" />
              <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                <Star size={16} className="text-yellow-400 fill-current" />
              </div>
            </div>
          )}
          {[...Array(emptyStars)].map((_, i) => (
            <Star key={`empty-${i}`} size={16} className="text-gray-300" />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {rating.average > 0 ? rating.average.toFixed(1) : "No"} reviews
          {rating.count > 0 && ` (${rating.count})`}
        </span>
      </div>
    );
  };

  // All media (images + videos)
  const allMedia = [
    ...(product.images || []),
  ];

  return (
    <div className="min-h-screen bg-radiance-creamBackgroundColor text-radiance-charcoalTextColor">
      <article className="mx-auto max-w-7xl px-4 md:px-8 py-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 flex-wrap">
            {breadcrumbItems.map((item, index) => (
              <li key={item.position} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-gray-500" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <a href={item.url} className="text-radiance-goldColor hover:underline">
                    {item.name}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <section aria-label="Product images" className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              {allMedia[selectedImage] ? (
                <Image
                  src={allMedia[selectedImage]}
                  alt={`${product.name} - Image ${selectedImage + 1}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingCart size={64} />
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                  -{discountPercentage}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allMedia.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allMedia.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-radiance-goldColor" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Product Info */}
          <section aria-label="Product details" className="space-y-6">
            {/* Category and SKU */}
            <div className="space-y-2">
              <p className="text-xs text-radiance-goldColor font-bold uppercase tracking-wider">
                {product.category}
              </p>
              {product.sku && (
                <p className="text-xs text-gray-500 font-mono">SKU: {product.sku}</p>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-black text-radiance-charcoalTextColor leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {renderStars()}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-radiance-goldColor">
                ₦{displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-2xl text-gray-500 line-through">
                  ₦{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_quantity > 0 ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                  <Check size={16} />
                  <span className="text-sm font-bold">In Stock</span>
                  <span className="text-xs text-green-700">({product.stock_quantity} available)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                  <X size={16} />
                  <span className="text-sm font-bold">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-3">
                <h2 className="font-bold text-lg text-radiance-charcoalTextColor">Description</h2>
                <div className="prose prose-zinc prose-sm max-w-none text-gray-700">
                  <p className="text-sm leading-relaxed">{product.description.replace(/<[^>]*>/g, '')}</p>
                </div>
              </div>
            )}

            {/* Product Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="space-y-3">
                <h2 className="font-bold text-lg text-radiance-charcoalTextColor">Product Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="text-sm bg-white px-3 py-2 rounded-lg border border-gray-100">
                      <span className="font-semibold capitalize text-gray-700">
                        {key.replace(/_/g, " ")}:
                      </span>
                      <span className="ml-2 text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {product.stock_quantity > 0 && (
              <div className="space-y-4 pt-6 border-t border-gray-200">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-3 border-2 border-gray-200 rounded-xl hover:border-radiance-goldColor hover:bg-radiance-goldColor/10 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-3 border-2 border-gray-200 rounded-xl hover:border-radiance-goldColor hover:bg-radiance-goldColor/10 transition-colors"
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus size={18} />
                    </button>
                    <span className="text-xs text-gray-500 ml-2">
                      Max: {product.stock_quantity}
                    </span>
                  </div>
                </div>

                {/* Add to Cart & Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    className="flex-1 bg-radiance-charcoalTextColor text-white py-4 px-6 rounded-full font-bold text-base hover:bg-radiance-goldColor transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {cartLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`p-4 rounded-full border-2 transition-all ${
                      isWishlisted
                        ? "bg-red-500 border-red-500 text-white"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-red-500"
                    } disabled:opacity-50`}
                    aria-label="Add to wishlist"
                  >
                    {wishlistLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    ) : (
                      <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={shareLoading}
                    className="p-4 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50"
                    aria-label="Share product"
                  >
                    {shareLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    ) : (
                      <Share2 size={20} />
                    )}
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="text-xs">
                      <p className="font-bold text-gray-700">✓ Authentic</p>
                      <p className="text-gray-500">100% Original</p>
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-gray-700">🚚 Fast Delivery</p>
                      <p className="text-gray-500">Nationwide</p>
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-gray-700">💳 Secure Payment</p>
                      <p className="text-gray-500">Paystack Protected</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Additional Product Information Section */}
        <section className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Product Information</h2>
          <div className="prose prose-zinc max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {product.description || `Discover ${product.name}, a premium ${product.category.toLowerCase()} product from JRADIANCE. Designed for quality and authenticity.`}
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}

/**
 * ProductDetailClient with Suspense boundary for useSearchParams
 */
export default function ProductDetailClient(props: ProductDetailClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radiance-goldColor"></div>
      </div>
    }>
      <ProductDetailContent {...props} />
    </Suspense>
  );
}
