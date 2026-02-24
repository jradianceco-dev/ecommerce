/**
 * Product Detail Page
 *
 * SEO-optimized product page with:
 * - Dynamic metadata generation
 * - JSON-LD structured data
 * - Server-side rendering for optimal SEO
 * - Breadcrumb navigation
 * 
 * Uses hybrid approach:
 * - Server Component for SEO (metadata, structured data)
 * - Client Component for interactivity (cart, wishlist, share)
 */

import { notFound } from "next/navigation";
import { Product } from "@/types";
import { getProductBySlug, getProductAverageRating } from "@/utils/supabase/services-server";
import { createProductMetadata } from "@/utils/seo/metadata-factory";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ProductDetailClient from "./ProductDetailClient";

/**
 * Page props from Next.js routing
 */
interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate dynamic metadata for SEO
 * This runs at build time for static generation or request time for SSR
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<ReturnType<typeof createProductMetadata>> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  // Get rating for enhanced structured data
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
}

/**
 * Generate static params for pre-rendering
 * This enables static site generation for all products
 */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const { getAllProductSlugs } = await import(
    "@/utils/supabase/services-server"
  );

  const products = await getAllProductSlugs();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

/**
 * Product Detail Page Component
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get rating data for structured data
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
    { name: product.category, url: `/shop?category=${product.category}`, position: 3 },
    { name: product.name, url: `/products/${slug}`, position: 4 },
  ];

  return (
    <>
      {/* Structured Data for SEO with ratings */}
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
      />
    </>
  );
}
