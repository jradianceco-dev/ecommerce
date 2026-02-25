/**
 * AuthRequired Component
 * ======================
 * 
 * Reusable component for protecting routes that require authentication.
 * 
 * Features:
 * - Shows loading state while auth is being checked
 * - Shows login prompt if not authenticated (doesn't redirect)
 * - Renders children when authenticated
 * 
 * Usage:
 * ```tsx
 * <AuthRequired
 *   redirectUrl="/shop/auth"
 *   loadingMessage="Loading your profile..."
 *   loginMessage="Please log in to view this page"
 * >
 *   <YourProtectedContent />
 * </AuthRequired>
 * ```
 * 
 * Note: This component does NOT redirect - it only shows a login prompt.
 * Middleware handles the actual redirects for protected routes.
 */

"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { Loader2, Lock, LogIn } from "lucide-react";

interface AuthRequiredProps {
  children: React.ReactNode;
  /**
   * URL to redirect to for login
   * @default "/shop/auth"
   */
  redirectUrl?: string;
  /**
   * Message to show while loading
   * @default "Loading..."
   */
  loadingMessage?: string;
  /**
   * Message to show when not authenticated
   * @default "Authentication Required"
   */
  titleMessage?: string;
  /**
   * Description to show when not authenticated
   * @default "Please log in to access this page"
   */
  descriptionMessage?: string;
  /**
   * Custom loading component
   * @default Default spinner
   */
  loadingComponent?: React.ReactNode;
  /**
   * Custom login prompt component
   * @default Default login prompt
   */
  loginPromptComponent?: React.ReactNode;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * Default loading component
 */
function DefaultLoading({ message }: { message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={48} className="animate-spin mx-auto text-radiance-goldColor mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * Default login prompt component
 */
function DefaultLoginPrompt({
  title,
  description,
  redirectUrl,
}: {
  title: string;
  description: string;
  redirectUrl: string;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md mx-4">
        <div className="h-16 w-16 bg-radiance-goldColor/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={32} className="text-radiance-goldColor" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <Link
          href={redirectUrl}
          className="inline-flex items-center gap-2 bg-radiance-goldColor text-white px-8 py-3 rounded-xl font-bold hover:bg-radiance-charcoalTextColor transition-colors"
        >
          <LogIn size={20} />
          Log In
        </Link>
      </div>
    </div>
  );
}

/**
 * AuthRequired Component
 */
export default function AuthRequired({
  children,
  redirectUrl = "/shop/auth",
  loadingMessage = "Loading...",
  titleMessage = "Authentication Required",
  descriptionMessage = "Please log in to access this page",
  loadingComponent,
  loginPromptComponent,
  className = "",
}: AuthRequiredProps) {
  const user = useUser();

  // Show loading while auth is being checked
  if (user === undefined) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <DefaultLoading message={loadingMessage} />
    );
  }

  // Show login prompt if not authenticated
  if (user === null) {
    return loginPromptComponent ? (
      <>{loginPromptComponent}</>
    ) : (
      <DefaultLoginPrompt
        title={titleMessage}
        description={descriptionMessage}
        redirectUrl={redirectUrl}
      />
    );
  }

  // User is authenticated - render children
  return <>{children}</>;
}

/**
 * AuthRequired with full page layout
 * Use this for entire pages that require authentication
 */
export function AuthRequiredPage({
  children,
  redirectUrl = "/shop/auth",
  loadingMessage = "Loading...",
  titleMessage = "Authentication Required",
  descriptionMessage = "Please log in to access this page",
}: Omit<AuthRequiredProps, "className" | "loadingComponent" | "loginPromptComponent">) {
  return (
    <AuthRequired
      redirectUrl={redirectUrl}
      loadingMessage={loadingMessage}
      titleMessage={titleMessage}
      descriptionMessage={descriptionMessage}
    >
      {children}
    </AuthRequired>
  );
}
