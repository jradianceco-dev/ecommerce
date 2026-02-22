/**
 * Next.js Middleware for Authentication & Authorization
 * 
 * Protects admin and customer routes using Supabase Auth.
 * Uses role-based access control (RBAC) for admin routes.
 * 
 * Route Protection:
 * - /admin/login: Public (no auth required)
 * - /admin/*: Protected (admin, agent, chief_admin roles only)
 * - /shop/history, /shop/wishlist, /shop/checkout: Protected (authenticated users)
 * 
 * @author Philip Depaytez
 * @version 3.0.0
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const url = req.nextUrl.clone();

  // ============================================================================
  // Admin Login Route - Public Access
  // ============================================================================
  if (url.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // ============================================================================
  // Initialize Supabase Client
  // ============================================================================
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value),
          );
          res = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ============================================================================
  // Admin Routes Protection
  // ============================================================================
  if (url.pathname.startsWith("/admin")) {
    let user;
    let profile;

    try {
      // Get authenticated user with timeout handling
      const userResponse = await Promise.race([
        supabase.auth.getUser(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Auth timeout")), 8000)
        ),
      ]);

      user = (userResponse as any)?.data?.user;

      // Redirect to login if not authenticated
      if (!user) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      // Fetch user role from profiles table with timeout
      const profileResponse = await Promise.race([
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
        ),
      ]);

      profile = (profileResponse as any)?.data;
    } catch (error) {
      // Supabase connection failed - redirect to login
      console.error("[Middleware] Admin auth error:", error);
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Verify admin role (admin, agent, chief_admin)
    const allowedRoles = ["admin", "agent", "chief_admin"];
    if (!profile?.role || !allowedRoles.includes(profile.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ============================================================================
    // Role-Based Access Control (RBAC)
    // ============================================================================
    
    // Chief Admin Only Routes
    const chiefAdminOnlyRoutes = ["/admin/users", "/admin/roles", "/admin/agents"];
    if (chiefAdminOnlyRoutes.some((route) => url.pathname.startsWith(route))) {
      if (profile.role !== "chief_admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Agent Restricted Routes (can't view audit/sales logs)
    const agentRestrictedRoutes = ["/admin/audit-log", "/admin/sales-log"];
    if (agentRestrictedRoutes.some((route) => url.pathname.startsWith(route))) {
      if (profile.role === "agent") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Log admin access for audit trail (non-blocking)
    try {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "page_access",
        resource_type: "admin_page",
        resource_id: null,
        changes: { path: url.pathname },
      });
    } catch (error) {
      console.error("[Middleware] Failed to log admin access:", error);
    }
  }

  // ============================================================================
  // Customer Routes Protection
  // ============================================================================
  const protectedCustomerRoutes = [
    "/shop/history",
    "/shop/wishlist",
    "/shop/checkout",
  ];

  if (protectedCustomerRoutes.some((path) => url.pathname.startsWith(path))) {
    try {
      const { data: { user } } = await Promise.race([
        supabase.auth.getUser(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Auth timeout")), 8000)
        ),
      ]);

      if (!(user as any)) {
        const redirectUrl = new URL("/shop/auth", req.url);
        redirectUrl.searchParams.set("redirect", url.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("[Middleware] Customer auth error:", error);
      // Allow request to proceed on auth service failure
      return NextResponse.next();
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all admin paths except /admin/login
     * Use negative lookahead pattern
     */
    "/admin/:path*",
    "/admin",
    /*
     * Match protected customer routes
     */
    "/shop/history",
    "/shop/wishlist",
    "/shop/checkout",
  ],
};
