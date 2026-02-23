/**
 * Admin Empty State Component
 * 
 * Reusable empty state for admin pages.
 * Displays when there's no data to show.
 */

import { Inbox } from "lucide-react";
import { ReactNode } from "react";

interface AdminEmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function AdminEmptyState({
  icon,
  title = "No data available",
  description = "There's nothing to show here yet.",
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <div className="flex justify-center mb-4">
        {icon || <Inbox size={48} className="text-gray-400" />}
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-gray-600 text-sm mb-4">{description}</p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}

export default AdminEmptyState;
