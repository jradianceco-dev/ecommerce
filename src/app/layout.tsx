import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import BottomNavBar from "@/components/BottomNavBar";
import TopBar from "@/components/TopBar";
import { UserProvider } from "@/context/UserContext";

const bodyClasses = `
  min-h-screen 
  bg-radiance-creamBackgroundColor 
  text-radiance-charcoalTextColor 
  font-sans
  antialiased
  pt-20 
`;

export const metadata: Metadata = {
  title: {
    default: "JRADIANCE STORE | Organic body care and beauty products ",
    template: "%s | JRADIANCE STORE",
  },
  description:
    "JRADIANCE is a digital market place to shop for organic body care and beauty products",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/favicon.ico",
  openGraph: {
    title: "JRADIANCE STORE",
    description: "Shop for organic body care and beauty products.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
    siteName: "JRADIANCE",
    images: [{ url: "/logo-removebg.png", width: 1200, height: 630 }],
    type: "website",
  },
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}` || "http://jradianceco.com"},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodyClasses}`}>
        {/* Load Paystack inline script globally */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
          async
        />

        <UserProvider>
          {/* Top Bar */}
          <TopBar />

          {/* Main content */}
          <main className="pb-20 md:pb-0">
            <div className="mx-auto max-w-6xl px-6 py-12">{children}</div>
          </main>

          {/* Nav bar */}
          <BottomNavBar />
        </UserProvider>
      </body>
    </html>
  );
}
