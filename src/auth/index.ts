/**
 * =============================================================================
 * Auth Module Exports
 * =============================================================================
 * 
 * Central export point for all auth module functionality.
 * Import from here instead of individual files.
 */

// Services
export { AuthService } from "./services/auth.service";
export { AdminAuthService } from "./services/admin-auth.service";
export { CustomerAuthService } from "./services/customer-auth.service";

// Guards
export { AuthGuard, createAuthGuard } from "./guards/auth.guard";
export {
  RoleGuard,
  createRoleGuard,
  checkRole,
  isAdminRole,
} from "./guards/role.guard";

// Strategy
export {
  BaseAuthStrategy,
  type IAuthStrategy,
  type AuthStrategyMetadata,
} from "./strategies/auth.strategy";

// Types are exported from @/types
