/**
 * =============================================================================
 * Admin Authentication Actions
 * =============================================================================
 * 
 * Server actions for admin authentication.
 * Uses AdminAuthService for all auth operations.
 * Follows SRP - only handles admin auth actions.
 * 
 * @author Philip Depaytez
 * @version 1.0.0
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import { AdminAuthService } from "@/auth/services/admin-auth.service";
import type { AuthState, LoginInput } from "@/types";
import { AuthErrorCode } from "@/types";

/**
 * Admin login server action
 * Only allows users with admin, agent, or chief_admin roles
 */
export async function adminLogin(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState | null> {
  try {
    const supabase = await createClient();
    const adminAuthService = new AdminAuthService(supabase);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate input
    if (!email || !password) {
      return { error: "Email and password are required", code: AuthErrorCode.INVALID_CREDENTIALS };
    }

    // Attempt login
    const result = await adminAuthService.login({
      email,
      password,
      rememberMe: true,
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
    console.error("[Admin Actions] login error:", error);
    return {
      error: error instanceof Error ? error.message : "Login failed",
      code: AuthErrorCode.LOGIN_FAILED,
    };
  }
}

/**
 * Admin logout server action
 */
export async function adminLogout(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const adminAuthService = new AdminAuthService(supabase);

    const result = await adminAuthService.signOut();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin Actions] logout error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Logout failed",
    };
  }
}

/**
 * Get current admin user
 * Used for defensive checks in layouts
 */
export async function getCurrentAdminUser(): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    full_name?: string | null;
  };
  error?: string;
} | null> {
  try {
    const supabase = await createClient();
    const adminAuthService = new AdminAuthService(supabase);

    const result = await adminAuthService.verifyAdminAccess();

    if (!result.success || !result.data) {
      return null;
    }

    return {
      success: true,
      user: {
        id: result.data.id,
        email: result.data.email,
        role: result.data.role,
        full_name: result.data.full_name,
      },
    };
  } catch (error) {
    console.error("[Admin Actions] getCurrentAdminUser error:", error);
    return null;
  }
}

/**
 * Get admin user info for sidebar display
 */
export async function getAdminUserInfo(): Promise<{
  success: boolean;
  user?: {
    email: string;
    role: string;
    full_name?: string | null;
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
      .select("email, full_name, role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return null;
    }

    return {
      success: true,
      user: {
        email: profile.email,
        role: profile.role,
        full_name: profile.full_name,
      },
    };
  } catch (error) {
    console.error("[Admin Actions] getAdminUserInfo error:", error);
    return null;
  }
}
