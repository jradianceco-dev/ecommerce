"use client";

import React, { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRoundPen, Lock, Loader2 } from "lucide-react";
import { resetPassword } from "../action";

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, null);
  const router = useRouter();

  // Handle successful password reset
  useEffect(() => {
    if (state?.message && !state.error) {
      // Redirect to login after successful password reset
      setTimeout(() => {
        router.push("/shop/auth");
      }, 3000);
    }
  }, [state, router]);

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-radiance-goldColor outline-none transition-all";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-50">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-radiance-goldColor/10 rounded-full flex items-center justify-center text-radiance-goldColor mb-2">
            <UserRoundPen size={24} />
          </div>
          <h1 className="text-2xl font-black text-radiance-charcoalTextColor tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Enter your new password below
          </p>
        </div>

        {/* Display Messages from Server Action */}
        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in zoom-in duration-200">
            {state.error}
          </div>
        )}

        {/* Success Message */}
        {state?.message && !state.error && (
          <div className="p-3 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-xl animate-in fade-in zoom-in duration-200">
            <p>✅ {state.message}</p>
            <p className="mt-1">Redirecting you to login...</p>
          </div>
        )}

        {/* Password Reset Form */}
        <form action={formAction} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              name="password"
              type="password"
              placeholder="New Password"
              className={inputClass}
              required
              disabled={isPending}
              minLength={6}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              name="confirm_password"
              type="password"
              placeholder="Confirm New Password"
              className={inputClass}
              required
              disabled={isPending}
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-radiance-charcoalTextColor text-white font-bold py-4 rounded-xl hover:bg-radiance-goldColor transition-all shadow-lg text-sm"
          >
            {isPending && <Loader2 size={18} className="animate-spin" />}
            Update Password
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center pt-4 border-t border-gray-50">
          <button
            type="button"
            disabled={isPending}
            onClick={() => router.push("/shop/auth")}
            className="text-xs font-bold text-radiance-goldColor hover:underline underline-offset-4"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
