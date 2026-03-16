/**
 * Currency Toggle Component
 * 
 * Allows users to switch between NGN and USD
 */

"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { Globe } from "lucide-react";

export default function CurrencyToggle() {
  const { currency, setCurrency, toggleCurrency } = useCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full text-xs font-semibold hover:bg-gray-50 transition-all"
      title={`Switch to ${currency === "NGN" ? "USD" : "NGN"}`}
    >
      <Globe size={14} className="text-radiance-goldColor" />
      <span className="hidden sm:inline">{currency}</span>
      <span className="sm:hidden">{currency === "NGN" ? "₦" : "$"}</span>
    </button>
  );
}
