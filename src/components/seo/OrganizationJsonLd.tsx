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
            identifier: "NG",
          },
          {
            "@type": "Country",
            name: "United States",
            identifier: "US",
          },
          {
            "@type": "Country",
            name: "United Kingdom",
            identifier: "GB",
          },
          {
            "@type": "AdministrativeArea",
            name: "Europe",
            alternateName: "European Union",
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
          areaServed: ["NG", "US", "GB", "EU"],
          email: "info@jradianceco.com",
        },
        sameAs: [
          "https://www.instagram.com/jradiancecosmetics/",
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}#local-business`,
        name: "JRADIANCE Cosmetics",
        alternateName: ["Jradiance", "Jradianceco", "JRADIANCE Store"],
        image: `${siteUrl}/logo-removebg.png`,
        url: siteUrl,
        priceRange: "₦5,000 - ₦1,000,000 / $5 - $650",
        description: "Premium organic skincare and cosmetics store offering authentic beauty products for body care, skin care, makeup, and fragrances with worldwide shipping.",
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
            "@type": "AdministrativeArea",
            name: "Europe",
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
        paymentAccepted: ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Stripe", "Paystack"],
        currenciesAccepted: "NGN, USD",
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
