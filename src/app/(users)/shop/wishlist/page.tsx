/**
 * Wishlist Page
 *
 * Shows user's saved products
 */

"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { useToast } from "@/context/ToastContext";

export default function WishlistPage() {
  const router = useRouter();
  const user = useUser();
  const { success, error: showError } = useToast();
  const { wishlist, isLoading, removeFromWishlist } = useWishlist();

  // Extract products from wishlist items
  const products = wishlist.map((item) => item.product).filter((p): p is NonNullable<typeof p> => Boolean(p));

  async function handleRemove(productId: string) {
    if (!user) return;

    try {
      const successResult = await removeFromWishlist(productId);
      if (successResult) {
        success("Removed from wishlist");
      } else {
        showError("Failed to remove from wishlist");
      }
    } catch (error) {
      showError("Failed to remove from wishlist");
    }
  }

  // Show loading while auth is being checked
  if (isLoading || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto text-radiance-goldColor mb-4" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radiance-creamBackgroundColor py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-radiance-charcoalTextColor">My Wishlist</h1>
            <p className="text-gray-600 mt-1">Your saved products ({products.length})</p>
          </div>
          <Heart size={32} className="text-radiance-goldColor" />
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding products you love!</p>
            <button
              onClick={() => router.push("/shop")}
              className="bg-radiance-goldColor text-white px-8 py-3 rounded-full font-bold hover:bg-radiance-charcoalTextColor transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product} showQuickAdd={true} />
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push("/shop")}
                className="bg-radiance-charcoalTextColor text-white px-8 py-3 rounded-full font-bold hover:bg-radiance-goldColor transition-colors inline-flex items-center gap-2"
              >
                <ShoppingCart size={20} />
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
