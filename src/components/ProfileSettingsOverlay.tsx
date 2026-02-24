"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Share2,
  Headset,
  KeyRound,
  LogOut,
  Instagram,
  Facebook,
  Twitter,
  UserRoundPen,
  ChevronRight,
  LayoutDashboard,
  Shield,
  Camera,
  Trash2,
  Loader2,
  User,
  Phone,
  Calendar,
  Globe,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { AuthUser } from "@/types";
import { useToast } from "@/context/ToastContext";
import {
  updateProfile,
  uploadUserAvatar,
  deleteAvatar,
  sendPasswordResetEmail,
  getCurrentUserProfile,
} from "@/app/(users)/shop/profile-actions";

interface ProfileSettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
}

interface UserProfile {
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
}

export default function ProfileSettingsOverlay({
  isOpen,
  onClose,
  user,
}: ProfileSettingsOverlayProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    preferred_language: "en",
  });

  // Load profile when overlay opens
  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  // Sync form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        preferred_language: profile.preferred_language || "en",
      });
    }
  }, [profile]);

  async function loadProfile() {
    try {
      const result = await getCurrentUserProfile();
      if (result?.success && result.profile) {
        setProfile(result.profile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      success("Logged out successfully");
      onClose();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      showError("Failed to logout");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      showError("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showError("Image must be less than 2MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("avatar", file);

      const result = await uploadUserAvatar(uploadFormData);

      if (result.success && result.url) {
        success("Avatar updated successfully");
        setProfile((prev) => prev ? { ...prev, avatar_url: result.url! } : null);
      } else {
        showError(result.error || "Failed to upload avatar");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      showError("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Are you sure you want to delete your avatar?")) return;

    try {
      const result = await deleteAvatar();
      if (result.success) {
        success("Avatar deleted successfully");
        setProfile((prev) => prev ? { ...prev, avatar_url: null } : null);
      } else {
        showError(result.error || "Failed to delete avatar");
      }
    } catch (error) {
      console.error("Delete avatar error:", error);
      showError("Failed to delete avatar");
    }
  };

  const handleSaveProfile = async () => {
    setIsEditing(true);
    try {
      const updateFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        updateFormData.append(key, value);
      });

      const result = await updateProfile(null, updateFormData);

      if (result?.message) {
        success(result.message);
        setShowEditForm(false);
        loadProfile();
      } else if (result?.error) {
        showError(result.error);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showError("Failed to update profile");
    } finally {
      setIsEditing(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    if (!confirm(`Send password reset email to ${user.email}?`)) return;

    setIsSendingReset(true);
    try {
      const resetFormData = new FormData();
      resetFormData.append("email", user.email);

      const result = await sendPasswordResetEmail(null, resetFormData);

      if (result?.message) {
        success(result.message);
      } else if (result?.error) {
        showError(result.error);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      showError("Failed to send reset email");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "JRADIANCE",
          text: "Check out JRADIANCE - Premium Cosmetics & Skincare",
          url: window.location.href,
        });
        success("Thanks for sharing!");
      } catch (error) {
        console.error("Share error:", error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      success("Link copied to clipboard!");
    }
  };

  if (!isOpen) return null;

  const isAdminUser = user && ["admin", "agent", "chief_admin"].includes(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-auto"
        onClick={onClose}
      />

      {/* Overlay Content Card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl pointer-events-auto border border-gray-100 mt-16 flex flex-col overflow-y-auto max-h-[90vh]">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-base font-bold text-radiance-charcoalTextColor">
            Account Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {user ? (
            /* User is signed in */
            <>
              {/* Profile Section */}
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div
                    className="h-24 w-24 rounded-full bg-radiance-goldColor overflow-hidden border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-3xl cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleAvatarClick}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || "Profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      profile?.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()
                    )}
                  </div>
                  {isUploadingAvatar ? (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin text-white" />
                    </div>
                  ) : (
                    <button
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 p-2 bg-radiance-goldColor text-white rounded-full hover:bg-radiance-charcoalTextColor transition-colors shadow-md"
                    >
                      <Camera size={14} />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />

                {/* Name and Role */}
                <div className="mt-4">
                  <h3 className="font-bold text-lg text-radiance-charcoalTextColor">
                    {profile?.full_name || "User"}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 uppercase font-medium">
                      {profile?.role || user.role}
                    </span>
                    {isAdminUser && (
                      <Shield size={12} className="text-radiance-goldColor" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                </div>

                {/* Delete Avatar Button */}
                {profile?.avatar_url && (
                  <button
                    onClick={handleDeleteAvatar}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center justify-center gap-1 mx-auto"
                  >
                    <Trash2 size={12} />
                    Remove avatar
                  </button>
                )}
              </div>

              {/* Admin Dashboard Link */}
              {isAdminUser && (
                <Link
                  href="/admin/dashboard"
                  onClick={onClose}
                  className="flex items-center justify-between w-full bg-radiance-goldColor/10 border border-radiance-goldColor/20 text-radiance-goldColor text-xs font-bold py-3 px-4 rounded-lg hover:bg-radiance-goldColor/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    <span>Admin Dashboard</span>
                  </div>
                  <ChevronRight size={16} />
                </Link>
              )}

              {/* Edit Profile Button or Form */}
              {!showEditForm ? (
                <button
                  onClick={() => setShowEditForm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 text-xs font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <UserRoundPen size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-gray-700">Edit Profile</h4>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-radiance-goldColor outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Phone</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-radiance-goldColor outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-radiance-goldColor outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-radiance-goldColor outline-none"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Language</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={formData.preferred_language}
                        onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-radiance-goldColor outline-none"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="flex-1 px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isEditing}
                      className="flex-1 px-3 py-2 text-xs font-bold text-white bg-radiance-goldColor rounded-lg hover:bg-radiance-charcoalTextColor disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isEditing ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 p-3 text-xs font-medium hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Share2 size={16} className="text-radiance-goldColor" />
                  Share JRADIANCE Website
                </button>
                <button
                  onClick={() => router.push("/shop/contact")}
                  className="w-full flex items-center gap-3 p-3 text-xs font-medium hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Headset size={16} className="text-radiance-goldColor" />
                  Contact Support
                </button>
                <button
                  onClick={handlePasswordReset}
                  disabled={isSendingReset}
                  className="w-full flex items-center gap-3 p-3 text-xs font-medium hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  <KeyRound size={16} className="text-radiance-goldColor" />
                  {isSendingReset ? "Sending..." : "Reset Password"}
                </button>
              </div>
            </>
          ) : (
            /* User is NOT signed in */
            <div className="text-center py-8">
              <div className="h-20 w-20 rounded-full bg-radiance-goldColor/10 flex items-center justify-center text-radiance-goldColor mx-auto mb-4">
                <UserRoundPen size={40} />
              </div>
              <h3 className="text-lg font-bold text-radiance-charcoalTextColor mb-2">
                Welcome to JRADIANCE
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Join us for exclusive offers, personalized recommendations, and a beautiful shopping experience.
              </p>
              <Link
                href="/shop/auth"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full bg-radiance-goldColor text-white text-sm font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign In / Sign Up
                <ChevronRight size={16} />
              </Link>
            </div>
          )}

          {/* Social Media Handles */}
          <div className="pt-6 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
              Follow Us
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="https://www.instagram.com/jradiancecosmetics/?hl=de"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-50 rounded-full hover:bg-radiance-goldColor/10 transition-colors"
              >
                <Instagram size={18} className="text-radiance-charcoalTextColor hover:text-radiance-goldColor" />
              </Link>
              <Link
                href="https://www.facebook.com/jradianceco"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-50 rounded-full hover:bg-radiance-goldColor/10 transition-colors"
              >
                <Facebook size={18} className="text-radiance-charcoalTextColor hover:text-radiance-goldColor" />
              </Link>
              <Link
                href="https://twitter.com/jradianceco"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-50 rounded-full hover:bg-radiance-goldColor/10 transition-colors"
              >
                <Twitter size={18} className="text-radiance-charcoalTextColor hover:text-radiance-goldColor" />
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          {user && (
            <button
              onClick={handleLogout}
              className="mx-auto flex items-center gap-2 text-red-500 text-xs font-bold p-3 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
