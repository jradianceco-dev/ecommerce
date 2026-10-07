/**
 * Product JSON-LD Structured Data Component
 *
 * Generates schema.org/Product structured data for Google Search rich snippets
 * and Google Merchant listings.
 */

import { Product } from "@/types";

/**
 * Props for ProductJsonLd component
 */
interface ProductJsonLdProps {
  product: Product;
  baseUrl?: string;
  averageRating?: number;
  reviewCount?: number;
}

/**
 * ProductJsonLd Component
 *
 * Injects JSON-LD structured data for product rich snippets.
 * Enables Google to display:
 * - Product price & currency
 * - Stock availability
 * - High-res product images
 * - Verified merchant return policy & delivery estimates
 * - Review ratings & brand information
 */
export default function ProductJsonLd({ 
  product, 
  baseUrl,
  averageRating = 0,
  reviewCount = 0,
}: ProductJsonLdProps) {
  const siteUrl = (baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com").replace(/\/$/, "");

  // Determine product availability
  const availability = product.stock_quantity > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  // Ensure all image URLs are fully qualified absolute URLs
  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [`${siteUrl}/og-image.jpg`];

  const images = rawImages.map((img) =>
    img.startsWith("http://") || img.startsWith("https://")
      ? img
      : `${siteUrl}${img.startsWith("/") ? "" : "/"}${img}`
  );

  const price = product.discount_price || product.price;

  // Build the structured data object
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, "").trim() || `${product.name} by JRADIANCE`,
    image: images,
    brand: {
      "@type": "Brand",
      name: (product.attributes?.brand as string) || "JRADIANCE",
    },
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "NGN",
      availability: availability,
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      url: `${siteUrl}/shop/products/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: "JRADIANCE",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "NG",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: price >= 50000 ? 0 : 2500,
          currency: "NGN",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "NG",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "d",
          },
        },
      },
    },
    ...(reviewCount > 0 && averageRating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviewCount.toString(),
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
