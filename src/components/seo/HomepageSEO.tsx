/**
 * Homepage SEO Component
 *
 * Comprehensive SEO structured data for the landing page including:
 * - Organization schema
 * - WebSite schema
 * - ItemList schema for products
 * - Enhanced metadata keywords
 */

"use client";

import OrganizationJsonLd from "./OrganizationJsonLd";

interface HomepageSEOProps {
  baseUrl?: string;
}

export default function HomepageSEO({ baseUrl }: HomepageSEOProps) {
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com";

  // ItemList structured data for featured products/categories
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "CategoryCode",
          name: "Organic Skincare Products",
          url: `${siteUrl}/shop?category=skincare`,
          description: "Premium organic skincare products for radiant, healthy skin. Natural ingredients for all skin types.",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "CategoryCode",
          name: "Organic Body Care Products",
          url: `${siteUrl}/shop?category=body-care`,
          description: "Luxurious organic body care products including lotions, creams, and body butters.",
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "CategoryCode",
          name: "Makeup & Cosmetics",
          url: `${siteUrl}/shop?category=makeup`,
          description: "Professional makeup and cosmetics for every occasion. Authentic beauty products.",
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@type": "CategoryCode",
          name: "Fragrances & Perfumes",
          url: `${siteUrl}/shop?category=fragrance`,
          description: "Premium fragrances and perfumes for men and women.",
        },
      },
    ],
  };

  // FAQ structured data for common questions
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What products does JRADIANCE offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JRADIANCE offers premium organic skincare products, body care products, makeup, cosmetics, and fragrances. All our products are authentic and sourced from trusted manufacturers.",
        },
      },
      {
        "@type": "Question",
        name: "Are JRADIANCE products organic?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we specialize in organic skincare and body care products made with natural ingredients. We also offer premium cosmetics and fragrances.",
        },
      },
      {
        "@type": "Question",
        name: "Does JRADIANCE deliver in Nigeria?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, JRADIANCE delivers nationwide across Nigeria. We offer free delivery on orders over ₦50,000.",
        },
      },
      {
        "@type": "Question",
        name: "How can I contact JRADIANCE customer service?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can reach our customer service team through our contact page, email, or social media channels. We're available Monday to Saturday, 9 AM to 9 PM.",
        },
      },
    ],
  };

  return (
    <>
      <OrganizationJsonLd baseUrl={siteUrl} />
      
      {/* ItemList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
