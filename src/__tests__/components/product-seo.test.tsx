import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { createProductMetadata } from "@/utils/seo/metadata-factory";
import { Product } from "@/types";

describe("Product Schema & SEO Metadata", () => {
  const mockProduct: Product = {
    id: "prod-12345",
    name: "Radiance Vitamin C Serum",
    slug: "radiance-vitamin-c-serum",
    description: "Pure brightening organic face serum for radiant glowing skin.",
    price: 35000,
    discount_price: 30000,
    category: "Skincare",
    stock_quantity: 15,
    sku: "JR-SKIN-001",
    images: ["/uploads/serum-1.jpg", "https://example.com/serum-2.jpg"],
    attributes: { brand: "JRADIANCE" },
    is_active: true,
    created_by: "admin-123",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  it("renders Google-compliant JSON-LD structured data with offers, seller, return policy, and absolute images", () => {
    const { container } = render(
      <ProductJsonLd
        product={mockProduct}
        baseUrl="https://jradianceco.com"
        averageRating={4.8}
        reviewCount={12}
      />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const json = JSON.parse(script!.textContent || "{}");
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("Product");
    expect(json.name).toBe("Radiance Vitamin C Serum");
    expect(json.sku).toBe("JR-SKIN-001");
    expect(json.mpn).toBe("JR-SKIN-001");
    expect(json.brand).toEqual({
      "@type": "Brand",
      name: "JRADIANCE",
    });

    // Images must be an array of absolute URLs
    expect(Array.isArray(json.image)).toBe(true);
    expect(json.image[0]).toBe("https://jradianceco.com/uploads/serum-1.jpg");
    expect(json.image[1]).toBe("https://example.com/serum-2.jpg");

    // Offers verification
    expect(json.offers["@type"]).toBe("Offer");
    expect(json.offers.price).toBe(30000);
    expect(json.offers.priceCurrency).toBe("NGN");
    expect(json.offers.availability).toBe("https://schema.org/InStock");
    expect(json.offers.itemCondition).toBe("https://schema.org/NewCondition");
    expect(json.offers.url).toBe("https://jradianceco.com/shop/products/radiance-vitamin-c-serum");
    expect(json.offers.seller).toEqual({
      "@type": "Organization",
      name: "JRADIANCE",
    });

    // Merchant listings verification
    expect(json.offers.hasMerchantReturnPolicy).toBeDefined();
    expect(json.offers.hasMerchantReturnPolicy.merchantReturnDays).toBe(7);
    expect(json.offers.shippingDetails).toBeDefined();

    // Ratings
    expect(json.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "12",
      bestRating: "5",
      worstRating: "1",
    });
  });

  it("omits aggregateRating when review count or rating is 0 to comply with Google rich snippet rules", () => {
    const { container } = render(
      <ProductJsonLd
        product={mockProduct}
        baseUrl="https://jradianceco.com"
        averageRating={0}
        reviewCount={0}
      />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const json = JSON.parse(script!.textContent || "{}");
    expect(json.aggregateRating).toBeUndefined();
  });

  it("createProductMetadata generates valid canonical and OpenGraph URLs pointing to /shop/products/[slug]", () => {
    const meta = createProductMetadata({
      name: mockProduct.name,
      slug: mockProduct.slug,
      description: mockProduct.description,
      price: mockProduct.price,
      image: mockProduct.images?.[0],
      inStock: true,
      category: mockProduct.category,
      brand: "JRADIANCE",
    });

    expect(meta.alternates?.canonical).toBe(
      "https://jradianceco.com/shop/products/radiance-vitamin-c-serum"
    );
    expect(meta.openGraph?.url).toBe(
      "https://jradianceco.com/shop/products/radiance-vitamin-c-serum"
    );
  });
});
