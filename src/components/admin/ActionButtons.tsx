/**
 * Action Buttons Component
 * 
 * Reusable action buttons for admin tables.
 * Provides consistent styling for Edit, Delete, Toggle actions.
 */

import { Edit, Trash2, ToggleLeft, Eye } from "lucide-react";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  onView?: () => void;
  is_active?: boolean;
  loading?: boolean;
  loadingAction?: string;
  showToggle?: boolean;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

export function ActionButtons({
  onEdit,
  onDelete,
  onToggle,
  onView,
  is_active,
  loading,
  loadingAction,
  showToggle = true,
  showView = false,
  showEdit = true,
  showDelete = true,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {showView && onView && (
        <button
          onClick={onView}
          disabled={loading === true}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="View details"
        >
          <Eye size={18} />
        </button>
      )}

      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          disabled={loading === true}
          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          title="Edit"
        >
          <Edit size={18} />
        </button>
      )}

      {showToggle && onToggle && (
        <button
          onClick={onToggle}
          disabled={loading === true}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
            is_active 
              ? "text-green-600 hover:text-green-900 hover:bg-green-50" 
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
          title={is_active ? "Deactivate" : "Activate"}
        >
          <ToggleLeft size={18} />
        </button>
      )}

      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          disabled={loading === true}
          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}

export default ActionButtons;
