/**
 * =============================================================================
 * JRADIANCE Issues Management Actions
 * =============================================================================
 *
 * Server-side functions for issues/bugs/complaints management.
 * These actions are only accessible by authorized admin users.
 *
 * Features:
 * - Create issues (bugs, complaints, feature requests)
 * - Update issue status and priority
 * - Assign issues to admin staff
 * - Resolve and close issues
 * - Delete issues
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/*
  Common Response Types
  */

export interface IssueActionResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
}

export interface Issue {
  id: string;
  type: "bug" | "complaint" | "feature_request";
  title: string;
  description: string;
  status: "reported" | "pending" | "solved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  reported_by: string | null;
  assigned_to: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  customer_email: string | null;
  customer_order_id: string | null;
  created_at: string;
  updated_at: string;
}

/*
  Issue Management Actions
*/

/**
 * Get All Issues
 *
 * Retrieves all issues with optional filtering.
 *
 * @param filters - Optional filters for status, type, priority
 * @returns List of issues
 *
 * @security Admin, Chief Admin only
 */
export async function getAllIssues(filters?: {
  status?: string;
  type?: string;
  priority?: string;
}) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("issues")
      .select(`
        *,
        profiles!issues_reported_by_fkey (email, full_name),
        admin_staff!issues_assigned_to_fkey (position),
        resolved_admin:admin_staff!issues_resolved_by_fkey (email, full_name)
      `)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching issues:", error);
    return { success: false, error: "Failed to fetch issues", data: null };
  }
}

/**
 * Create Issue
 *
 * Creates a new issue (bug, complaint, or feature request).
 *
 * @param issueData - Issue information
 * @returns Result with created issue ID
 *
 * @security Authenticated users can create issues
 */
export async function createIssue(issueData: {
  type: "bug" | "complaint" | "feature_request";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high" | "critical";
  customer_email?: string;
  customer_order_id?: string;
}): Promise<IssueActionResult & { issueId?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("issues")
      .insert({
        ...issueData,
        reported_by: user?.id || null,
        priority: issueData.priority || "medium",
        status: "reported",
      })
      .select("id")
      .single();

    if (error) throw error;

    // Log the action
    if (user) {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "issue_created",
        resource_type: "issue",
        resource_id: data.id,
        changes: { title: issueData.title, type: issueData.type },
      });
    }

    revalidatePath("/admin/issues");
    return {
      success: true,
      message: "Issue created successfully",
      issueId: data.id,
    };
  } catch (error) {
    console.error("Error creating issue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create issue",
    };
  }
}

/**
 * Update Issue Status
 *
 * Updates the status of an issue.
 * Automatically sets resolved_at when status changes to 'solved'.
 *
 * @param issueId - ID of issue to update
 * @param newStatus - New status value
 * @returns Result of update operation
 *
 * @security Admin, Chief Admin only
 */
export async function updateIssueStatus(
  issueId: string,
  newStatus: "reported" | "pending" | "solved" | "closed",
): Promise<IssueActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const updates: any = {
      status: newStatus,
    };

    // Auto-set resolved_at and resolved_by when status changes to 'solved'
    if (newStatus === "solved") {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = user?.id || null;
    }

    const { error } = await supabase
      .from("issues")
      .update(updates)
      .eq("id", issueId);

    if (error) throw error;

    // Log the action
    if (user) {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "issue_status_updated",
        resource_type: "issue",
        resource_id: issueId,
        changes: { new_status: newStatus },
      });
    }

    revalidatePath("/admin/issues");
    return { success: true, message: "Issue status updated" };
  } catch (error) {
    console.error("Error updating issue status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update issue",
    };
  }
}

/**
 * Assign Issue to Admin
 *
 * Assigns an issue to a specific admin staff member.
 *
 * @param issueId - ID of issue to assign
 * @param adminId - ID of admin to assign to
 * @returns Result of assignment operation
 *
 * @security Chief Admin only
 */
export async function assignIssue(
  issueId: string,
  adminId: string,
): Promise<IssueActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("issues")
      .update({
        assigned_to: adminId,
        status: "pending",
      })
      .eq("id", issueId);

    if (error) throw error;

    // Log the action
    if (user) {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "issue_assigned",
        resource_type: "issue",
        resource_id: issueId,
        changes: { assigned_to: adminId },
      });
    }

    revalidatePath("/admin/issues");
    return { success: true, message: "Issue assigned successfully" };
  } catch (error) {
    console.error("Error assigning issue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign issue",
    };
  }
}

/**
 * Update Issue Priority
 *
 * Updates the priority level of an issue.
 *
 * @param issueId - ID of issue to update
 * @param newPriority - New priority value
 * @returns Result of update operation
 *
 * @security Admin, Chief Admin only
 */
export async function updateIssuePriority(
  issueId: string,
  newPriority: "low" | "medium" | "high" | "critical",
): Promise<IssueActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("issues")
      .update({ priority: newPriority })
      .eq("id", issueId);

    if (error) throw error;

    // Log the action
    if (user) {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "issue_priority_updated",
        resource_type: "issue",
        resource_id: issueId,
        changes: { new_priority: newPriority },
      });
    }

    revalidatePath("/admin/issues");
    return { success: true, message: "Issue priority updated" };
  } catch (error) {
    console.error("Error updating issue priority:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update priority",
    };
  }
}

/**
 * Delete Issue
 *
 * Permanently removes an issue from the system.
 *
 * @param issueId - ID of issue to delete
 * @returns Result of deletion operation
 *
 * @security Chief Admin only
 */
export async function deleteIssue(issueId: string): Promise<IssueActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("issues")
      .delete()
      .eq("id", issueId);

    if (error) throw error;

    // Log the action
    if (user) {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "issue_deleted",
        resource_type: "issue",
        resource_id: issueId,
      });
    }

    revalidatePath("/admin/issues");
    return { success: true, message: "Issue deleted successfully" };
  } catch (error) {
    console.error("Error deleting issue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete issue",
    };
  }
}

/**
 * Check Permission
 *
 * Verifies if the current user has the required role or higher.
 * Uses role hierarchy: customer (0) < agent (1) < admin (2) < chief_admin (3)
 *
 * @param requiredRole - Minimum role required for access
 * @returns true if user has permission, false otherwise
 */
export async function checkPermission(
  requiredRole: "customer" | "agent" | "admin" | "chief_admin",
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) return false;

    // Role hierarchy for permission checking
    const roleHierarchy: Record<"customer" | "agent" | "admin" | "chief_admin", number> = {
      customer: 0,
      agent: 1,
      admin: 2,
      chief_admin: 3,
    };

    const userRole = profile.role as "customer" | "agent" | "admin" | "chief_admin";
    const requiredRoleValue = roleHierarchy[requiredRole];
    
    return roleHierarchy[userRole] >= requiredRoleValue;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}
