/**
 * Floating Report Issue Button
 * 
 * Visible on all pages for easy issue reporting
 * Follows user without compromising UX
 */

"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";

export default function FloatingReportButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Hide on admin pages and auth pages
  if (pathname?.startsWith("/admin") || pathname?.includes("/auth")) {
    return null;
  }

  return (
    <div
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
          Report an Issue
          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      )}

      {/* Button */}
      <button
        onClick={() => router.push("/shop/report-issue")}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        title="Report an issue or bug"
      >
        <AlertTriangle size={10} />
        <span className="hidden md:inline font-semibold text-sm">Report Issue</span>
      </button>
    </div>
  );
}
