/**
 * Admin Loading State Component
 * 
 * Reusable loading state for admin pages.
 * Provides consistent loading UI across the admin panel.
 */

import { Loader2 } from "lucide-react";

interface AdminLoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function AdminLoadingState({
  message = "Loading...",
  size = "md",
  fullScreen = false,
}: AdminLoadingStateProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const content = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-radiance-goldColor border-t-transparent`} />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-radiance-creamBackgroundColor/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

export default AdminLoadingState;
