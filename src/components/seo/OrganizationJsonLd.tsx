/**
 * Organization JSON-LD Structured Data
 *
 * Generates schema.org/Organization and schema.org/LocalBusiness
 * structured data for rich search results and Google Business integration.
 */

interface OrganizationJsonLdProps {
  baseUrl?: string;
}

export default function OrganizationJsonLd({ baseUrl }: OrganizationJsonLdProps) {
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: "JRADIANCE",
        alternateName: ["Jradiance", "Jradianceco", "JRADIANCE Cosmetics"],
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo-removebg.png`,
          width: "600",
          height: "60",
        },
        description: "JRADIANCE - Premium organic skincare and cosmetics for the radiant Nigerian soul. Authentic beauty products including organic body care, skin care, makeup, and fragrances.",
        founder: {
          "@type": "Person",
          name: "Philip Depaytez",
        },
        foundingDate: "2024",
        areaServed: [
          {
            "@type": "Country",
            name: "Nigeria",
          },
          {
            "@type": "Country",
            name: "United States",
          },
          {
            "@type": "Country",
            name: "United Kingdom",
          },
          {
            "@type": "Country",
            name: "South Africa",
          },
        ],
        brand: {
          "@type": "Brand",
          "@id": `${siteUrl}#brand`,
          name: "JRADIANCE",
          alternateName: ["Jradiance", "Jradianceco"],
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/logo-removebg.png`,
          },
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: ["English"],
          areaServed: ["NG", "US", "GB", "ZA"],
        },
        sameAs: [
          "https://www.facebook.com/jradianceco",
          "https://www.instagram.com/jradianceco",
          "https://twitter.com/jradianceco",
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}#local-business`,
        name: "JRADIANCE Cosmetics",
        alternateName: ["Jradiance", "Jradianceco", "JRADIANCE Store"],
        image: `${siteUrl}/logo-removebg.png`,
        url: siteUrl,
        telephone: "+234-XXX-XXX-XXXX",
        priceRange: "₦₦",
        description: "Premium organic skincare and cosmetics store offering authentic beauty products for body care, skin care, makeup, and fragrances.",
        areaServed: [
          {
            "@type": "City",
            name: "Lagos",
          },
          {
            "@type": "Country",
            name: "Nigeria",
          },
        ],
        brand: {
          "@type": "Brand",
          name: "JRADIANCE",
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "21:00",
        },
        paymentAccepted: ["Cash", "Credit Card", "Debit Card", "Bank Transfer"],
        currenciesAccepted: "NGN",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: "JRADIANCE - Premium Cosmetics & Skincare",
        alternateName: ["Jradianceco", "JRADIANCE Online Store"],
        description: "Shop authentic organic skincare, body care, makeup, and fragrances at JRADIANCE. Premium cosmetics for the radiant Nigerian soul.",
        publisher: {
          "@id": `${siteUrl}#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/shop?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
