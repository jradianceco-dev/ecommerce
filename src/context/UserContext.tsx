/**
 * =============================================================================
 * User Context Provider - FIXED v4
 * =============================================================================
 * 
 * CRITICAL FIXES:
 * 1. Proper auth state synchronization
 * 2. Manual refresh after login
 * 3. Better error handling for missing profiles
 * 4. Fixed re-render triggers
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { AuthUser, UserRole } from "@/types";

interface UserContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * User Provider - FIXED
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user function - extracted for reuse
  const fetchUser = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !supabaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Fetch profile for role - with timeout
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", supabaseUser.id)
        .single();

      if (profileError || !profile) {
        // Profile doesn't exist yet - create it
        console.warn("Profile not found, creating...", supabaseUser.email);
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            role: 'customer',
            is_active: true,
          })
          .select("role")
          .single();

        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          role: (newProfile?.role as UserRole) || "customer",
        });
      } else {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          role: (profile.role as UserRole) || "customer",
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    fetchUser();

    const supabase = createClient();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === "SIGNED_IN" && session?.user) {
          // Wait a bit for session to settle
          setTimeout(() => fetchUser(), 100);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsLoading(false);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          fetchUser();
        } else if (event === "USER_UPDATED") {
          fetchUser();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refreshUser: fetchUser,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to get current user
 */
export function useUser(): AuthUser | null {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context.user;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useIsAuthenticated must be used within a UserProvider");
  }
  return context.isAuthenticated;
}

/**
 * Hook to check if auth is loading
 */
export function useIsAuthLoading(): boolean {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useIsAuthLoading must be used within a UserProvider");
  }
  return context.isLoading;
}

/**
 * Hook to refresh user data
 */
export function useRefreshUser(): () => Promise<void> {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useRefreshUser must be used within a UserProvider");
  }
  return context.refreshUser;
}

/**
 * Hook to check admin privileges
 */
export function useIsAdmin(): boolean {
  const user = useUser();
  return user ? ["admin", "agent", "chief_admin"].includes(user.role) : false;
}

/**
 * Hook to check chief admin
 */
export function useIsChiefAdmin(): boolean {
  const user = useUser();
  return user?.role === "chief_admin";
}
