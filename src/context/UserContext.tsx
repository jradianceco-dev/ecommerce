/**
 * User Context Provider 
 * =====================
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import type { AuthUser, UserRole } from "@/types";

// Context type
interface UserContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

/**
 * User Provider Component - OPTIMIZED
 * 
 * Features:
 * - Immediate auth check (no delays)
 * - Persistent session (survives refresh)
 * - Real-time auth state updates
 * - Proper cleanup on unmount
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth immediately (no retry delays!)
  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    // Immediate check
    supabase.auth.getUser()
      .then(async ({ data: { user: supabaseUser } }) => {
        if (!isMounted) return;
        
        if (!supabaseUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Fetch profile for role
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", supabaseUser.id)
            .single();

          if (isMounted) {
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email || "",
              role: (profile?.role as UserRole) || "customer",
            });
            setIsLoading(false);
          }
        } catch {
          // Profile fetch failed, use default role
          if (isMounted) {
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email || "",
              role: "customer",
            });
            setIsLoading(false);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      });

    // Subscribe to auth changes (real-time updates)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          // User logged in
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role: (profile?.role as UserRole) || "customer",
          });
          setIsLoading(false);
        } else if (event === "SIGNED_OUT") {
          // User logged out
          setUser(null);
          setIsLoading(false);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          // Session refreshed (persists across refresh)
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role: (profile?.role as UserRole) || "customer",
          });
          setIsLoading(false);
        }
      }
    );

    // Cleanup
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
  }), [user, isLoading]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to get current user
 * Returns user object or null if not authenticated
 */
export function useUser(): AuthUser | null {
  const context = useContext(UserContext);
  return context.user;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const context = useContext(UserContext);
  return context.isAuthenticated;
}

/**
 * Hook to check if auth is still loading
 */
export function useIsAuthLoading(): boolean {
  const context = useContext(UserContext);
  return context.isLoading;
}

/**
 * Hook to check if user has admin privileges
 */
export function useIsAdmin(): boolean {
  const user = useUser();
  return user ? ["admin", "agent", "chief_admin"].includes(user.role) : false;
}

/**
 * Hook to check if user is chief admin
 */
export function useIsChiefAdmin(): boolean {
  const user = useUser();
  return user?.role === "chief_admin";
}
