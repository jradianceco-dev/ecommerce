/**
 * Admin Root Route Redirect
 * 
 * Redirects /admin to /admin/dashboard
 * 
 * Note: Authentication and authorization are handled by:
 * 1. Middleware (primary protection)
 * 2. Admin Layout (defensive check)
 * 
 * This page simply provides the redirect logic.
 * 
 * @author Philip Depaytez
 * @version 2.0.0
 */

import { redirect } from "next/navigation";

/**
 * Admin Root Page Component
 * 
 * SRP: Only handles redirecting to dashboard
 * OCP: Can be extended with analytics/metrics without modification
 */
export default async function AdminRootPage() {
  redirect("/admin/dashboard");
}
