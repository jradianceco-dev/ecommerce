/**
 * =============================================================================
 * Authentication Strategy Interface
 * =============================================================================
 * 
 * Defines the contract for all authentication strategies.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthResult,
  AuthenticatedUser,
  LoginInput,
  SignupInput,
  PasswordResetInput,
  EmailInput,
  SessionConfig,
} from "@/types";
import { SessionPersistence, AuthErrorCode } from "@/types";

/**
 * Abstract strategy interface for authentication
 */
export interface IAuthStrategy {
  login(input: LoginInput): Promise<AuthResult<AuthenticatedUser>>;
  signup(input: SignupInput): Promise<AuthResult<AuthenticatedUser>>;
  logout(): Promise<AuthResult<void>>;
  getCurrentUser(): Promise<AuthResult<AuthenticatedUser | null>>;
  sendPasswordResetEmail(input: EmailInput): Promise<AuthResult<void>>;
  resetPassword(input: PasswordResetInput): Promise<AuthResult<void>>;
  verifyEmail(tokenHash: string): Promise<AuthResult<void>>;
  refreshSession(): Promise<AuthResult<void>>;
  setSessionConfig(config: SessionConfig): void;
}

/**
 * Strategy metadata for debugging and logging
 */
export interface AuthStrategyMetadata {
  name: string;
  version: string;
  supportedUserTypes: string[];
}

/**
 * Base strategy with common functionality
 */
export abstract class BaseAuthStrategy implements IAuthStrategy {
  protected supabase: SupabaseClient;
  protected sessionConfig: SessionConfig;

  constructor(supabase: SupabaseClient, sessionConfig?: SessionConfig) {
    this.supabase = supabase;
    this.sessionConfig = sessionConfig || {
      expiresIn: 7 * 24 * 60 * 60,
      persistence: SessionPersistence.PERSISTENT,
    };
  }

  abstract getMetadata(): AuthStrategyMetadata;
  abstract login(input: LoginInput): Promise<AuthResult<AuthenticatedUser>>;
  abstract signup(input: SignupInput): Promise<AuthResult<AuthenticatedUser>>;

  async logout(): Promise<AuthResult<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message, code: AuthErrorCode.LOGOUT_FAILED };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
        code: AuthErrorCode.LOGOUT_FAILED,
      };
    }
  }

  async getCurrentUser(): Promise<AuthResult<AuthenticatedUser | null>> {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      if (error || !data.user) {
        return {
          success: false,
          error: error?.message || "Not authenticated",
          code: AuthErrorCode.SESSION_INVALID,
        };
      }
      return {
        success: true,
        data: {
          id: data.user.id,
          email: data.user.email || "",
          role: (data.user.user_metadata?.role as any) || "customer",
          is_active: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Auth check failed",
        code: AuthErrorCode.UNKNOWN_ERROR,
      };
    }
  }

  async sendPasswordResetEmail(input: EmailInput): Promise<AuthResult<void>> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(
        input.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/auth/reset-password`,
        }
      );
      if (error) {
        return { success: false, error: error.message, code: AuthErrorCode.PASSWORD_RESET_FAILED };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Reset email failed",
        code: AuthErrorCode.PASSWORD_RESET_FAILED,
      };
    }
  }

  async resetPassword(input: PasswordResetInput): Promise<AuthResult<void>> {
    try {
      if (input.password !== input.confirmPassword) {
        return {
          success: false,
          error: "Passwords do not match",
          code: AuthErrorCode.INVALID_CREDENTIALS,
        };
      }
      if (input.password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters",
          code: AuthErrorCode.INVALID_CREDENTIALS,
        };
      }
      const { error } = await this.supabase.auth.updateUser({
        password: input.password,
      });
      if (error) {
        return { success: false, error: error.message, code: AuthErrorCode.PASSWORD_RESET_FAILED };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Password reset failed",
        code: AuthErrorCode.PASSWORD_RESET_FAILED,
      };
    }
  }

  async verifyEmail(tokenHash: string): Promise<AuthResult<void>> {
    try {
      const { error } = await this.supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "email",
      });
      if (error) {
        return { success: false, error: error.message, code: AuthErrorCode.ACCOUNT_NOT_CONFIRMED };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Email verification failed",
        code: AuthErrorCode.ACCOUNT_NOT_CONFIRMED,
      };
    }
  }

  async refreshSession(): Promise<AuthResult<void>> {
    try {
      const { error } = await this.supabase.auth.refreshSession();
      if (error) {
        return { success: false, error: error.message, code: AuthErrorCode.SESSION_EXPIRED };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Session refresh failed",
        code: AuthErrorCode.SESSION_EXPIRED,
      };
    }
  }

  setSessionConfig(config: SessionConfig): void {
    this.sessionConfig = config;
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected validatePassword(password: string): { valid: boolean; error?: string } {
    if (password.length < 6) {
      return { valid: false, error: "Password must be at least 6 characters" };
    }
    return { valid: true };
  }
}
