"use client";

import React from "react";
import Link from "next/link";
import { Mail, MapPin, Instagram, ShieldCheck, Lock, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-radiance-charcoalTextColor text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl sm:text-3xl font-black tracking-wider text-white">
                JRADIANCE
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-radiance-goldColor font-semibold">
                Luxury Cosmetics & Organic Skincare
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Crafting premium organic beauty, body care, and cosmetic essentials designed to illuminate your natural radiance. Proudly serving Nigeria, the United States, United Kingdom, and Europe.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/jradiancecosmetics/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-radiance-goldColor text-gray-300 hover:text-white flex items-center justify-center transition duration-300"
                aria-label="Follow JRADIANCE on Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="mailto:support@jradianceco.com"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-radiance-goldColor text-gray-300 hover:text-white flex items-center justify-center transition duration-300"
                aria-label="Email JRADIANCE Support"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-radiance-goldColor">
              Shop & Explore
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/shop" className="hover:text-white transition flex items-center gap-1">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-white transition">
                  About Our Brand
                </Link>
              </li>
              <li>
                <Link href="/shop/track-order" className="hover:text-white transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shop/contact" className="hover:text-white transition">
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Regulatory */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-radiance-goldColor">
              Legal & Compliance
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition">
                  Return & Hygiene Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition">
                  Shipping & Customs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Regions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-radiance-goldColor">
              Global Support
            </h3>
            <div className="space-y-2.5 text-xs text-gray-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-radiance-goldColor shrink-0 mt-0.5" />
                <span>Headquarters: Lagos, Nigeria • Worldwide Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-radiance-goldColor shrink-0" />
                <a href="mailto:support@jradianceco.com" className="hover:text-white underline">
                  support@jradianceco.com
                </a>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500">
                <Lock size={14} className="text-emerald-500" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} JRADIANCE Cosmetics. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Accepted Payments:</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-semibold text-gray-300">Stripe</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-semibold text-gray-300">Visa / Mastercard</span>
            <span className="px-2 py-0.5 bg-white/10 rounded font-semibold text-gray-300">Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
