import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import BottomNavBar from "@/components/BottomNavBar";
import TopBar from "@/components/TopBar";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import { createBaseMetadata } from "@/utils/seo/metadata-factory";

const bodyClasses = `
  min-h-screen
  bg-radiance-creamBackgroundColor
  text-radiance-charcoalTextColor
  font-sans
  antialiased
  pt-20
`;

// Use the metadata factory for consistent SEO configuration
export const metadata: Metadata = createBaseMetadata({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com",
  siteName: "JRADIANCE",
  defaultTitle: "JRADIANCE | Premium Cosmetics & Skincare",
  defaultDescription: "Authentic skincare and cosmetics for the radiant Nigerian soul.",
  locale: "en_NG",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization structured data for SEO
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "JRADIANCE",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com",
    logo: `${process.env.NEXT_PUBLIC_BASE_URL || "https://jradianceco.com"}/logo-removebg.png`,
    description: "Authentic skincare and cosmetics for the radiant Nigerian soul.",
    founder: "Philip Depaytez",
    foundingDate: "2024",
    areaServed: ["NG", "US", "GB", "ZA"],
    brand: {
      "@type": "Brand",
      name: "JRADIANCE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
    sameAs: [
      "https://www.facebook.com/jradianceco",
      "https://www.instagram.com/jradianceco",
      "https://twitter.com/jradianceco",
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${bodyClasses}`}>
        {/* Load Paystack inline script globally */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
          async
        />

        <ToastProvider>
          <UserProvider>
            <CartProvider>
              {/* Top Bar */}
              <TopBar />

              {/* Main content */}
              <main className="pb-20 md:pb-0">
                <div className="mx-auto max-w-6xl px-6 py-12">{children}</div>
              </main>

              {/* Nav bar */}
              <BottomNavBar />
            </CartProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
