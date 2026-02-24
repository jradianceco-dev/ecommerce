/**
 * Supabase Storage Service
 * ========================
 *
 * Handles file uploads to Supabase Storage buckets.
 * Replaces FTP-based Namecheap storage with Supabase Storage.
 *
 * Buckets:
 * - 'product-images': For product images and videos
 * - 'avatars': For user profile avatars
 *
 * @author Philip Depaytez
 * @version 2.0.0
 */

import { createClient } from "./server";
import { createClient as createBrowserClient } from "./client";

/**
 * Upload result interface
 */
export interface StorageUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
  filename?: string;
}

/**
 * Bucket configuration
 */
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: "product-images",
  AVATARS: "avatars",
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

/**
 * Get public URL for a storage object
 *
 * @param bucket - Bucket name
 * @param path - File path within bucket
 * @returns Public URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Upload a single file to Supabase Storage (Server-Side)
 *
 * @param file - File object from FormData
 * @param bucket - Destination bucket (product-images | avatars)
 * @param folder - Subfolder within bucket (e.g., "products", "avatars")
 * @param filename - Optional custom filename (auto-generated if not provided)
 * @returns Upload result with URL
 */
export async function uploadFileToStorage(
  file: File,
  bucket: StorageBucket,
  folder: string,
  filename?: string
): Promise<StorageUploadResult> {
  try {
    const supabase = await createClient();
    const bucketName = STORAGE_BUCKETS[bucket];

    // Generate unique filename if not provided
    const fileExtension = file.name.split(".").pop() || "file";
    const finalFilename =
      filename ||
      `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    // Construct full path
    const path = `${folder}/${finalFilename}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, buffer, {
        contentType: file.type,
        duplex: "half",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const publicUrl = getPublicUrl(bucketName, path);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
      filename: finalFilename,
    };
  } catch (error) {
    console.error("Storage upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}

/**
 * Upload multiple files to Supabase Storage (Server-Side)
 *
 * @param files - Array of File objects from FormData
 * @param bucket - Destination bucket
 * @param folder - Subfolder within bucket
 * @returns Array of upload results
 */
export async function uploadMultipleFilesToStorage(
  files: File[],
  bucket: StorageBucket,
  folder: string
): Promise<StorageUploadResult[]> {
  const results: StorageUploadResult[] = [];

  for (const file of files) {
    const result = await uploadFileToStorage(file, bucket, folder);
    results.push(result);
  }

  return results;
}

/**
 * Upload a single file to Supabase Storage (Client-Side)
 *
 * @param file - File object
 * @param bucket - Destination bucket
 * @param folder - Subfolder within bucket
 * @param filename - Optional custom filename
 * @returns Upload result with URL
 */
export async function uploadFileToStorageClient(
  file: File,
  bucket: StorageBucket,
  folder: string,
  filename?: string
): Promise<StorageUploadResult> {
  try {
    const supabase = createBrowserClient();
    const bucketName = STORAGE_BUCKETS[bucket];

    // Generate unique filename if not provided
    const fileExtension = file.name.split(".").pop() || "file";
    const finalFilename =
      filename ||
      `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    // Construct full path
    const path = `${folder}/${finalFilename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(path);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
      filename: finalFilename,
    };
  } catch (error) {
    console.error("Client storage upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}

/**
 * Delete a file from Supabase Storage
 *
 * @param bucket - Bucket name
 * @param path - File path within bucket
 * @returns Result of deletion operation
 */
export async function deleteFileFromStorage(
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const bucketName = STORAGE_BUCKETS[bucket];

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Storage delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
}

/**
 * Delete multiple files from Supabase Storage
 *
 * @param bucket - Bucket name
 * @param paths - Array of file paths
 * @returns Result of deletion operation
 */
export async function deleteMultipleFilesFromStorage(
  bucket: StorageBucket,
  paths: string[]
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    const supabase = await createClient();
    const bucketName = STORAGE_BUCKETS[bucket];

    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove(paths);

    if (error) throw error;

    return {
      success: true,
      deletedCount: data?.length || paths.length,
    };
  } catch (error) {
    console.error("Storage batch delete error:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Failed to delete files",
    };
  }
}

/**
 * Upload avatar for user (Client-Side)
 *
 * @param file - Avatar file
 * @param userId - User ID for folder organization
 * @returns Upload result with URL
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<StorageUploadResult> {
  return uploadFileToStorageClient(file, "AVATARS", `avatars/${userId}`);
}

/**
 * Upload product media (Server-Side)
 *
 * @param files - Array of media files
 * @returns Array of upload results
 */
export async function uploadProductMedia(
  files: File[]
): Promise<StorageUploadResult[]> {
  return uploadMultipleFilesToStorage(files, "PRODUCT_IMAGES", "products");
}

/**
 * Validate file type for upload
 *
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Validation result
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  const isAllowed = allowedTypes.some(
    (type) =>
      type === file.type ||
      (type.endsWith("/*") && file.type.startsWith(type.slice(0, -2)))
  );

  if (!isAllowed) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const isWithinLimit = file.size <= maxSizeBytes;

  if (!isWithinLimit) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit. Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Allowed file types for product media
 */
export const PRODUCT_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

/**
 * Allowed file types for avatars
 */
export const AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

/**
 * Maximum file sizes (in MB)
 */
export const MAX_FILE_SIZES = {
  PRODUCT_IMAGE: 5, // 5MB
  PRODUCT_VIDEO: 50, // 50MB
  AVATAR: 2, // 2MB
};
