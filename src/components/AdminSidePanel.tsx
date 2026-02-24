"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Users,
  UserPlus,
  ClipboardList,
  History,
  PackageSearch,
  AlertTriangle,
  ShoppingBag,
  LogOut,
  ChevronDown,
  ChevronRight,
  Loader2,
  UserCircle,
} from "lucide-react";
import { adminLogout, getAdminUserInfo } from "@/app/admin/(admin-auth)/login/actions";

// Navigation Structure
const adminNavItems = [
  {
    title: "Control Panel",
    icon: Settings2,
    subItems: [
      { label: "Permission Roles", href: "/admin/roles", icon: ShieldCheck },
      { label: "Users Manager", href: "/admin/users", icon: Users },
      { label: "Agents Manager", href: "/admin/agents", icon: UserPlus },
    ],
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    subItems: [
      { label: "Dashboard Home", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Sales Log", href: "/admin/sales-log", icon: ClipboardList },
      { label: "Audit Log", href: "/admin/audit-log", icon: History },
      {
        label: "Products Catalog",
        href: "/admin/catalog",
        icon: PackageSearch,
      },
      { label: "Issues Log", href: "/admin/issues", icon: AlertTriangle },
    ],
  },
  { title: "Orders Manager", href: "/admin/orders", icon: ShoppingBag },
];

export default function AdminSidePanel() {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedNav, setExpandedNav] = useState<string | null>("Dashboard");
  const [userInfo, setUserInfo] = useState<{
    email: string;
    role: string;
    full_name?: string | null;
  } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load user info on mount
  useEffect(() => {
    loadUserInfo();
  }, []);

  async function loadUserInfo() {
    const result = await getAdminUserInfo();
    if (result?.user) {
      setUserInfo(result.user);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    const result = await adminLogout();
    if (result.success) {
      router.push("/admin/login");
    } else {
      setIsLoggingOut(false);
      alert(result.error || "Logout failed");
    }
  }

  // Only show this sidebar if user is on admin route
  if (!pathname?.startsWith("/admin")) return null;

  // Format role for display
  const formatRole = (role: string) => {
    return role.replace("_", " ").toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-radiance-charcoalTextColor text-white z-50 border-r border-white/5 flex flex-col">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5">
        <h1 className="text-xl font-black tracking-tighter text-radiance-goldColor">
          JRADIANCE{" "}
          <span className="text-xs font-medium text-white/50 block">
            ADMIN PORTAL
          </span>
        </h1>
      </div>

      {/* User Info */}
      {userInfo && (
        <div className="px-4 py-3 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <UserCircle size={32} className="text-white/50" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {userInfo.full_name || "Admin User"}
              </p>
              <p className="text-[10px] text-radiance-goldColor truncate">
                {formatRole(userInfo.role)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {adminNavItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedNav === item.title;
          const isActive =
            pathname === item.href ||
            item.subItems?.some((sub) => pathname === sub.href);

          return (
            <div key={item.title} className="space-y-1">
              {/* Category Button or Link */}
              {hasSubItems ? (
                <button
                  onClick={() => setExpandedNav(isExpanded ? null : item.title)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-radiance-goldColor/10 text-radiance-goldColor"
                      : "hover:bg-white/5 text-white/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span className="text-sm font-bold">{item.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href || "#"}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    pathname === item.href
                      ? "bg-radiance-goldColor text-white shadow-lg shadow-radiance-goldColor/20"
                      : "hover:bg-white/5 text-white/70"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-sm font-bold">{item.title}</span>
                </Link>
              )}

              {/* Sub-Navigation (Only visible if nav is active/expanded) */}
              {hasSubItems && isExpanded && (
                <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-3 p-2 rounded-lg text-xs font-medium transition-colors ${
                        pathname === sub.href
                          ? "text-radiance-goldColor"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      <sub.icon size={14} />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Admin Footer with Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <LogOut size={20} />
          )}
          <span className="text-sm font-bold">
            {isLoggingOut ? "Logging out..." : "Logout Session"}
          </span>
        </button>
      </div>
    </aside>
  );
}
