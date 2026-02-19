/**
 * Breadcrumb JSON-LD Structured Data Component
 * 
 * Generates schema.org/BreadcrumbList structured data for navigation.
 * Follows SOLID principles:
 * - Single Responsibility: Only handles breadcrumb JSON-LD
 * - ISP: Focused interface for breadcrumb schema only
 */

/**
 * Individual breadcrumb item
 */
interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

/**
 * Props for BreadcrumbJsonLd component
 */
interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbJsonLd Component
 * 
 * Injects JSON-LD structured data for breadcrumb navigation.
 * Helps Google understand site hierarchy and display breadcrumbs in search results.
 */
export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
