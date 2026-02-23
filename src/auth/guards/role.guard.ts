/**
 * =============================================================================
 * Role Guard (RBAC)
 * =============================================================================
 * 
 * Role-based access control guard.
 * Used for fine-grained permission checks within admin routes.
 */

import type { UserRole, RoleCheckResult } from "@/types";

/**
 * Role hierarchy levels
 * Higher number = more privileges
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  customer: 0,
  agent: 1,
  admin: 2,
  chief_admin: 3,
};

/**
 * Role Guard for RBAC checks
 */
export class RoleGuard {
  private userRole: UserRole;

  constructor(userRole: UserRole) {
    this.userRole = userRole;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this.userRole === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.includes(this.userRole);
  }

  /**
   * Check if user has at least the specified role level
   * Uses role hierarchy
   */
  hasRoleAtLeast(role: UserRole): boolean {
    return ROLE_HIERARCHY[this.userRole] >= ROLE_HIERARCHY[role];
  }

  /**
   * Check if user is admin (admin, agent, or chief_admin)
   */
  isAdmin(): boolean {
    return ["admin", "agent", "chief_admin"].includes(this.userRole);
  }

  /**
   * Check if user is chief admin
   */
  isChiefAdmin(): boolean {
    return this.userRole === "chief_admin";
  }

  /**
   * Check if user is agent
   */
  isAgent(): boolean {
    return this.userRole === "agent";
  }

  /**
   * Check if user can access a specific route
   */
  canAccessRoute(pathname: string): RoleCheckResult {
    // Chief admin can access everything
    if (this.isChiefAdmin()) {
      return {
        hasRole: true,
        userRole: this.userRole,
        requiredRoles: [],
      };
    }

    // Chief admin only routes
    const chiefAdminOnlyRoutes = [
      "/admin/users",
      "/admin/roles",
      "/admin/agents",
    ];

    if (
      chiefAdminOnlyRoutes.some((route) => pathname.startsWith(route))
    ) {
      return {
        hasRole: false,
        userRole: this.userRole,
        requiredRoles: ["chief_admin"],
      };
    }

    // Admin and chief admin routes (agent restricted)
    const adminOnlyRoutes = ["/admin/audit-log", "/admin/sales-log"];

    if (
      this.isAgent() &&
      adminOnlyRoutes.some((route) => pathname.startsWith(route))
    ) {
      return {
        hasRole: false,
        userRole: this.userRole,
        requiredRoles: ["admin", "chief_admin"],
      };
    }

    // All other admin routes are accessible by agent+
    return {
      hasRole: this.isAdmin(),
      userRole: this.userRole,
      requiredRoles: ["agent", "admin", "chief_admin"],
    };
  }

  /**
   * Get user's role level number
   */
  getRoleLevel(): number {
    return ROLE_HIERARCHY[this.userRole];
  }

  /**
   * Get user's role name
   */
  getRole(): UserRole {
    return this.userRole;
  }

  /**
   * Check if user can perform a specific action
   */
  can(action: string): boolean {
    switch (action) {
      // User management actions
      case "promote_user":
      case "demote_user":
      case "delete_user":
      case "manage_agents":
        return this.isChiefAdmin();

      // Product management actions
      case "create_product":
      case "update_product":
      case "delete_product":
        return this.isAdmin();

      // Order management actions
      case "view_orders":
      case "update_order":
        return this.isAdmin();

      // Audit log actions
      case "view_audit_logs":
      case "view_sales_logs":
        return !this.isAgent();

      // All admins can view dashboard
      case "view_dashboard":
        return this.isAdmin();

      default:
        return false;
    }
  }
}

/**
 * Factory function to create RoleGuard instance
 */
export function createRoleGuard(userRole: UserRole): RoleGuard {
  return new RoleGuard(userRole);
}

/**
 * Utility function for quick role checks
 */
export function checkRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Utility function to check if role is admin
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return ["admin", "agent", "chief_admin"].includes(role);
}
