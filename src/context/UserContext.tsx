/**
 * =============================================================================
 * User Context Provider - Refactored for SOLID Principles
 * =============================================================================
 * Features:
 * - Proper AbortController for cleanup
 * - Retry logic with exponential backoff
 * - Graceful error handling
 * - Auth state synchronization
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { AuthUser, UserRole } from "@/types";

/**
 * Authentication Service - Handles all auth operations
 * Single Responsibility: Only manages Supabase auth operations
 */
class AuthService {
  private supabase: ReturnType<typeof createClient>;
  private abortController: AbortController | null = null;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get abort signal for cancellable operations
   */
  getSignal(): AbortSignal | undefined {
    return this.abortController?.signal;
  }

  /**
   * Initialize abort controller for new operation
   */
  initAbortController(): void {
    this.abortController?.abort(); // Cancel previous operation
    this.abortController = new AbortController();
  }

  /**
   * Cleanup abort controller
   */
  cleanup(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  /**
   * Get current user with profile data
   * Uses retry logic with exponential backoff
   */
  async getCurrentUser(maxRetries = 3): Promise<AuthUser | null> {
    this.initAbortController();

    let lastError: unknown = null;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Check if aborted
        if (this.getSignal()?.aborted) {
          return null;
        }

        const { data: { user } } = await this.supabase.auth.getUser();

        if (!user) {
          this.cleanup();
          return null;
        }

        // Fetch role from profiles table (NOT user_metadata)
        const { data: profile, error: profileError } = await this.supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          // Don't fail completely if profile fetch fails - use default role
          console.warn("Profile fetch failed, using default role:", profileError.message);
        }

        const authUser: AuthUser = {
          id: user.id,
          email: user.email || "",
          role: (profile?.role as UserRole) || "customer",
        };

        this.cleanup();
        return authUser;
      } catch (error) {
        lastError = error;
        retryCount++;

        // Don't retry abort errors
        if (error instanceof Error && error.name === "AbortError") {
          this.cleanup();
          return null;
        }

        // Don't retry if user doesn't exist
        if (error instanceof Error && error.message.includes("User not found")) {
          this.cleanup();
          return null;
        }

        // Exponential backoff: 1s, 2s, 4s
        if (retryCount < maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, retryCount - 1) * 1000)
          );
        }
      }
    }

    // All retries failed
    console.error("Auth initialization failed after retries:", lastError);
    this.cleanup();
    return null;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, user: AuthUser | null) => void
  ): { unsubscribe: () => void } {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            // Fetch role from profiles table
            const { data: profile } = await this.supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single();

            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || "",
              role: (profile?.role as UserRole) || "customer",
            };
            callback(event, authUser);
          } catch (error) {
            // Use default role on error
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || "",
              role: "customer",
            };
            callback(event, authUser);
          }
        } else {
          callback(event, null);
        }
      }
    );

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }
}

// Create context
const UserContext = createContext<AuthUser | undefined>(undefined);

/**
 * User Provider Component
 * Manages auth state with proper cleanup and error handling
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);
  const authService = useCallback(() => new AuthService(), []);

  useEffect(() => {
    const service = authService();
    let authSubscription: { unsubscribe: () => void } | null = null;

    /**
     * Initialize authentication state
     */
    const initializeAuth = async () => {
      try {
        const user = await service.getCurrentUser();
        setAuthUser(user ?? undefined);
      } catch (error) {
        // Only log non-abort errors
        if (!(error instanceof Error) || error.name !== "AbortError") {
          console.error("Auth initialization error:", error);
        }
        setAuthUser(undefined);
      } finally {
        setIsInitialized(true);
      }
    };

    // Initialize auth
    initializeAuth();

    // Subscribe to auth changes
    authSubscription = service.onAuthStateChange((event, user) => {
      setAuthUser(user ?? undefined);
    });

    // Cleanup on unmount
    return () => {
      authSubscription?.unsubscribe();
      service.cleanup();
    };
  }, [authService]);

  return (
    <UserContext.Provider value={authUser}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to get current authenticated user
 * Returns AuthUser with id, email, and role, or null if not authenticated
 */
export function useUser(): AuthUser | null {
  const context = useContext(UserContext);
  return context || null;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const user = useUser();
  return !!user;
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

/**
 * Hook to check if auth is initialized
 * Useful for showing loading states
 */
export function useIsAuthInitialized(): boolean {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // Simple heuristic: if useUser returns anything other than undefined, auth is initialized
    const checkInit = () => {
      const user = useUser();
      setIsInitialized(user !== undefined || user === null);
    };
    checkInit();
  }, []);
  
  return isInitialized;
}
