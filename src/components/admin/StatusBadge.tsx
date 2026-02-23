/**
 * Status Badge Component
 * 
 * Reusable status badge with consistent styling.
 * Supports different status types and colors.
 */

import { ReactNode } from "react";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "issue" | "priority" | "product";
  size?: "sm" | "md";
  icon?: ReactNode;
}

export function StatusBadge({ status, type = "order", size = "md", icon }: StatusBadgeProps) {
  const getColors = () => {
    if (type === "order") {
      const colors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        confirmed: "bg-blue-100 text-blue-800",
        shipped: "bg-purple-100 text-purple-800",
        delivered: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        returned: "bg-orange-100 text-orange-800",
      };
      return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
    }

    if (type === "payment") {
      const colors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
        refunded: "bg-gray-100 text-gray-800",
      };
      return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
    }

    if (type === "issue") {
      const colors: Record<string, string> = {
        reported: "bg-red-100 text-red-800",
        pending: "bg-yellow-100 text-yellow-800",
        solved: "bg-green-100 text-green-800",
        closed: "bg-gray-100 text-gray-800",
      };
      return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
    }

    if (type === "priority") {
      const colors: Record<string, string> = {
        low: "bg-gray-100 text-gray-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-orange-100 text-orange-800",
        critical: "bg-red-100 text-red-800",
      };
      return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
    }

    if (type === "product") {
      const colors: Record<string, string> = {
        active: "bg-green-100 text-green-800",
        inactive: "bg-red-100 text-red-800",
      };
      return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
    }

    return "bg-gray-100 text-gray-800";
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${getColors()} ${sizeClasses[size]}`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
    </span>
  );
}

export default StatusBadge;
