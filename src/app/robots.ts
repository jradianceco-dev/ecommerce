/**
 * Robots.txt Generator
 * 
 * Generates robots.txt dynamically to guide search engine crawlers.
 * Follows SOLID principles:
 * - Single Responsibility: Only handles robots.txt generation
 * - KISS: Simple, straightforward implementation
 */

import { MetadataRoute } from "next";

/**
 * Base URL for the site - uses environment variable
 */
const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com";
};

/**
 * Generates the robots.txt configuration
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/products", "/about-us"],
        disallow: [
          "/admin",
          "/api",
          "/_next",
          "/static",
          "/*.json$",
          "/*?*sort=",
          "/*?*filter=",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/shop", "/products", "/about-us"],
        disallow: ["/admin", "/api"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/products", "/shop"],
        disallow: ["/admin"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
    ],
    host: baseUrl,
  };
}
