/**
 * =============================================================================
 * Admin Login Page
 * =============================================================================
 * 
 * Secure authentication portal for admin users.
 * Only users with admin, agent, or chief_admin roles can access the admin panel.
 * 
 * Features:
 * - Email/password authentication via Supabase
 * - Role verification after login
 * - Connection error handling
 * - Loading states
 */

"use client";

import React, { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Mail, Loader2, UserPlus, WifiOff } from "lucide-react";
import { adminLogin } from "./actions";
import type { AuthState } from "@/types";

/**
 * Admin Login Page Component
 */
export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<
    AuthState | null,
    FormData
  >(adminLogin, null);

  const router = useRouter();

  // Input field styling
  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-radiance-goldColor transition-colors";

  // Redirect on successful login
  useEffect(() => {
    if (state?.message === "Login successful") {
      router.push("/admin/dashboard");
    }
  }, [state, router]);

  // Check if error is connection-related
  const isConnectionError =
    state?.error?.includes("timeout") ||
    state?.error?.includes("unavailable") ||
    state?.error?.includes("fetch failed");

  return (
    <div className="min-h-screen bg-radiance-charcoalTextColor flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <ShieldCheck
            className="mx-auto text-radiance-goldColor"
            size={48}
            aria-hidden="true"
          />
          <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase">
            Admin Portal
          </h1>
          <p className="text-[10px] text-white/40 font-bold uppercase">
            Authorized Access Only
          </p>
        </div>

        {/* Connection Error Banner */}
        {isConnectionError && (
          <div
            className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2"
            role="alert"
          >
            <WifiOff size={16} aria-hidden="true" />
            <span>Service Temporarily Unavailable</span>
          </div>
        )}

        {/* Display Error */}
        {state?.error && !isConnectionError && (
          <div
            className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl text-center"
            role="alert"
          >
            {state.error}
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <form action={formAction} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-white/30"
                size={18}
                aria-hidden="true"
              />
              <input
                name="email"
                type="email"
                placeholder="Admin Email"
                className={inputClass}
                required
                disabled={isPending}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock
                className="absolute left-3 top-3.5 text-white/30"
                size={18}
                aria-hidden="true"
              />
              <input
                name="password"
                type="password"
                placeholder="Master Password"
                className={inputClass}
                required
                disabled={isPending}
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-radiance-goldColor text-radiance-charcoalTextColor font-black py-4 rounded-xl hover:bg-white transition-all text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={isPending}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Authorizing...
                </span>
              ) : (
                "Authorize LogIn"
              )}
            </button>
          </form>
        </div>

        {/* Registration Link */}
        <div className="text-center">
          <Link
            href="/shop/auth"
            className="inline-flex items-center gap-2 text-[10px] font-bold text-white/40 hover:text-radiance-goldColor transition-colors uppercase tracking-wider"
          >
            <UserPlus size={14} aria-hidden="true" />
            Need an account? Register here
          </Link>
        </div>

        {/* Security Badge */}
        <p className="text-center text-[9px] text-white/20 font-medium">
          CHECK YOUR EMAIL AND CLICK ON THE LINK TO COMPLETE SIGNUP
        </p>
      </div>
    </div>
  );
}
