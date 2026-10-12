"use server";

import { createClient, createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type PurgeScope = "transactions" | "products" | "audit" | "all";

export interface PurgePreviewResult {
  success: boolean;
  error?: string;
  year?: number;
  scope?: PurgeScope;
  cutoffDate?: string;
  totalRecords?: number;
  totalVolume?: number;
  breakdown?: {
    ordersCount: number;
    orderItemsCount: number;
    stockReservationsCount: number;
    inactiveProductsCount: number;
    auditLogsCount: number;
  };
  sampleRecords?: Array<{
    identifier: string;
    date: string;
    details: string;
    status: string;
  }>;
}

export interface PurgeExecutionResult {
  success: boolean;
  error?: string;
  message?: string;
  deletedCounts?: {
    orders: number;
    orderItems: number;
    stockReservations: number;
    inactiveProducts: number;
    auditLogs: number;
    total: number;
  };
}

/**
 * Validates that caller is Super Director (chief_admin).
 */
async function verifySuperDirector(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "chief_admin") {
    throw new Error("Access Denied: Only a Super Director can perform database purge operations");
  }

  return { user, profile };
}

/**
 * Returns date boundary enforcing the strict 12-month rolling retention constraint.
 * Records within the last 12 months are strictly protected.
 */
function getRetentionBoundaries(year: number) {
  const now = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  let endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  // If the end of the selected year is more recent than the 12-month retention cutoff,
  // cap it at the 12-month cutoff.
  if (endOfYear > twelveMonthsAgo) {
    endOfYear = twelveMonthsAgo;
  }

  if (startOfYear > twelveMonthsAgo) {
    throw new Error(
      `Cannot purge records from ${year}: Regulatory retention requires keeping all data from the last 12 rolling months intact.`
    );
  }

  return {
    startIso: startOfYear.toISOString(),
    endIso: endOfYear.toISOString(),
    cutoffDateIso: twelveMonthsAgo.toISOString(),
  };
}

/**
 * Get Purge Preview (Dry run count & sample records for PDF)
 */
export async function getPurgePreview(
  year: number,
  scope: PurgeScope
): Promise<PurgePreviewResult> {
  try {
    const authClient = await createClient();
    await verifySuperDirector(authClient);

    const { startIso, endIso, cutoffDateIso } = getRetentionBoundaries(year);
    const serviceClient = createServiceRoleClient();

    let ordersCount = 0;
    let orderItemsCount = 0;
    let stockReservationsCount = 0;
    let inactiveProductsCount = 0;
    let auditLogsCount = 0;
    let totalVolume = 0;
    const sampleRecords: Array<{
      identifier: string;
      date: string;
      details: string;
      status: string;
    }> = [];

    // 1. Transaction Data (Orders, Items, Reservations)
    if (scope === "transactions" || scope === "all") {
      const { data: orders, count: oCount } = await serviceClient
        .from("orders")
        .select("id, order_number, total_amount, created_at, status, user_id", { count: "exact" })
        .gte("created_at", startIso)
        .lte("created_at", endIso);

      ordersCount = oCount || 0;

      if (orders && orders.length > 0) {
        const orderIds = orders.map((o) => o.id);
        totalVolume = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

        // Count order items
        const { count: iCount } = await serviceClient
          .from("order_items")
          .select("id", { count: "exact" })
          .in("order_id", orderIds);
        orderItemsCount = iCount || 0;

        // Count stock reservations
        const { count: rCount } = await serviceClient
          .from("stock_reservations")
          .select("id", { count: "exact" })
          .in("order_id", orderIds);
        stockReservationsCount = rCount || 0;

        // Take up to 10 sample records for PDF
        orders.slice(0, 10).forEach((o) => {
          sampleRecords.push({
            identifier: o.order_number,
            date: new Date(o.created_at).toLocaleDateString(),
            details: `Order Total: ₦${o.total_amount?.toLocaleString()}`,
            status: o.status,
          });
        });
      }
    }

    // 2. Inactive Products (Archived listings older than 12 months)
    if (scope === "products" || scope === "all") {
      const { data: products, count: pCount } = await serviceClient
        .from("products")
        .select("id, name, created_at, is_active", { count: "exact" })
        .eq("is_active", false)
        .gte("created_at", startIso)
        .lte("created_at", endIso);

      inactiveProductsCount = pCount || 0;

      if (products && products.length > 0) {
        products.slice(0, 5).forEach((p) => {
          sampleRecords.push({
            identifier: `PROD-${p.id.substring(0, 8)}`,
            date: new Date(p.created_at).toLocaleDateString(),
            details: p.name,
            status: "INACTIVE/ARCHIVED",
          });
        });
      }
    }

    // 3. Audit Logs
    if (scope === "audit" || scope === "all") {
      const { data: logs, count: lCount } = await serviceClient
        .from("admin_activity_logs")
        .select("id, action, resource_type, created_at", { count: "exact" })
        .gte("created_at", startIso)
        .lte("created_at", endIso);

      auditLogsCount = lCount || 0;

      if (logs && logs.length > 0) {
        logs.slice(0, 5).forEach((l) => {
          sampleRecords.push({
            identifier: `LOG-${l.id.substring(0, 8)}`,
            date: new Date(l.created_at).toLocaleDateString(),
            details: `${l.action} on ${l.resource_type || "system"}`,
            status: "LOGGED",
          });
        });
      }
    }

    const totalRecords =
      ordersCount +
      orderItemsCount +
      stockReservationsCount +
      inactiveProductsCount +
      auditLogsCount;

    return {
      success: true,
      year,
      scope,
      cutoffDate: cutoffDateIso,
      totalRecords,
      totalVolume,
      breakdown: {
        ordersCount,
        orderItemsCount,
        stockReservationsCount,
        inactiveProductsCount,
        auditLogsCount,
      },
      sampleRecords,
    };
  } catch (error) {
    console.error("Error generating purge preview:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate purge preview",
    };
  }
}

/**
 * Execute Database Purge
 * Permanently removes eligible legacy records from Supabase tables.
 */
export async function executeDatabasePurge(
  year: number,
  scope: PurgeScope,
  confirmationPhrase: string
): Promise<PurgeExecutionResult> {
  try {
    const authClient = await createClient();
    const { user, profile } = await verifySuperDirector(authClient);

    const expectedPhrase = `PURGE DATABASE ${year}`;
    if (confirmationPhrase.trim().toUpperCase() !== expectedPhrase) {
      return {
        success: false,
        error: `Invalid confirmation phrase. You must type "${expectedPhrase}" exactly.`,
      };
    }

    const { startIso, endIso } = getRetentionBoundaries(year);
    const serviceClient = createServiceRoleClient();

    let deletedOrders = 0;
    let deletedOrderItems = 0;
    let deletedStockReservations = 0;
    let deletedProducts = 0;
    let deletedAuditLogs = 0;

    // 1. Transaction Data Deletion
    if (scope === "transactions" || scope === "all") {
      const { data: orders } = await serviceClient
        .from("orders")
        .select("id")
        .gte("created_at", startIso)
        .lte("created_at", endIso);

      if (orders && orders.length > 0) {
        const orderIds = orders.map((o) => o.id);

        // Delete stock reservations
        const { error: rErr, count: rCount } = await serviceClient
          .from("stock_reservations")
          .delete({ count: "exact" })
          .in("order_id", orderIds);
        if (rErr) console.warn("Notice: stock reservation purge error", rErr);
        deletedStockReservations = rCount || 0;

        // Delete order items
        const { error: iErr, count: iCount } = await serviceClient
          .from("order_items")
          .delete({ count: "exact" })
          .in("order_id", orderIds);
        if (iErr) throw iErr;
        deletedOrderItems = iCount || 0;

        // Delete orders
        const { error: oErr, count: oCount } = await serviceClient
          .from("orders")
          .delete({ count: "exact" })
          .in("id", orderIds);
        if (oErr) throw oErr;
        deletedOrders = oCount || 0;
      }
    }

    // 2. Inactive Products Deletion
    if (scope === "products" || scope === "all") {
      const { error: pErr, count: pCount } = await serviceClient
        .from("products")
        .delete({ count: "exact" })
        .eq("is_active", false)
        .gte("created_at", startIso)
        .lte("created_at", endIso);
      if (pErr) throw pErr;
      deletedProducts = pCount || 0;
    }

    // 3. Audit Logs Deletion (excluding the purge action log itself)
    if (scope === "audit" || scope === "all") {
      const { error: lErr, count: lCount } = await serviceClient
        .from("admin_activity_logs")
        .delete({ count: "exact" })
        .gte("created_at", startIso)
        .lte("created_at", endIso);
      if (lErr) throw lErr;
      deletedAuditLogs = lCount || 0;
    }

    const totalDeleted =
      deletedOrders +
      deletedOrderItems +
      deletedStockReservations +
      deletedProducts +
      deletedAuditLogs;

    // Log permanent purge action into audit trail
    await serviceClient.from("admin_activity_logs").insert({
      admin_id: user.id,
      action: "database_purged",
      resource_type: "database",
      resource_id: `purge_${year}_${scope}`,
      changes: {
        year,
        scope,
        deleted_orders: deletedOrders,
        deleted_order_items: deletedOrderItems,
        deleted_stock_reservations: deletedStockReservations,
        deleted_products: deletedProducts,
        deleted_audit_logs: deletedAuditLogs,
        total_records_purged: totalDeleted,
        executed_by: profile.email,
        timestamp: new Date().toISOString(),
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/sales-log");

    return {
      success: true,
      message: `Database successfully purged. Removed ${totalDeleted.toLocaleString()} legacy records for calendar year ${year}.`,
      deletedCounts: {
        orders: deletedOrders,
        orderItems: deletedOrderItems,
        stockReservations: deletedStockReservations,
        inactiveProducts: deletedProducts,
        auditLogs: deletedAuditLogs,
        total: totalDeleted,
      },
    };
  } catch (error) {
    console.error("Critical error executing database purge:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database purge execution failed",
    };
  }
}
