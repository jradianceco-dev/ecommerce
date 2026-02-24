# Supabase Storage Setup Guide

## Overview

This document guides you through setting up Supabase Storage for the JRADIANCE e-commerce application. This replaces the previous FTP-based Namecheap storage solution.

## Prerequisites

- Supabase project already created
- Database schema already set up (run the SQL setup script)
- Admin access to Supabase dashboard

---

## Step 1: Create Storage Buckets

### 1.1 Navigate to Storage

1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **New Bucket**

### 1.2 Create `product-images` Bucket

**Bucket Details:**
- **Name**: `product-images`
- **Public**: ✅ Yes (public bucket)
- **File size limit**: `52428800` (50MB - for videos)
- **Allowed MIME types**: Leave empty (allow all)

**Create the bucket and proceed to policies.**

### 1.3 Create `avatars` Bucket

**Bucket Details:**
- **Name**: `avatars`
- **Public**: ✅ Yes (public bucket)
- **File size limit**: `2097152` (2MB - for profile pictures)
- **Allowed MIME types**: Leave empty (allow all)

---

## Step 2: Configure Storage Policies

### 2.1 Product Images Bucket Policies

Navigate to the `product-images` bucket → **Policies** tab → **New Policy**

#### Policy 1: Public View (SELECT)

```sql
Policy name: Public View Product Images
Policy action: Select
Target roles: public
Policy definition (USING):
```

```sql
bucket_id = 'product-images'
```

#### Policy 2: Authenticated Upload (INSERT)

```sql
Policy name: Authenticated Upload Product Images
Policy action: Insert
Target roles: authenticated
Policy definition (WITH CHECK):
```

```sql
bucket_id = 'product-images'
AND auth.uid() IS NOT NULL
```

#### Policy 3: Authenticated Update (UPDATE)

```sql
Policy name: Authenticated Update Product Images
Policy action: Update
Target roles: authenticated
Policy definition (USING):
```

```sql
bucket_id = 'product-images'
AND auth.uid() IS NOT NULL
```

#### Policy 4: Authenticated Delete (DELETE)

```sql
Policy name: Authenticated Delete Product Images
Policy action: Delete
Target roles: authenticated
Policy definition (USING):
```

```sql
bucket_id = 'product-images'
AND auth.uid() IS NOT NULL
```

---

### 2.2 Avatars Bucket Policies

Navigate to the `avatars` bucket → **Policies** tab → **New Policy**

#### Policy 1: Public View (SELECT)

```sql
Policy name: Public View Avatars
Policy action: Select
Target roles: public
Policy definition (USING):
```

```sql
bucket_id = 'avatars'
```

#### Policy 2: Authenticated Upload (INSERT)

```sql
Policy name: Authenticated Upload Avatars
Policy action: Insert
Target roles: authenticated
Policy definition (WITH CHECK):
```

```sql
bucket_id = 'avatars'
AND auth.uid() IS NOT NULL
```

#### Policy 3: Authenticated Update (UPDATE)

```sql
Policy name: Authenticated Update Avatars
Policy action: Update
Target roles: authenticated
Policy definition (USING):
```

```sql
bucket_id = 'avatars'
AND auth.uid() IS NOT NULL
```

#### Policy 4: Authenticated Delete (DELETE)

```sql
Policy name: Authenticated Delete Avatars
Policy action: Delete
Target roles: authenticated
Policy definition (USING):
```

```sql
bucket_id = 'avatars'
AND auth.uid() IS NOT NULL
```

---

## Step 3: Verify Setup

### 3.1 Test Upload via Dashboard

1. Go to **Storage** → `product-images` bucket
2. Click **Upload**
3. Upload a test image
4. Verify the file is accessible via public URL

**Expected URL format:**
```
https://<your-project-id>.supabase.co/storage/v1/object/public/product-images/<file-path>
```

### 3.2 Test via Application

1. Log in to the admin panel
2. Navigate to **Products Catalog**
3. Click **Add Product**
4. Upload a test product image
5. Verify the image displays correctly

---

## Step 4: Storage Configuration in Application

### 4.1 Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4.2 Image Optimization (next.config.ts)

The application is already configured to optimize images from Supabase Storage. The `next.config.ts` includes:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ],
}
```

---

## Step 5: Migration from FTP (If Applicable)

If you have existing images on Namecheap FTP:

### 5.1 Download Existing Images

1. Connect to FTP using your credentials
2. Download all product images from `/products` folder
3. Organize them locally

### 5.2 Upload to Supabase Storage

**Option A: Manual Upload via Dashboard**
- Go to Storage → `product-images` bucket
- Upload files manually or in batches

**Option B: Programmatic Migration**

Create a migration script:

```typescript
// scripts/migrate-storage.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateImages() {
  const imageDir = './migrated-images';
  const files = fs.readdirSync(imageDir);

  for (const file of files) {
    const filePath = path.join(imageDir, file);
    const fileContent = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(`products/${file}`, fileContent);

    if (error) {
      console.error(`Error uploading ${file}:`, error);
    } else {
      console.log(`Uploaded ${file}`);
    }
  }
}

migrateImages();
```

### 5.3 Update Database References

After migration, update product records with new image URLs:

```sql
-- Example: Update product image URLs
UPDATE products
SET images = (
  SELECT jsonb_agg(
    'https://your-project-id.supabase.co/storage/v1/object/public/product-images/products/' || 
    regexp_replace(img, '^https://jradianceco.com/storage/products/', '')
  )
  FROM jsonb_array_elements_text(images) AS img
)
WHERE images IS NOT NULL;
```

---

## Step 6: Storage Management

### 6.1 Monitor Storage Usage

1. Go to **Storage** in Supabase dashboard
2. View usage statistics for each bucket
3. Set up alerts for storage limits

### 6.2 Cleanup Orphaned Files

Create a cleanup function to remove unused images:

```sql
-- This requires custom implementation based on your needs
-- Consider using Supabase Edge Functions for automated cleanup
```

### 6.3 Backup Strategy

1. Enable **Point-in-Time Recovery** in Supabase settings
2. Set up regular exports of storage metadata
3. Consider using Supabase's backup features

---

## Troubleshooting

### Issue: Upload Fails with "Permission Denied"

**Solution:**
- Verify storage policies are correctly configured
- Ensure user is authenticated
- Check bucket name matches exactly

### Issue: Images Not Displaying

**Solution:**
- Verify bucket is public
- Check URL format is correct
- Ensure Next.js image optimization is configured
- Clear browser cache

### Issue: File Size Limit Exceeded

**Solution:**
- Check file size before upload
- Update bucket file size limit if needed
- Compress images before upload

---

## Security Best Practices

1. **Always use RLS (Row Level Security)** - Already configured in database
2. **Validate file types** - Implemented in upload functions
3. **Limit file sizes** - Configured in bucket settings
4. **Use authenticated uploads** - Policies require authentication
5. **Monitor storage access** - Review logs regularly

---

## API Reference

### Upload Product Image (Client-Side)

```typescript
import { uploadAvatar } from '@/utils/supabase/storage';

const result = await uploadAvatar(file, userId);
if (result.success) {
  console.log('Uploaded:', result.url);
}
```

### Upload Product Media (Server-Side)

```typescript
import { uploadProductMedia } from '@/utils/supabase/storage';

const results = await uploadProductMedia(files);
results.forEach(result => {
  if (result.success) {
    console.log('Uploaded:', result.url);
  }
});
```

### Get Public URL

```typescript
import { getPublicUrl } from '@/utils/supabase/storage';

const url = getPublicUrl('product-images', 'products/image.jpg');
```

---

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/security-policies)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/getting-started)

---

## Support

For issues or questions:
1. Check Supabase dashboard logs
2. Review application console logs
3. Verify storage policies
4. Contact development team

---

**Last Updated:** February 24, 2026  
**Version:** 2.0  
**Author:** Philip Depaytez
