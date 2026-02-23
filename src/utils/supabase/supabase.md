# Supabase Integration Documentation

## Overview

This document describes how the ECommerce application integrates with Supabase for authentication, database, and storage.

## Database Schema Alignment

### User Roles

**Supabase ENUM:**
```sql
CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'agent', 'chief_admin');
```

**TypeScript Type:**
```typescript
export type UserRole = "customer" | "admin" | "agent" | "chief_admin";
```

### UUID Handling

All user IDs are UUIDs from Supabase Auth (`auth.users.id`). The code uses these UUIDs directly:

```typescript
// user.id is already a UUID string from Supabase Auth
const { data: { user } } = await supabase.auth.getUser();
// user.id = "550e8400-e29b-41d4-a716-446655440000"

// Direct UUID comparison - no conversion needed
await supabase.from("profiles").select("*").eq("id", user.id);
```

### Table Mappings

| Supabase Table | TypeScript Interface | Usage |
|---------------|---------------------|-------|
| `profiles` | `UserProfile` | User accounts, roles, active status |
| `admin_staff` | `AdminStaff` | Extended admin information |
| `products` | `Product` | Product catalog |
| `orders` | `Order` | Customer orders |
| `order_items` | `OrderItem` | Order line items |
| `cart_items` | `CartItem` | Shopping cart |
| `wishlist` | `WishlistItem` | Customer wishlists |
| `admin_activity_logs` | `AdminActivityLog` | Audit trail |

## Authentication Flow

### Customer Signup

1. **Client** → Calls `customerSignup()` action
2. **Action** → Calls `supabase.auth.signUp()` with metadata
3. **Supabase** → Creates `auth.users` record
4. **Trigger** → `handle_new_user()` creates `profiles` record
5. **Email** → Confirmation sent if enabled
6. **Client** → Shows confirmation message

```typescript
// src/auth/services/customer-auth.service.ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: input.fullName,
      phone: input.phone,
      role: "customer", // Always customer on signup
    },
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/auth/confirm`,
  },
});
```

### Admin Login

1. **Client** → Calls `adminLogin()` action
2. **Action** → Calls `AdminAuthService.login()`
3. **Service** → Authenticates with Supabase Auth
4. **Service** → Verifies role from `profiles` table
5. **Service** → Checks `is_active` status
6. **Service** → Updates `admin_staff.last_login_at`
7. **Service** → Logs to `admin_activity_logs`
8. **Client** → Redirects to `/admin/dashboard`

```typescript
// src/auth/services/admin-auth.service.ts
async login(input: LoginInput): Promise<AuthResult<AdminUser>> {
  // 1. Authenticate
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  
  // 2. Verify admin role
  const profile = await this.getUserProfile(data.user.id);
  if (!this.isAdminRole(profile.role)) {
    return { success: false, error: "Unauthorized" };
  }
  
  // 3. Check active status
  if (!this.isUserActive(profile.is_active)) {
    return { success: false, error: "Account inactive" };
  }
  
  // 4. Update last login
  await this.updateLastLogin(data.user.id);
  
  return { success: true, data: { ... } };
}
```

## Middleware Protection

### Admin Routes

```typescript
// src/middleware.ts
if (url.pathname.startsWith("/admin")) {
  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Get profile with role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();
  
  // 3. Verify admin role
  const allowedRoles = ["admin", "agent", "chief_admin"];
  if (!allowedRoles.includes(profile.role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  // 4. Verify active status
  if (!profile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  
  // 5. RBAC for specific routes
  if (profile.role === "agent" && url.pathname.startsWith("/admin/users")) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }
}
```

## Row Level Security (RLS)

The application relies on Supabase RLS for data security:

### Profiles Policies
```sql
-- Anyone can read profiles
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Admin Staff Policies
```sql
-- Admins can view admin staff
CREATE POLICY "admin_staff_select_admin" ON public.admin_staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'chief_admin', 'agent')
    )
  );
```

### Products Policies
```sql
-- Public can view active products, admins can view all
CREATE POLICY "products_select_active" ON public.products
  FOR SELECT USING (
    is_active = true OR (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'agent', 'chief_admin')
      )
    )
  );
```

## Service Layer

### AuthService (Base)
- `getCurrentUser()` - Get authenticated user with profile
- `getUserProfile(userId)` - Fetch profile from database
- `getAdminStaffRecord(userId)` - Fetch admin staff record
- `isAdminRole(role)` - Check if role is admin
- `isUserActive(isActive)` - Check if user is active
- `verifyAdminAccess()` - Full admin verification
- `verifyCustomerAccess()` - Full customer verification
- `signOut()` - Log out user
- `refreshSession()` - Refresh auth session

### AdminAuthService
- `login(input)` - Admin login with role verification
- `verifyRoleLevel(userId, requiredRole)` - Check role hierarchy
- `canAccessRoute(userId, pathname)` - Route access check
- `updateLastLogin(userId)` - Update last login timestamp
- `logAdminLogin(userId)` - Log admin login

### CustomerAuthService
- `login(input)` - Customer login
- `signup(input)` - Customer signup with email confirmation
- `verifyEmail(tokenHash)` - Verify email confirmation token
- `sendPasswordResetEmail(input)` - Send password reset email
- `resetPassword(input)` - Reset password
- `updateProfile(userId, updates)` - Update customer profile

## Environment Variables

Required environment variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL
NEXT_PUBLIC_SITE_URL=https://jradianceco.com
```

## Database Functions

### handle_new_user()
Automatically creates profile when user signs up via Auth.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    (COALESCE(NEW.raw_user_meta_data->>'role', 'customer'))::public.user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### log_admin_action()
Helper function for logging admin actions (optional use).

```sql
CREATE OR REPLACE FUNCTION public.log_admin_action(
  admin_id uuid,
  action text,
  resource_type text DEFAULT NULL,
  resource_id uuid DEFAULT NULL,
  changes jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.admin_activity_logs (...)
  VALUES (admin_id, action, resource_type, resource_id, changes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Best Practices

1. **Always use `createClient()` from `@/utils/supabase/server`** for server-side operations
2. **Always use `createClient()` from `@/utils/supabase/client`** for client-side operations
3. **Use auth services** instead of direct Supabase calls for authentication
4. **Use guards** for route protection in middleware
5. **Trust middleware** in layouts (minimal defensive checks only)
6. **Use UUIDs directly** - no conversion needed
7. **Check `is_active`** status for all authenticated users
8. **Log admin actions** to `admin_activity_logs` for audit trail

## Error Handling

All auth services return standardized `AuthResult` objects:

```typescript
interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: AuthErrorCode;
}
```

Error codes match Supabase error types:
- `INVALID_CREDENTIALS` - Wrong email/password
- `SESSION_INVALID` - Not authenticated
- `UNAUTHORIZED_ROLE` - User doesn't have required role
- `ACCOUNT_INACTIVE` - User account is deactivated
- `ACCOUNT_NOT_CONFIRMED` - Email not confirmed
- `LOGIN_FAILED` - General login error
- `SIGNUP_FAILED` - General signup error
- `LOGOUT_FAILED` - Logout error
- `PASSWORD_RESET_FAILED` - Password reset error

## Version

- **Schema Version:** 1.0.0
- **Code Version:** 4.0.0 (Refactored with centralized auth)
- **Last Updated:** February 23, 2026
