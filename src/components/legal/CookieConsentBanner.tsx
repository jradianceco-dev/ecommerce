"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("jradiance_cookie_consent");
      if (!consent) {
        // Small delay so it doesn't block initial page paint
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage access restricted in private mode
    }
  }, []);

  function handleAcceptAll() {
    try {
      localStorage.setItem("jradiance_cookie_consent", "all");
    } catch {}
    setIsVisible(false);
  }

  function handleRejectNonEssential() {
    try {
      localStorage.setItem("jradiance_cookie_consent", "essential");
    } catch {}
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[60] bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-gray-200/80 shadow-2xl animate-slideUp">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-50 text-radiance-goldColor flex items-center justify-center shrink-0">
          <Cookie size={20} />
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Your Privacy Choices</h3>
            <button
              onClick={handleRejectNonEssential}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Dismiss cookie notice"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            We use essential cookies to maintain checkout security and cart continuity. We also use optional analytics cookies to enhance your shopping experience in accordance with EU GDPR, UK DPA, and CCPA guidelines.
          </p>

          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2 px-3 bg-radiance-charcoalTextColor hover:bg-radiance-goldColor text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              Accept All
            </button>
            <button
              onClick={handleRejectNonEssential}
              className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Essential Only
            </button>
          </div>

          <div className="text-[11px] text-gray-400 pt-0.5">
            <Link href="/privacy" className="underline hover:text-radiance-goldColor transition">
              Read our Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
