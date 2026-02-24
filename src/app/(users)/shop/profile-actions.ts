/**
 * Customer Profile Actions
 *
 * Server actions for customer profile management.
 * Handles profile updates, avatar uploads, and password changes.
 */

"use server";

import { createClient } from "@/utils/supabase/server";
import { uploadAvatar, AVATAR_TYPES, validateFileType, validateFileSize, MAX_FILE_SIZES } from "@/utils/supabase/storage";
import type { AuthState } from "@/types";

/**
 * Update user profile information
 */
export async function updateProfile(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated", message: null };
    }

    const fullName = formData.get("full_name") as string;
    const phone = formData.get("phone") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const gender = formData.get("gender") as string;
    const preferredLanguage = formData.get("preferred_language") as string;

    // Validate data
    if (!fullName || fullName.trim().length === 0) {
      return { error: "Full name is required", message: null };
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        preferred_language: preferredLanguage || "en",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw error;

    return { error: null, message: "Profile updated successfully" };
  } catch (error) {
    console.error("[Profile Actions] updateProfile error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to update profile",
      message: null,
    };
  }
}

/**
 * Upload user avatar
 */
export async function uploadUserAvatar(
  formData: FormData
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const file = formData.get("avatar") as File;

    if (!file || file.size === 0) {
      return { success: false, error: "No file selected" };
    }

    // Validate file type
    const typeValidation = validateFileType(file, AVATAR_TYPES);
    if (!typeValidation.valid) {
      return { success: false, error: typeValidation.error };
    }

    // Validate file size
    const sizeValidation = validateFileSize(file, MAX_FILE_SIZES.AVATAR);
    if (!sizeValidation.valid) {
      return { success: false, error: sizeValidation.error };
    }

    // Upload avatar
    const result = await uploadAvatar(file, user.id);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Update profile with new avatar URL
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: result.url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw error;

    return { success: true, url: result.url };
  } catch (error) {
    console.error("[Profile Actions] uploadAvatar error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload avatar",
    };
  }
}

/**
 * Delete user avatar
 */
export async function deleteAvatar(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get current avatar URL
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (!profile?.avatar_url) {
      return { success: true }; // No avatar to delete
    }

    // Extract path from URL
    const urlParts = profile.avatar_url.split("/");
    const path = urlParts.slice(-2).join("/");

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("avatars")
      .remove([path]);

    if (storageError) throw storageError;

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error) {
    console.error("[Profile Actions] deleteAvatar error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete avatar",
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated", message: null };
    }

    const email = formData.get("email") as string;

    if (!email || email !== user.email) {
      return { error: "Email does not match", message: null };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/auth/reset-password`,
    });

    if (error) throw error;

    return { error: null, message: "Password reset email sent. Check your inbox.", email };
  } catch (error) {
    console.error("[Profile Actions] sendPasswordResetEmail error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to send reset email",
      message: null,
    };
  }
}

/**
 * Get current user profile with full details
 */
export async function getCurrentUserProfile(): Promise<{
  success: boolean;
  profile?: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: string;
    avatar_url: string | null;
    date_of_birth: string | null;
    gender: string | null;
    preferred_language: string;
    is_active: boolean;
  };
  error?: string;
} | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return null;
    }

    return {
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        avatar_url: profile.avatar_url,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        preferred_language: profile.preferred_language,
        is_active: profile.is_active,
      },
    };
  } catch (error) {
    console.error("[Profile Actions] getCurrentUserProfile error:", error);
    return null;
  }
}
