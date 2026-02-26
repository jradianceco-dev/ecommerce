/**
 * =============================================================================
 * Product Detail Page - REBUILT v2
 * =============================================================================
 * 
 * FIXED:
 * - Proper error handling
 * - Works with Supabase schema
 * - SEO optimized
 * - No more 404 errors for valid products
 * 
 * Features:
 * - Image gallery
 * - Add to cart
 * - Wishlist
 * - Share
 * - Reviews display
 * - Related products
 */

import { notFound } from "next/navigation";
import { Product } from "@/types";
import { 
  getProductBySlug, 
  getProductAverageRating,
  getProducts 
} from "@/utils/supabase/services-server";
import { createProductMetadata } from "@/utils/seo/metadata-factory";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ProductDetailClient from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<ReturnType<typeof createProductMetadata>> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return {
        title: "Product Not Found | JRADIANCE",
        description: "The requested product could not be found.",
        robots: "noindex, nofollow",
      };
    }

    const ratingData = await getProductAverageRating(product.id);

    return createProductMetadata({
      name: product.name,
      description: product.description,
      price: product.discount_price || product.price,
      currency: "NGN",
      image: product.images?.[0],
      inStock: product.stock_quantity > 0,
      category: product.category,
      brand: "JRADIANCE",
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product Not Found | JRADIANCE",
      description: "The requested product could not be found.",
    };
  }
}

/**
 * Generate static params for pre-rendering
 */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const products = await getProducts({ 
      is_active: true,
      limit: 100 
    });

    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

/**
 * Product Detail Page Component
 */
export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { slug } = await params;
    
    // Fetch product - this will return null if not found OR not active
    const product = await getProductBySlug(slug);

    if (!product) {
      // Product doesn't exist or isn't active
      notFound();
    }

    // Get rating data
    const ratingData = await getProductAverageRating(product.id);

    // Calculate display price
    const displayPrice = product.discount_price || product.price;
    const hasDiscount = Boolean(
      product.discount_price && product.discount_price < product.price
    );
    const discountPercentage = hasDiscount
      ? Math.round(
          ((product.price - product.discount_price!) / product.price) * 100
        )
      : 0;

    // Build breadcrumb items
    const breadcrumbItems = [
      { name: "Home", url: "/", position: 1 },
      { name: "Shop", url: "/shop", position: 2 },
      { name: product.category, url: `/shop?category=${encodeURIComponent(product.category)}`, position: 3 },
      { name: product.name, url: `/products/${slug}`, position: 4 },
    ];

    return (
      <>
        {/* Structured Data for SEO */}
        <ProductJsonLd 
          product={product} 
          averageRating={ratingData.averageRating}
          reviewCount={ratingData.totalReviews}
        />
        <BreadcrumbJsonLd items={breadcrumbItems} />
        
        {/* Client Component for interactivity */}
        <ProductDetailClient
          product={product}
          breadcrumbItems={breadcrumbItems}
          hasDiscount={hasDiscount}
          discountPercentage={discountPercentage}
          displayPrice={displayPrice}
          ratingData={ratingData}
        />
      </>
    );
  } catch (error) {
    console.error("Error loading product page:", error);
    notFound();
  }
}
