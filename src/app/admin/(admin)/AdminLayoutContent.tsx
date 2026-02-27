/**
 * Admin Layout Content (Client Component)
 * 
 * Handles the collapsible sidebar functionality
 */

"use client";

import { useState } from "react";
import AdminSidePanel from "@/components/AdminSidePanel";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";
import AdminGlobalStyles from "@/components/admin/AdminGlobalStyles";

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <>
      {/* Global styles for always-visible scrollbars */}
      <AdminGlobalStyles />
      
      <div className="flex min-h-screen bg-radiance-creamBackgroundColor">
        {/* Admin Sidebar Navigation */}
        <AdminSidePanel
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Area with Error Boundary */}
        <main
          className={`flex-1 min-h-screen overflow-x-auto overflow-y-visible ${
            isSidebarCollapsed ? "ml-20" : "ml-72"
          }`}
        >
          <AdminErrorBoundary>
            {/* Content wrapper with max width for horizontal scroll */}
            <div className="w-full max-w-[1600px] min-w-max px-6 md:px-8 py-6 md:py-8">
              {children}
            </div>
          </AdminErrorBoundary>
        </main>
      </div>
    </>
  );
}
