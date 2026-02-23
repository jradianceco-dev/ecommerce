/**
 * =============================================================================
 * Base Authentication Service
 * =============================================================================
 * 
 * Core authentication service providing common Supabase operations.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthResult,
  AuthenticatedUser,
  SessionConfig,
} from "@/types";
import { SESSION_CONFIGS, AuthErrorCode } from "@/types";

/**
 * Base authentication service with common operations
 */
export class AuthService {
  protected supabase: SupabaseClient;
  protected sessionConfig: SessionConfig;

  constructor(
    supabase: SupabaseClient,
    sessionConfig: SessionConfig = SESSION_CONFIGS.CUSTOMER
  ) {
    this.supabase = supabase;
    this.sessionConfig = sessionConfig;
  }

  /**
   * Get current authenticated user from Supabase
   * Returns null if not authenticated or error occurs
   */
  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    try {
      const { data, error } = await this.supabase.auth.getUser();

      if (error || !data.user) {
        return null;
      }

      // Get profile to get accurate role and active status
      const profile = await this.getUserProfile(data.user.id);

      return {
        id: data.user.id,
        email: data.user.email || "",
        role: profile?.role || (data.user.user_metadata?.role as any) || "customer",
        is_active: profile?.is_active ?? true,
        full_name: profile?.full_name,
      };
    } catch (error) {
      console.error("[AuthService] getCurrentUser error:", error);
      return null;
    }
  }

  /**
   * Get user profile from database
   */
  async getUserProfile(userId: string): Promise<{
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    is_active: boolean;
    phone?: string | null;
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("id, email, full_name, role, is_active, phone")
        .eq("id", userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("[AuthService] getUserProfile error:", error);
      return null;
    }
  }

  /**
   * Get admin staff record if user has one
   */
  async getAdminStaffRecord(userId: string): Promise<{
    staff_id: string | null;
    department: string | null;
    position: string | null;
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from("admin_staff")
        .select("staff_id, department, position")
        .eq("id", userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("[AuthService] getAdminStaffRecord error:", error);
      return null;
    }
  }

  /**
   * Verify user has admin role
   */
  isAdminRole(role: string | null | undefined): boolean {
    const allowedRoles = ["admin", "agent", "chief_admin"];
    return role ? allowedRoles.includes(role) : false;
  }

  /**
   * Verify user is active
   */
  isUserActive(isActive: boolean | null | undefined): boolean {
    return isActive === true;
  }

  /**
   * Validate email format
   */
  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  protected validatePassword(password: string): { valid: boolean; error?: string } {
    if (password.length < 6) {
      return { valid: false, error: "Password must be at least 6 characters" };
    }
    return { valid: true };
  }

  /**
   * Full admin access verification
   * Returns AuthResult with user data if successful
   */
  async verifyAdminAccess(): Promise<AuthResult<AuthenticatedUser>> {
    // Step 1: Get authenticated user
    const user = await this.getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
        code: AuthErrorCode.SESSION_INVALID,
      };
    }

    // Step 2: Verify admin role
    if (!this.isAdminRole(user.role)) {
      return {
        success: false,
        error: `Unauthorized role: ${user.role}`,
        code: AuthErrorCode.UNAUTHORIZED_ROLE,
      };
    }

    // Step 3: Verify active status
    if (!this.isUserActive(user.is_active)) {
      return {
        success: false,
        error: "User account is inactive",
        code: AuthErrorCode.ACCOUNT_INACTIVE,
      };
    }

    return {
      success: true,
      data: user,
    };
  }

  /**
   * Full customer access verification
   * Returns AuthResult with user data if successful
   */
  async verifyCustomerAccess(): Promise<AuthResult<AuthenticatedUser>> {
    const user = await this.getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated",
        code: AuthErrorCode.SESSION_INVALID,
      };
    }

    if (!this.isUserActive(user.is_active)) {
      return {
        success: false,
        error: "User account is inactive",
        code: AuthErrorCode.ACCOUNT_INACTIVE,
      };
    }

    return {
      success: true,
      data: user,
    };
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<AuthResult<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message,
          code: AuthErrorCode.LOGOUT_FAILED,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
        code: AuthErrorCode.LOGOUT_FAILED,
      };
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<AuthResult<void>> {
    try {
      const { error } = await this.supabase.auth.refreshSession();

      if (error) {
        return {
          success: false,
          error: error.message,
          code: AuthErrorCode.SESSION_EXPIRED,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Session refresh failed",
        code: AuthErrorCode.SESSION_EXPIRED,
      };
    }
  }

  /**
   * Update session configuration
   */
  setSessionConfig(config: SessionConfig): void {
    this.sessionConfig = config;
  }

  /**
   * Get current session configuration
   */
  getSessionConfig(): SessionConfig {
    return this.sessionConfig;
  }
}
