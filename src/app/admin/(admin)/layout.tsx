/**
 * Admin Layout
 * 
 * Provides consistent layout for authenticated admin pages with sidebar navigation.
 * 
 * Security:
 * - Authentication verified by middleware (defensive check here)
 * - Role verification (admin, agent, chief_admin only)
 * - Graceful error handling for Supabase connection issues
 * 
 * @author Philip Depaytez
 * @version 3.0.0
 */

import AdminSidePanel from "@/components/AdminSidePanel";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient();

  try {
    // Verify user is authenticated (defensive - middleware handles this)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("[Admin Layout] Unauthenticated access attempt");
      redirect("/admin/login");
    }

    // Verify user has admin role and is active
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.is_active) {
      console.warn("[Admin Layout] Invalid profile or inactive user");
      redirect("/admin/login");
    }

    // Verify allowed admin roles
    const allowedRoles = ["admin", "agent", "chief_admin"];
    if (!allowedRoles.includes(profile.role)) {
      console.warn("[Admin Layout] Unauthorized role access:", profile.role);
      redirect("/");
    }
  } catch (error) {
    // Handle unexpected errors gracefully
    console.error("[Admin Layout] Unexpected error:", error);
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-radiance-creamBackgroundColor">
      {/* Admin Sidebar Navigation */}
      <AdminSidePanel />

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        <div className="container mx-auto px-8 py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
