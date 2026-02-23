/**
 * =============================================================================
 * Customer Authentication Actions
 * =============================================================================
 * 
 * Server actions for customer authentication.
 * Uses CustomerAuthService for all auth operations.
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import { CustomerAuthService } from "@/auth/services/customer-auth.service";
import type { AuthState, LoginInput, SignupInput, EmailInput, PasswordResetInput } from "@/types";
import { AuthErrorCode } from "@/types";

/**
 * Customer login server action
 */
export async function customerLogin(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState | null> {
  try {
    const supabase = await createClient();
    const customerAuthService = new CustomerAuthService(supabase);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate input
    if (!email || !password) {
      return { error: "Email and password are required", code: AuthErrorCode.INVALID_CREDENTIALS };
    }

    // Attempt login
    const result = await customerAuthService.login({
      email,
      password,
    });

    if (!result.success) {
      return {
        error: result.error,
        code: result.code,
      };
    }

    // Login successful
    return { error: null, message: "Login successful" };
  } catch (error) {
    console.error("[Customer Actions] login error:", error);
    return {
      error: error instanceof Error ? error.message : "Login failed",
      code: AuthErrorCode.LOGIN_FAILED,
    };
  }
}

/**
 * Customer signup server action
 * All new users start as 'customer' role
 * Email confirmation required
 */
export async function customerSignup(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState | null> {
  try {
    const supabase = await createClient();
    const customerAuthService = new CustomerAuthService(supabase);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;
    const phone = formData.get("phone") as string;

    // Attempt signup
    const result = await customerAuthService.signup({
      email,
      password,
      fullName,
      phone,
    });

    if (!result.success) {
      return {
        error: result.error,
        code: result.code,
      };
    }

    // Check if email confirmation is required (no session created)
    // The service handles this, but we need to inform the UI
    if (!result.data?.is_active) {
      return {
        error: null,
        message: "Please check your email and click the confirmation link to complete your registration.",
        requiresConfirmation: true,
        email: email,
      };
    }

    // Signup successful with immediate session
    return { error: null, message: "Signup successful" };
  } catch (error) {
    console.error("[Customer Actions] signup error:", error);
    return {
      error: error instanceof Error ? error.message : "Signup failed",
      code: AuthErrorCode.SIGNUP_FAILED,
    };
  }
}

/**
 * Customer logout server action
 */
export async function customerLogout(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const customerAuthService = new CustomerAuthService(supabase);

    const result = await customerAuthService.signOut();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error("[Customer Actions] logout error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Logout failed",
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState | null> {
  try {
    const supabase = await createClient();
    const customerAuthService = new CustomerAuthService(supabase);

    const email = formData.get("email") as string;

    if (!email) {
      return { error: "Email is required", code: AuthErrorCode.INVALID_CREDENTIALS };
    }

    const result = await customerAuthService.sendPasswordResetEmail({ email });

    if (!result.success) {
      return {
        error: result.error,
        code: result.code,
      };
    }

    return {
      error: null,
      message: "Password reset email sent successfully",
      email: email,
    };
  } catch (error) {
    console.error("[Customer Actions] forgotPassword error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to send reset email",
      code: AuthErrorCode.PASSWORD_RESET_FAILED,
    };
  }
}

/**
 * Reset password with new credentials
 */
export async function resetPassword(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState | null> {
  try {
    const supabase = await createClient();
    const customerAuthService = new CustomerAuthService(supabase);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    const result = await customerAuthService.resetPassword({
      password,
      confirmPassword,
    });

    if (!result.success) {
      return {
        error: result.error,
        code: result.code,
      };
    }

    return { error: null, message: "Password updated successfully" };
  } catch (error) {
    console.error("[Customer Actions] resetPassword error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to reset password",
      code: AuthErrorCode.PASSWORD_RESET_FAILED,
    };
  }
}

/**
 * Verify email confirmation token
 */
export async function verifyEmailConfirmation(
  tokenHash: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const supabase = await createClient();
    const customerAuthService = new CustomerAuthService(supabase);

    const result = await customerAuthService.verifyEmail(tokenHash);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      message: "Email confirmed successfully",
    };
  } catch (error) {
    console.error("[Customer Actions] verifyEmail error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email verification failed",
    };
  }
}

/**
 * Get current customer user
 */
export async function getCurrentCustomerUser(): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    full_name?: string | null;
    phone?: string | null;
  };
} | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name, phone, role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return null;
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
      },
    };
  } catch (error) {
    console.error("[Customer Actions] getCurrentCustomerUser error:", error);
    return null;
  }
}
