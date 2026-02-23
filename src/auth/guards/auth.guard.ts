/**
 * =============================================================================
 * Authentication Guard
 * =============================================================================
 * 
 * Centralized guard for route protection.
 * Used by middleware and layout components.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { GuardResult, AuthenticatedUser, UserRole } from "@/types";

/**
 * Authentication Guard for route protection
 */
export class AuthGuard {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Verify admin access for protected routes
   * Checks: authenticated + admin role + active status
   */
  async verifyAdminAccess(): Promise<GuardResult> {
    try {
      // Step 1: Get authenticated user
      const { data, error } = await this.supabase.auth.getUser();

      if (error || !data.user) {
        return {
          success: false,
          isAuthenticated: false,
          error: "Not authenticated",
          redirectUrl: "/admin/login",
        };
      }

      // Step 2: Get user profile
      const profile = await this.getUserProfile(data.user.id);

      if (!profile) {
        return {
          success: false,
          isAuthenticated: true,
          error: "Profile not found",
          redirectUrl: "/admin/login",
        };
      }

      // Step 3: Verify admin role
      const allowedRoles: UserRole[] = ["admin", "agent", "chief_admin"];
      if (!allowedRoles.includes(profile.role as UserRole)) {
        return {
          success: false,
          isAuthenticated: true,
          isAdmin: false,
          error: `Unauthorized role: ${profile.role}`,
          redirectUrl: "/",
        };
      }

      // Step 4: Verify active status
      if (!profile.is_active) {
        await this.supabase.auth.signOut();
        return {
          success: false,
          isAuthenticated: true,
          error: "Account is inactive",
          redirectUrl: "/admin/login",
        };
      }

      // All checks passed
      return {
        success: true,
        isAuthenticated: true,
        isAdmin: true,
        isChiefAdmin: profile.role === "chief_admin",
        user: {
          id: data.user.id,
          email: data.user.email || "",
          role: profile.role as UserRole,
          is_active: profile.is_active,
          full_name: profile.full_name,
        },
      };
    } catch (error) {
      console.error("[AuthGuard] verifyAdminAccess error:", error);
      return {
        success: false,
        isAuthenticated: false,
        error: "Authentication service error",
        redirectUrl: "/admin/login",
      };
    }
  }

  /**
   * Verify customer access for protected routes
   * Checks: authenticated + active status
   */
  async verifyCustomerAccess(redirectPath: string = "/shop/auth"): Promise<GuardResult> {
    try {
      const { data, error } = await this.supabase.auth.getUser();

      if (error || !data.user) {
        return {
          success: false,
          isAuthenticated: false,
          error: "Not authenticated",
          redirectUrl: redirectPath,
        };
      }

      const profile = await this.getUserProfile(data.user.id);

      if (!profile) {
        return {
          success: false,
          isAuthenticated: true,
          error: "Profile not found",
          redirectUrl: redirectPath,
        };
      }

      if (!profile.is_active) {
        await this.supabase.auth.signOut();
        return {
          success: false,
          isAuthenticated: true,
          error: "Account is inactive",
          redirectUrl: redirectPath,
        };
      }

      return {
        success: true,
        isAuthenticated: true,
        isAdmin: ["admin", "agent", "chief_admin"].includes(profile.role),
        user: {
          id: data.user.id,
          email: data.user.email || "",
          role: profile.role as UserRole,
          is_active: profile.is_active,
          full_name: profile.full_name,
        },
      };
    } catch (error) {
      console.error("[AuthGuard] verifyCustomerAccess error:", error);
      // Allow request to proceed on service failure
      return {
        success: true,
        isAuthenticated: true,
      };
    }
  }

  /**
   * Check if user is authenticated (lightweight check)
   * Does not verify role or active status
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      return !error && !!data.user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user without full verification
   * Returns null if not authenticated or error occurs
   */
  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    try {
      const { data, error } = await this.supabase.auth.getUser();

      if (error || !data.user) {
        return null;
      }

      const profile = await this.getUserProfile(data.user.id);

      if (!profile) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email || "",
        role: profile.role as UserRole,
        is_active: profile.is_active,
        full_name: profile.full_name,
      };
    } catch (error) {
      console.error("[AuthGuard] getCurrentUser error:", error);
      return null;
    }
  }

  /**
   * Get user profile from database
   */
  private async getUserProfile(userId: string): Promise<{
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    is_active: boolean;
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("id, email, full_name, role, is_active")
        .eq("id", userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("[AuthGuard] getUserProfile error:", error);
      return null;
    }
  }
}

/**
 * Factory function to create AuthGuard instance
 * Used by middleware to avoid circular dependencies
 */
export function createAuthGuard(supabase: SupabaseClient): AuthGuard {
  return new AuthGuard(supabase);
}
