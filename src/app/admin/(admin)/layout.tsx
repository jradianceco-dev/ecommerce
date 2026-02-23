/**
 * =============================================================================
 * Admin Layout
 * =============================================================================
 * 
 * Provides consistent layout for authenticated admin pages with sidebar navigation.
 * 
 * Security:
 * - Authentication verified by middleware (defensive check here)
 * - Role verification (admin, agent, chief_admin only)
 * - Minimal defensive check - trusts middleware
 */

import AdminSidePanel from "@/components/AdminSidePanel";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient();

  // Minimal defensive check - middleware handles main protection
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/admin/login");
    }
  } catch (error) {
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
