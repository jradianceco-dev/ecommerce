/**
 * Admin Components Barrel Export
 * 
 * Central export point for all shared admin components.
 * Import from this file to use shared components.
 * 
 * Example:
 * ```typescript
 * import { AdminModal, StatusBadge, ActionButtons } from '@/components/admin';
 * ```
 */

export { AdminErrorBoundary } from "./AdminErrorBoundary";
export { AdminLoadingState } from "./AdminLoadingState";
export { AdminEmptyState } from "./AdminEmptyState";
export { AdminModal } from "./AdminModal";
export { StatusBadge } from "./StatusBadge";
export { ActionButtons } from "./ActionButtons";

// Default exports for single-component imports
export { default as AdminErrorBoundaryDefault } from "./AdminErrorBoundary";
export { default as AdminLoadingStateDefault } from "./AdminLoadingState";
export { default as AdminEmptyStateDefault } from "./AdminEmptyState";
export { default as AdminModalDefault } from "./AdminModal";
export { default as StatusBadgeDefault } from "./StatusBadge";
export { default as ActionButtonsDefault } from "./ActionButtons";
