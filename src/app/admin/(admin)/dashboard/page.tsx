/**
 * Admin Dashboard Home Page
 * =========================
 *
 * Main dashboard for admin users with:
 * - Sales metrics
 * - Recent orders
 * - Product stats
 * - Quick actions
 *
 * Access: Admin, Chief Admin, Agent
 */

"use client";

import { useState, useEffect } from "react";
import { checkPermission } from "../admin-actions";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    let aborted = false;

    async function loadData() {
      const hasPermission = await checkPermission("agent");
      if (!aborted) setHasAccess(hasPermission);

      if (hasPermission && !aborted) {
        await loadDashboardData(aborted);
      }
    }

    loadData();

    return () => {
      aborted = true;
    };
  }, []);

  async function checkPermissions() {
    const hasPermission = await checkPermission("agent");
    setHasAccess(hasPermission);
  }

  async function loadDashboardData(aborted: boolean) {
    setLoading(true);
    try {
      const supabase = createClient();

      // Get product stats
      const [{ count: totalProducts }, { count: activeProducts }] =
        await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true),
        ]);

      if (aborted) return;

      // Get order stats
      const [{ count: totalOrders }, { count: pendingOrders }] =
        await Promise.all([
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);

      if (aborted) return;

      // Get revenue stats
      const { data: revenueData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "completed");

      const totalRevenue =
        revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      if (aborted) return;

      // Monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: monthlyRevenueData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "completed")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const monthlyRevenue =
        monthlyRevenueData?.reduce(
          (sum, order) => sum + order.total_amount,
          0,
        ) || 0;

      if (aborted) return;

      // Get customer count
      const { count: totalCustomers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "customer");

      if (aborted) return;

      // Get low stock products
      const { count: lowStockProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lte("stock_quantity", 10)
        .eq("is_active", true);

      if (!aborted) {
        setStats({
          totalProducts: totalProducts || 0,
          activeProducts: activeProducts || 0,
          totalOrders: totalOrders || 0,
          pendingOrders: pendingOrders || 0,
          totalRevenue,
          monthlyRevenue,
          totalCustomers: totalCustomers || 0,
          lowStockProducts: lowStockProducts || 0,
        });
      }
    } catch (error) {
      if (!aborted) {
        console.error("Error loading dashboard data:", error);
      }
    } finally {
      if (!aborted) {
        setLoading(false);
      }
    }
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">
          You don&apos;t have permission to view the dashboard.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2
          size={48}
          className="animate-spin mx-auto text-radiance-goldColor"
        />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      subValue: `₦${stats.monthlyRevenue.toLocaleString()} this month`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      subValue: `${stats.pendingOrders} pending`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "neutral",
    },
    {
      title: "Products",
      value: `${stats.activeProducts}/${stats.totalProducts}`,
      subValue: "active products",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "neutral",
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toString(),
      subValue: "registered customers",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "up",
    },
  ];

  const alertCards = [
    {
      title: "Low Stock Alert",
      value: stats.lowStockProducts.toString(),
      description: "Products with stock ≤ 10",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      link: "/admin/catalog",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toString(),
      description: "Orders awaiting confirmation",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-radiance-charcoalTextColor">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Overview of your store&apos;s performance
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              {stat.trend !== "neutral" && (
                <div
                  className={`flex items-center text-sm font-bold ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.subValue}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alertCards.map((alert) => (
          <Link
            key={alert.title}
            href={alert.link}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow block"
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${alert.bgColor} ${alert.color}`}>
                <alert.icon size={28} />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-gray-900">
                  {alert.value}
                </p>
                <p className="text-sm font-bold text-gray-700 mt-1">
                  {alert.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {alert.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/catalog"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-radiance-goldColor/10 transition-colors"
          >
            <Package size={24} className="text-radiance-goldColor" />
            <span className="text-xs font-bold text-gray-700">Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-radiance-goldColor/10 transition-colors"
          >
            <ShoppingCart size={24} className="text-radiance-goldColor" />
            <span className="text-xs font-bold text-gray-700">View Orders</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-radiance-goldColor/10 transition-colors"
          >
            <Users size={24} className="text-radiance-goldColor" />
            <span className="text-xs font-bold text-gray-700">
              Manage Users
            </span>
          </Link>
          <Link
            href="/shop"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-radiance-goldColor/10 transition-colors"
          >
            <TrendingUp size={24} className="text-radiance-goldColor" />
            <span className="text-xs font-bold text-gray-700">View Store</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
        <div className="text-center py-8 text-gray-500">
          <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-sm">
            View all orders in the{" "}
            <Link
              href="/admin/orders"
              className="text-radiance-goldColor font-bold hover:underline"
            >
              Orders Manager
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
