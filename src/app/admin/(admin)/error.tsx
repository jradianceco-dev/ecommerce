/**
 * Error Boundary for Admin Routes
 * Catches and displays errors gracefully
 */

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
      <p className="text-gray-600">
        {error.message || "An error occurred while loading this page"}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-radiance-goldColor px-6 py-2 text-white font-bold hover:bg-radiance-charcoalTextColor transition-colors"
        >
          Try again
        </button>
        <a
          href="/admin/dashboard"
          className="rounded-lg bg-gray-100 px-6 py-2 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
