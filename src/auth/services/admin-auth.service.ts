/**
 * =============================================================================
 * Admin Authentication Service
 * =============================================================================
 * 
 * Specialized authentication service for admin users.
 * Extends base AuthService with admin-specific operations.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AuthService } from "./auth.service";
import type {
  AuthResult,
  AdminUser,
  LoginInput,
} from "@/types";
import { SESSION_CONFIGS, AuthErrorCode } from "@/types";

/**
 * Admin-specific authentication service
 */
export class AdminAuthService extends AuthService {
  constructor(supabase: SupabaseClient) {
    super(supabase, SESSION_CONFIGS.ADMIN); // 30 days persistent session
  }

  /**
   * Admin login with role verification
   * Only allows admin, agent, chief_admin roles
   */
  async login(input: LoginInput): Promise<AuthResult<AdminUser>> {
    try {
      // Validate input
      if (!input.email || !input.password) {
        return {
          success: false,
          error: "Email and password are required",
          code: AuthErrorCode.INVALID_CREDENTIALS,
        };
      }

      // Attempt sign in
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        return {
          success: false,
          error: this.mapAuthError(error),
          code: this.mapAuthErrorCode(error),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: "Authentication failed",
          code: AuthErrorCode.LOGIN_FAILED,
        };
      }

      // Verify admin role
      const profile = await this.getUserProfile(data.user.id);

      if (!profile) {
        return {
          success: false,
          error: "User profile not found",
          code: AuthErrorCode.UNKNOWN_ERROR,
        };
      }

      // Check if user has admin role
      if (!this.isAdminRole(profile.role)) {
        // Sign out user who doesn't have admin role
        await this.supabase.auth.signOut();

        return {
          success: false,
          error: "Access denied. Admin privileges required.",
          code: AuthErrorCode.UNAUTHORIZED_ROLE,
        };
      }

      // Check if user is active
      if (!this.isUserActive(profile.is_active)) {
        await this.supabase.auth.signOut();

        return {
          success: false,
          error: "Account is inactive. Contact administrator.",
          code: AuthErrorCode.ACCOUNT_INACTIVE,
        };
      }

      // Update last login timestamp for admin staff
      await this.updateLastLogin(data.user.id);

      // Log admin login activity
      await this.logAdminLogin(data.user.id);

      return {
        success: true,
        data: {
          id: data.user.id,
          email: data.user.email || "",
          role: profile.role as AdminUser["role"],
          is_active: profile.is_active,
          full_name: profile.full_name,
          staff_id: undefined, // Will be populated if needed
        },
      };
    } catch (error) {
      console.error("[AdminAuthService] login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
        code: AuthErrorCode.LOGIN_FAILED,
      };
    }
  }

  /**
   * Verify admin has specific role level
   * Role hierarchy: agent < admin < chief_admin
   */
  async verifyRoleLevel(
    userId: string,
    requiredRole: "agent" | "admin" | "chief_admin"
  ): Promise<AuthResult<boolean>> {
    const roleHierarchy = {
      agent: 1,
      admin: 2,
      chief_admin: 3,
    };

    const profile = await this.getUserProfile(userId);

    if (!profile) {
      return {
        success: false,
        error: "Profile not found",
        code: AuthErrorCode.UNKNOWN_ERROR,
      };
    }

    const userRoleLevel = roleHierarchy[profile.role as keyof typeof roleHierarchy] ?? 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return {
        success: false,
        error: "Insufficient privileges",
        code: AuthErrorCode.ACCESS_DENIED,
      };
    }

    return { success: true, data: true };
  }

  /**
   * Check if admin can access a specific route
   */
  async canAccessRoute(userId: string, pathname: string): Promise<AuthResult<boolean>> {
    const profile = await this.getUserProfile(userId);

    if (!profile || !this.isAdminRole(profile.role)) {
      return {
        success: false,
        error: "Unauthorized",
        code: AuthErrorCode.UNAUTHORIZED_ROLE,
      };
    }

    // Chief admin can access everything
    if (profile.role === "chief_admin") {
      return { success: true, data: true };
    }

    // Agent restricted routes
    const agentRestrictedRoutes = ["/admin/users", "/admin/roles", "/admin/agents"];
    if (
      profile.role === "agent" &&
      agentRestrictedRoutes.some((route) => pathname.startsWith(route))
    ) {
      return {
        success: false,
        error: "Access denied. Chief admin only.",
        code: AuthErrorCode.ACCESS_DENIED,
      };
    }

    // Audit/Sales logs restricted (agent can't access)
    const logRoutes = ["/admin/audit-log", "/admin/sales-log"];
    if (
      profile.role === "agent" &&
      logRoutes.some((route) => pathname.startsWith(route))
    ) {
      return {
        success: false,
        error: "Access denied. Admin role required.",
        code: AuthErrorCode.ACCESS_DENIED,
      };
    }

    return { success: true, data: true };
  }

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.supabase
        .from("admin_staff")
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    } catch (error) {
      console.error("[AdminAuthService] updateLastLogin error:", error);
      // Non-critical, don't throw
    }
  }

  /**
   * Log admin login for audit trail
   */
  private async logAdminLogin(userId: string): Promise<void> {
    try {
      await this.supabase.from("admin_activity_logs").insert({
        admin_id: userId,
        action: "admin_login",
        resource_type: "auth",
        resource_id: null,
        changes: { action: "Admin logged in" },
      });
    } catch (error) {
      console.error("[AdminAuthService] logAdminLogin error:", error);
      // Non-critical, don't throw
    }
  }

  /**
   * Map Supabase auth errors to user-friendly messages
   */
  private mapAuthError(error: any): string {
    const message = error.message?.toLowerCase() || "";

    if (message.includes("invalid login credentials")) {
      return "Invalid email or password";
    }
    if (message.includes("email not confirmed")) {
      return "Please verify your email address";
    }
    if (message.includes("rate limit")) {
      return "Too many attempts. Please try again later";
    }

    return error.message || "Authentication failed";
  }

  /**
   * Map Supabase errors to error codes
   */
  private mapAuthErrorCode(error: any): AuthErrorCode {
    const message = error.message?.toLowerCase() || "";

    if (message.includes("invalid login credentials")) {
      return AuthErrorCode.INVALID_CREDENTIALS;
    }
    if (message.includes("email not confirmed")) {
      return AuthErrorCode.ACCOUNT_NOT_CONFIRMED;
    }

    return AuthErrorCode.LOGIN_FAILED;
  }
}
