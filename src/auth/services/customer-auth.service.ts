/**
 * =============================================================================
 * Customer Authentication Service
 * =============================================================================
 * 
 * Specialized authentication service for customer users.
 * Extends base AuthService with customer-specific operations.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { AuthService } from "./auth.service";
import type {
  AuthResult,
  CustomerUser,
  LoginInput,
  SignupInput,
  EmailInput,
} from "@/types";
import { SESSION_CONFIGS, AuthErrorCode, type PasswordResetInput } from "@/types";

/**
 * Customer-specific authentication service
 */
export class CustomerAuthService extends AuthService {
  constructor(supabase: SupabaseClient) {
    super(supabase, SESSION_CONFIGS.CUSTOMER); // 7 days persistent session
  }

  /**
   * Customer login
   */
  async login(input: LoginInput): Promise<AuthResult<CustomerUser>> {
    try {
      // Validate input
      if (!input.email || !input.password) {
        return {
          success: false,
          error: "Email and password are required",
          code: AuthErrorCode.INVALID_CREDENTIALS,
        };
      }

      // Attempt sign in
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        return {
          success: false,
          error: this.mapAuthError(error),
          code: this.mapAuthErrorCode(error),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: "Authentication failed",
          code: AuthErrorCode.LOGIN_FAILED,
        };
      }

      // Get customer profile
      const profile = await this.getUserProfile(data.user.id);

      if (!profile) {
        return {
          success: false,
          error: "User profile not found",
          code: AuthErrorCode.UNKNOWN_ERROR,
        };
      }

      // Check if user is active
      if (!this.isUserActive(profile.is_active)) {
        await this.supabase.auth.signOut();

        return {
          success: false,
          error: "Account is inactive. Contact support.",
          code: AuthErrorCode.ACCOUNT_INACTIVE,
        };
      }

      return {
        success: true,
        data: {
          id: data.user.id,
          email: data.user.email || "",
          role: "customer",
          is_active: profile.is_active,
          full_name: profile.full_name,
          phone: profile.phone,
        },
      };
    } catch (error) {
      console.error("[CustomerAuthService] login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
        code: AuthErrorCode.LOGIN_FAILED,
      };
    }
  }

  /**
   * Customer signup with email confirmation
   * All new users start as 'customer' role
   */
  async signup(input: SignupInput): Promise<AuthResult<CustomerUser>> {
    try {
      // Validate input
      const validationError = this.validateSignupInput(input);
      if (validationError) {
        return validationError;
      }

      // Sign up with Supabase Auth
      const { data, error } = await this.supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            phone: input.phone,
            role: "customer",
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/auth/confirm`,
        },
      });

      if (error) {
        return {
          success: false,
          error: this.mapSignupError(error),
          code: AuthErrorCode.SIGNUP_FAILED,
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: "Signup failed",
          code: AuthErrorCode.SIGNUP_FAILED,
        };
      }

      // Check if email confirmation is required
      const requiresConfirmation = !data.session;

      if (requiresConfirmation) {
        return {
          success: true,
          data: {
            id: data.user.id,
            email: data.user.email || "",
            role: "customer",
            is_active: false, // Will be activated after confirmation
            full_name: input.fullName,
            phone: input.phone,
          },
        };
      }

      // Session created (confirmation not required or already confirmed)
      return {
        success: true,
        data: {
          id: data.user.id,
          email: data.user.email || "",
          role: "customer",
          is_active: true,
          full_name: input.fullName,
          phone: input.phone,
        },
      };
    } catch (error) {
      console.error("[CustomerAuthService] signup error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Signup failed",
        code: AuthErrorCode.SIGNUP_FAILED,
      };
    }
  }

  /**
   * Verify customer email confirmation token
   */
  async verifyEmail(tokenHash: string): Promise<AuthResult<void>> {
    try {
      const { error } = await this.supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "email",
      });

      if (error) {
        return {
          success: false,
          error: error.message.includes("expired")
            ? "Confirmation link has expired. Please sign up again."
            : "Invalid confirmation link",
          code: AuthErrorCode.ACCOUNT_NOT_CONFIRMED,
        };
      }

      // Activate user profile after successful verification
      const { data: user } = await this.supabase.auth.getUser();
      if (user.user) {
        await this.activateUserProfile(user.user.id);
      }

      return { success: true };
    } catch (error) {
      console.error("[CustomerAuthService] verifyEmail error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Email verification failed",
        code: AuthErrorCode.ACCOUNT_NOT_CONFIRMED,
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(input: EmailInput): Promise<AuthResult<void>> {
    try {
      if (!this.validateEmail(input.email)) {
        return {
          success: false,
          error: "Please enter a valid email address",
          code: AuthErrorCode.INVALID_CREDENTIALS,
        };
      }

      const { error } = await this.supabase.auth.resetPasswordForEmail(
        input.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/auth/reset-password`,
        }
      );

      if (error) {
        return {
          success: false,
          error: error.message,
          code: AuthErrorCode.PASSWORD_RESET_FAILED,
        };
      }

      return { success: true };
    } catch (error) {
      console.error("[CustomerAuthService] sendPasswordResetEmail error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send reset email",
        code: AuthErrorCode.PASSWORD_RESET_FAILED,
      };
    }
  }

  /**
   * Reset password with new credentials
   */
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
        return {
          success: false,
          error: error.message,
          code: AuthErrorCode.PASSWORD_RESET_FAILED,
        };
      }

      return { success: true };
    } catch (error) {
      console.error("[CustomerAuthService] resetPassword error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Password reset failed",
        code: AuthErrorCode.PASSWORD_RESET_FAILED,
      };
    }
  }

  /**
   * Update customer profile
   */
  async updateProfile(
    userId: string,
    updates: {
      full_name?: string;
      phone?: string;
      date_of_birth?: string;
      gender?: string;
      avatar_url?: string;
    }
  ): Promise<AuthResult<void>> {
    try {
      const { error } = await this.supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        return {
          success: false,
          error: error.message,
          code: AuthErrorCode.UNKNOWN_ERROR,
        };
      }

      return { success: true };
    } catch (error) {
      console.error("[CustomerAuthService] updateProfile error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Profile update failed",
        code: AuthErrorCode.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Activate user profile after email confirmation
   */
  private async activateUserProfile(userId: string): Promise<void> {
    try {
      await this.supabase
        .from("profiles")
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    } catch (error) {
      console.error("[CustomerAuthService] activateUserProfile error:", error);
      // Non-critical, don't throw
    }
  }

  /**
   * Validate signup input
   */
  private validateSignupInput(input: SignupInput): AuthResult<CustomerUser> | null {
    if (!input.email || !input.password || !input.fullName || !input.phone) {
      return {
        success: false,
        error: "All fields are required",
        code: AuthErrorCode.INVALID_CREDENTIALS,
      };
    }

    if (!this.validateEmail(input.email)) {
      return {
        success: false,
        error: "Please enter a valid email address",
        code: AuthErrorCode.INVALID_CREDENTIALS,
      };
    }

    const passwordValidation = this.validatePassword(input.password);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: passwordValidation.error,
        code: AuthErrorCode.INVALID_CREDENTIALS,
      };
    }

    if (input.fullName.length < 2) {
      return {
        success: false,
        error: "Full name must be at least 2 characters",
        code: AuthErrorCode.INVALID_CREDENTIALS,
      };
    }

    return null;
  }

  /**
   * Map Supabase auth errors to user-friendly messages
   */
  private mapAuthError(error: any): string {
    const message = error.message?.toLowerCase() || "";

    if (message.includes("invalid login credentials")) {
      return "Invalid email or password";
    }
    if (message.includes("email not confirmed")) {
      return "Please verify your email address before logging in";
    }
    if (message.includes("rate limit")) {
      return "Too many attempts. Please try again later";
    }

    return error.message || "Authentication failed";
  }

  /**
   * Map Supabase errors to error codes
   */
  private mapAuthErrorCode(error: any): AuthErrorCode {
    const message = error.message?.toLowerCase() || "";

    if (message.includes("invalid login credentials")) {
      return AuthErrorCode.INVALID_CREDENTIALS;
    }
    if (message.includes("email not confirmed")) {
      return AuthErrorCode.ACCOUNT_NOT_CONFIRMED;
    }

    return AuthErrorCode.LOGIN_FAILED;
  }

  /**
   * Map signup errors to user-friendly messages
   */
  private mapSignupError(error: any): string {
    const message = error.message?.toLowerCase() || "";

    if (message.includes("user already registered")) {
      return "An account with this email already exists";
    }
    if (message.includes("weak password")) {
      return "Password is too weak. Please choose a stronger password";
    }
    if (message.includes("invalid email")) {
      return "Please enter a valid email address";
    }

    return error.message || "Signup failed";
  }
}
