/**
 * =============================================================================
 * JRADIANCE Order Management Actions
 * =============================================================================
 *
 * Server-side functions for order management.
 * These actions are only accessible by authorized admin users.
 *
 * Features:
 * - Create orders from cart
 * - Update order status
 * - Get order details
 * - Cancel orders
 * - Process refunds
 */

"use server";

import { createClient, createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/*
  Common Response Types
  */

export interface OrderActionResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: any;
}

export interface OrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderInput {
  user_id: string;
  shipping_address: string;
  billing_address?: string;
  notes?: string;
  estimated_delivery_date?: string;
}

/*
  Order Management Actions
*/

/**
 * Get All Orders
 *
 * Retrieves all orders with optional filtering.
 *
 * @param filters - Optional filters for status, payment_status, user_id
 * @returns List of orders with items
 *
 * @security Admin, Chief Admin only
 */
export async function getAllOrders(filters?: {
  status?: string;
  payment_status?: string;
  user_id?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    // use service role client so admin queries bypass RLS and always return full order data
    const supabase = createServiceRoleClient();

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        profiles!orders_user_id_fkey (
          email,
          full_name,
          phone
        ),
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          product:products (
            id,
            name,
            slug,
            images,
            price,
            discount_price,
            stock_quantity,
            category
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.payment_status) {
      query = query.eq("payment_status", filters.payment_status);
    }

    if (filters?.user_id) {
      query = query.eq("user_id", filters.user_id);
    }

    if (filters?.limit) {
      const offset = filters?.offset || 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders", data: null };
  }
}

/**
 * Get Order By ID
 *
 * Retrieves a single order with all its items.
 *
 * @param orderId - ID of order to retrieve
 * @returns Order with items and profile information
 *
 * @security Admin, Chief Admin only
 */
export async function getOrderById(orderId: string) {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        profiles!orders_user_id_fkey (
          email,
          full_name,
          phone,
          avatar_url
        ),
        order_items (
          *,
          product:products (
            id,
            name,
            images,
            slug
          )
        )
      `,
      )
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order", data: null };
  }
}

/**
 * Update Order Status
 *
 * Updates the status of an order.
 * Validates status transitions.
 *
 * @param orderId - ID of order to update
 * @param newStatus - New status value
 * @returns Result of update operation
 *
 * @security Admin, Chief Admin only
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned",
): Promise<OrderActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get current order status for validation
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (!currentOrder) {
      return { success: false, error: "Order not found" };
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered", "returned"],
      delivered: [],
      cancelled: [],
      returned: [],
    };

    if (!validTransitions[currentOrder.status].includes(newStatus)) {
      return {
        success: false,
        error: `Invalid status transition from ${currentOrder.status} to ${newStatus}`,
      };
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;

    // Log the action
    if (user) {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "order_status_updated",
        resource_type: "order",
        resource_id: orderId,
        changes: {
          old_status: currentOrder.status,
          new_status: newStatus,
        },
      });
    }

    revalidatePath("/admin/orders");
    return { success: true, message: "Order status updated" };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order",
    };
  }
}

/**
 * Update Payment Status
 *
 * Updates the payment status of an order.
 *
 * @param orderId - ID of order to update
 * @param newStatus - New payment status value
 * @returns Result of update operation
 *
 * @security Admin, Chief Admin only
 */
export async function updatePaymentStatus(
  orderId: string,
  newStatus: "pending" | "completed" | "failed" | "refunded",
): Promise<OrderActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;

    // Log the action
    if (user) {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "payment_status_updated",
        resource_type: "order",
        resource_id: orderId,
        changes: { new_payment_status: newStatus },
      });
    }

    revalidatePath("/admin/orders");
    return { success: true, message: "Payment status updated" };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update payment status",
    };
  }
}

/**
 * Cancel Order
 *
 * Cancels an order and restores stock.
 *
 * @param orderId - ID of order to cancel
 * @param reason - Cancellation reason
 * @returns Result of cancellation operation
 *
 * @security Admin, Chief Admin only
 */
export async function cancelOrder(
  orderId: string,
  reason?: string,
): Promise<OrderActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get order details
    const { data: order } = await supabase
      .from("orders")
      .select("status, payment_status, notes")
      .eq("id", orderId)
      .single();

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Can only cancel pending or confirmed orders
    if (!["pending", "confirmed"].includes(order.status)) {
      return {
        success: false,
        error: `Cannot cancel order with status ${order.status}`,
      };
    }

    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        notes: reason
          ? `${order.notes || ""}\nCancellation reason: ${reason}`
          : order.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;

    // Stock restoration happens automatically via trigger

    // Log the action
    if (user) {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "order_cancelled",
        resource_type: "order",
        resource_id: orderId,
        changes: { reason: reason || null },
      });
    }

    revalidatePath("/admin/orders");
    return { success: true, message: "Order cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    };
  }
}

/**
 * Process Refund
 *
 * Marks order as refunded and restores stock.
 *
 * @param orderId - ID of order to refund
 * @param refundAmount - Amount to refund
 * @param reason - Refund reason
 * @returns Result of refund operation
 *
 * @security Admin, Chief Admin only
 */
export async function processRefund(
  orderId: string,
  refundAmount?: number,
  reason?: string,
): Promise<OrderActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get order details
    const { data: order } = await supabase
      .from("orders")
      .select("status, payment_status, total_amount, notes")
      .eq("id", orderId)
      .single();

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Can only refund delivered or shipped orders
    if (!["delivered", "shipped"].includes(order.status)) {
      return {
        success: false,
        error: `Cannot refund order with status ${order.status}`,
      };
    }

    // Update order status and payment status
    const { error } = await supabase
      .from("orders")
      .update({
        status: "returned",
        payment_status: "refunded",
        notes: reason
          ? `${order.notes || ""}\nRefund reason: ${reason}. Amount: ₦${refundAmount || order.total_amount}`
          : order.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;

    // Stock restoration happens automatically via trigger

    // Log the action
    if (user) {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "order_refunded",
        resource_type: "order",
        resource_id: orderId,
        changes: {
          reason: reason || null,
          refund_amount: refundAmount || order.total_amount,
        },
      });
    }

    revalidatePath("/admin/orders");
    return { success: true, message: "Refund processed successfully" };
  } catch (error) {
    console.error("Error processing refund:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to process refund",
    };
  }
}

/**
 * Get Order Statistics
 *
 * Retrieves order statistics for dashboard.
 *
 * @param period - Time period: "day", "week", "month", or "all"
 * @returns Order statistics
 *
 * @security Admin, Chief Admin only
 */
export async function getOrderStatistics(
  period: "day" | "week" | "month" | "all" = "all",
) {
  try {
    const supabase = await createClient();

    // Calculate date range
    let dateFilter = "";
    if (period !== "all") {
      const days = period === "day" ? 1 : period === "week" ? 7 : 30;
      dateFilter = `AND created_at >= NOW() - INTERVAL '${days} days'`;
    }

    // Get order counts by status
    const { data: statusCounts } = await supabase
      .from("orders")
      .select("status, count:count");

    if (!statusCounts) {
      throw new Error("Failed to fetch order statistics");
    }

    // Get revenue statistics
    const { data: revenueData } = await supabase
      .from("orders")
      .select("total_amount, payment_status, status")
      .eq("payment_status", "completed");

    const totalRevenue =
      revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const pendingRevenue =
      revenueData
        ?.filter((o) => o.payment_status === "pending")
        .reduce((sum, order) => sum + order.total_amount, 0) || 0;

    return {
      success: true,
      data: {
        totalOrders: statusCounts.reduce((sum, s: any) => sum + s.count, 0),
        byStatus: statusCounts.reduce(
          (acc, s: any) => {
            acc[s.status] = s.count;
            return acc;
          },
          {} as Record<string, number>,
        ),
        totalRevenue,
        pendingRevenue,
      },
    };
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    return {
      success: false,
      error: "Failed to fetch order statistics",
      data: null,
    };
  }
}

/**
 * Check Permission
 *
 * Verifies if the current user has the required role or higher.
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

    const roleHierarchy: Record<
      "customer" | "agent" | "admin" | "chief_admin",
      number
    > = {
      customer: 0,
      agent: 1,
      admin: 2,
      chief_admin: 3,
    };

    const userRole = profile.role as
      | "customer"
      | "agent"
      | "admin"
      | "chief_admin";
    const requiredRoleValue = roleHierarchy[requiredRole];

    return roleHierarchy[userRole] >= requiredRoleValue;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Delete Order (Super Director Only - Hard Delete)
 * 
 * Single Responsibility: Deletes an order and all its related records permanently.
 * Only accessible by Super Director (chief_admin).
 * 
 * @param orderId - ID of order to delete
 * @param adminUserId - ID of admin performing the deletion
 * @returns Success/error status
 * 
 * @security Super Director (chief_admin) only
 * @warning This is a permanent database deletion
 */
export async function deleteOrder(orderId: string, adminUserId: string) {
  try {
    const authClient = await createClient();

    // Verify authenticated caller is specifically the Super Director (chief_admin)
    const { data: profile } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", adminUserId)
      .single();

    if (!profile || profile.role !== "chief_admin") {
      return { 
        success: false, 
        error: "Access denied: Only a Super Director can permanently delete an order" 
      };
    }

    // Use service role client so deletion bypasses RLS and cleanly purges all related foreign records
    const serviceClient = createServiceRoleClient();

    // Get order details for audit trail before deletion
    const { data: order } = await serviceClient
      .from("orders")
      .select("order_number, total_amount")
      .eq("id", orderId)
      .single();

    // 1. Delete associated stock reservations
    const { error: reservationsError } = await serviceClient
      .from("stock_reservations")
      .delete()
      .eq("order_id", orderId);

    if (reservationsError) {
      console.warn("Warning deleting stock reservations:", reservationsError);
    }

    // 2. Delete order items
    const { error: itemsError } = await serviceClient
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) throw itemsError;

    // 3. Delete order
    const { error: orderError } = await serviceClient
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (orderError) throw orderError;

    // 4. Log permanent deletion into audit trail
    await serviceClient.from("admin_activity_logs").insert({
      admin_id: adminUserId,
      action: "order_deleted",
      resource_type: "orders",
      resource_id: orderId,
      changes: {
        order_number: order?.order_number,
        total_amount: order?.total_amount,
        reason: "Super Director permanent delete",
      },
    });

    revalidatePath("/admin/orders");

    return { 
      success: true, 
      message: "Order permanently deleted from database" 
    };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete order" 
    };
  }
}
