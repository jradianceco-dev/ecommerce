# JRADIANCE E-Commerce - Code Documentation

## Professional JavaScript/TypeScript Documentation

**Version:** 1.0.0  
**Last Updated:** 2026-03-15  
**Project:** JRADIANCE E-Commerce Platform

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Code Standards](#code-standards)
3. [TypeScript Types](#typescript-types)
4. [Component Documentation](#component-documentation)
5. [Context Providers](#context-providers)
6. [API Routes](#api-routes)
7. [Database Functions](#database-functions)
8. [Utilities](#utilities)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

---

## Architecture Overview

### Application Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pages     │  │ Components  │  │   Context   │     │
│  │  (App Router)│  │   (UI)      │  │  Providers  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Server Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ API Routes  │  │   Server    │  │   Server    │     │
│  │  (REST)     │  │  Actions    │  │  Clients    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Database Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Supabase   │  │   Storage   │  │     Auth    │     │
│  │ (PostgreSQL)│  │   (S3)      │  │  (Supabase) │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Design Patterns

- **Component-Based Architecture** - Reusable React components
- **Context API** - Global state management
- **Server-Side Rendering (SSR)** - Next.js App Router
- **Static Site Generation (SSG)** - Pre-rendered pages
- **Server Actions** - Form handling and mutations
- **Repository Pattern** - Database abstraction via services

---

## Code Standards

### TypeScript Configuration

```typescript
// tsconfig.json highlights
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Code Style Guidelines

#### 1. File Naming

```typescript
// Components: PascalCase
ProductCard.tsx
OrderHistory.tsx

// Utilities: camelCase
currency.ts
error-tracking.ts

// Types: PascalCase
Product.ts
Order.ts

// API Routes: kebab-case in folder structure
/api/flutterwave/verify/route.ts
```

#### 2. Component Structure

```typescript
/**
 * Component JSDoc
 * 
 * @description What the component does
 * @param props - Component props
 * @returns JSX element
 */
"use client";  // or "use server" for server components

import { ... } from "...";

interface ComponentProps {
  // Props definition
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Event handlers
  const handleClick = () => { ... };
  
  // 3. Effects
  useEffect(() => { ... }, []);
  
  // 4. Render
  return (
    <div>...</div>
  );
}
```

#### 3. Function Documentation

```typescript
/**
 * Function description
 * 
 * @param param1 - Description of param1
 * @param param2 - Description of param2
 * @returns Description of return value
 * 
 * @throws ErrorType - When this error occurs
 * 
 * @example
 * // Usage example
 * const result = myFunction(param1, param2);
 * 
 * @security Security considerations
 */
export async function myFunction(
  param1: string,
  param2: number
): Promise<ResultType> {
  // Implementation
}
```

---

## TypeScript Types

### Core Types (`src/types/index.ts`)

```typescript
/**
 * User Roles
 * Defines access levels in the system
 */
export type UserRole = "customer" | "admin" | "agent" | "chief_admin";

/**
 * User Profile
 * Complete user information
 */
export interface UserProfile {
  id: string;              // UUID from Supabase Auth
  email: string;           // Unique user email
  full_name: string | null;
  phone: string | null;
  role: UserRole;          // Access level
  avatar_url: string | null;
  is_active: boolean;      // Account status
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}

/**
 * Product
 * E-commerce product with multi-currency support
 */
export interface Product {
  id: string;
  name: string;
  slug: string;            // URL-friendly identifier
  description: string | null;
  category: string;
  price: number;           // NGN price
  discount_price: number | null;
  stock_quantity: number;
  sku: string | null;
  images: string[];        // Array of image URLs
  attributes: Record<string, any>;
  is_active: boolean;
  // Multi-currency fields
  currency: string;        // Default: 'NGN'
  usd_price: number | null;
  usd_discount_price: number | null;
  exchange_rate: number;   // NGN to USD rate
  created_at: string;
  updated_at: string;
}

/**
 * Order
 * Customer order with status tracking
 */
export interface Order {
  id: string;
  user_id: string;
  order_number: string;    // Unique identifier (ORD-YYYYMMDD-XXXX)
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total_amount: number;
  status: OrderStatus;     // pending, confirmed, shipped, delivered, cancelled, returned
  payment_status: PaymentStatus;  // pending, completed, failed, refunded
  shipping_address: string | null;
  billing_address: string | null;
  currency: string;        // 'NGN' or 'USD'
  created_at: string;
  updated_at: string;
  deleted_at: string | null;  // Soft delete timestamp
}

/**
 * Cart Item
 * Shopping cart item with product details
 */
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  updated_at: string;
  product?: Product;       // Optional product details
}
```

### Payment Types (`src/types/flutterwave.ts`)

```typescript
/**
 * Flutterwave Transaction Response
 */
export interface FlutterwaveVerificationResponse {
  status: string;          // 'success' | 'failed'
  message: string;
  data: FlutterwaveTransactionData;
}

/**
 * Transaction Data
 */
export interface FlutterwaveTransactionData {
  id: number;
  tx_ref: string;          // Transaction reference
  flutterwave_ref: string; // Flutterwave reference
  amount: number;
  currency: string;
  status: 'successful' | 'failed' | 'pending';
  customer: FlutterwaveCustomer;
  meta: FlutterwaveMetadata;
}
```

---

## Component Documentation

### ProductCard Component

**File:** `src/components/products/ProductCard.tsx`

```typescript
/**
 * ProductCard Component
 * 
 * Displays product information in a card format with:
 * - Product image(s) with video support
 * - Price with multi-currency support
 * - Rating display
 * - Quick add to cart
 * - Wishlist toggle
 * 
 * @param product - Product data to display
 * @param showQuickAdd - Whether to show quick add button
 * @param viewMode - 'vertical' or 'horizontal' layout
 * 
 * @example
 * <ProductCard 
 *   product={product} 
 *   showQuickAdd={true}
 *   viewMode="vertical"
 * />
 */
export default function ProductCard({
  product,
  showQuickAdd = true,
  viewMode = "vertical",
}: ProductCardProps) {
  // Implementation
}
```

### CurrencyToggle Component

**File:** `src/components/CurrencyToggle.tsx`

```typescript
/**
 * CurrencyToggle Component
 * 
 * Allows users to switch between NGN and USD currencies.
 * Persists preference in localStorage.
 * 
 * @example
 * <CurrencyToggle />
 * 
 * @hooks useCurrency - Currency context
 */
export default function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency();
  
  return (
    <button onClick={toggleCurrency}>
      {currency}
    </button>
  );
}
```

---

## Context Providers

### CurrencyContext

**File:** `src/context/CurrencyContext.tsx`

```typescript
/**
 * CurrencyContext
 * 
 * Provides global currency state management:
 * - Auto-detect user's currency (NGN/USD)
 * - Manual currency switching
 * - Price formatting
 * - LocalStorage persistence
 * 
 * @provider CurrencyProvider
 * @hook useCurrency
 * 
 * @example
 * // Wrap app with provider
 * <CurrencyProvider>
 *   <App />
 * </CurrencyProvider>
 * 
 * // Use in components
 * const { currency, formatPrice, toggleCurrency } = useCurrency();
 */

interface CurrencyContextType {
  currency: CurrencyCode;           // Current currency
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (ngnPrice: number, usdPrice?: number, rate?: number) => string;
  getPrice: (ngnPrice: number, usdPrice?: number, rate?: number) => number;
  toggleCurrency: () => void;
}
```

### CartContext

**File:** `src/context/CartContext.tsx`

```typescript
/**
 * CartContext
 * 
 * Manages shopping cart state with Supabase synchronization:
 * - Real-time cart updates
 * - Cross-device sync
 * - Quantity management
 * - Cart clearing
 * 
 * @provider CartProvider
 * @hook useCart
 */

interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, delta: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}
```

---

## API Routes

### Flutterwave Verify

**File:** `src/app/api/flutterwave/verify/route.ts`

```typescript
/**
 * POST /api/flutterwave/verify
 * 
 * Server-side verification of Flutterwave transactions.
 * Keeps secret key secure and provides type-safe verification.
 * 
 * @request {
 *   tx_ref: string,      // Transaction reference
 *   order_id: string     // Order ID to update
 * }
 * 
 * @response {
 *   success: boolean,
 *   message: string,
 *   transaction?: FlutterwaveTransactionData,
 *   orderUpdated?: boolean
 * }
 * 
 * @security Requires FLUTTERWAVE_SECRET_KEY environment variable
 * 
 * @example
 * const response = await fetch('/api/flutterwave/verify', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ tx_ref, order_id })
 * });
 */
export async function POST(req: NextRequest) {
  // Implementation
}
```

---

## Database Functions

### Supabase Services

**File:** `src/utils/supabase/services.ts`

```typescript
/**
 * Get Products
 * 
 * Fetches products with filtering, sorting, and pagination.
 * 
 * @param filters - Query filters
 * @param filters.category - Filter by category
 * @param filters.search - Search in name/description
 * @param filters.limit - Number of results (default: 50)
 * @param filters.offset - Pagination offset
 * @param filters.is_active - Filter by active status
 * 
 * @returns Array of Product objects
 * 
 * @example
 * const products = await getProducts({
 *   category: 'Skincare',
 *   limit: 12,
 *   is_active: true
 * });
 */
export async function getProducts(
  filters?: ProductFilters
): Promise<Product[]> {
  const supabase = createClient();
  // Implementation
}

/**
 * Create Order
 * 
 * Creates a new order with items.
 * 
 * @param orderData - Order information
 * @param orderData.user_id - Customer ID
 * @param orderData.items - Order items array
 * @param orderData.shipping_address - Delivery address
 * 
 * @returns Created order with ID
 * 
 * @security Requires authenticated user
 */
export async function createOrder(
  orderData: CreateOrderInput
): Promise<Order> {
  // Implementation
}
```

---

## Utilities

### Currency Utilities

**File:** `src/utils/currency.ts`

```typescript
/**
 * Detect User Currency
 * 
 * Auto-detects user's preferred currency based on:
 * 1. Timezone (Africa/Lagos → NGN)
 * 2. Browser language (en-NG → NGN)
 * 3. Default to NGN
 * 
 * @returns Detected currency code ('NGN' or 'USD')
 * 
 * @example
 * const currency = detectUserCurrency();  // 'NGN' or 'USD'
 */
export function detectUserCurrency(): CurrencyCode {
  // Implementation
}

/**
 * Format Currency
 * 
 * Formats amount with currency symbol and locale.
 * 
 * @param amount - Amount to format
 * @param currency - Currency code ('NGN' or 'USD')
 * @returns Formatted string (e.g., '₦15,000.00' or '$10.00')
 * 
 * @example
 * formatCurrency(15000, 'NGN');  // '₦15,000.00'
 * formatCurrency(10, 'USD');     // '$10.00'
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode
): string {
  // Implementation
}
```

### Error Tracking

**File:** `src/utils/error-tracking.ts`

```typescript
/**
 * Track Error
 * 
 * Tracks errors with automatic categorization:
 * - Security errors (auth, XSS, CSRF)
 * - Functional errors (API, database)
 * - Non-functional errors (performance, UI)
 * 
 * @param error - Error object or unknown
 * @param context - Additional context
 * 
 * @example
 * try {
 *   // Risky operation
 * } catch (error) {
 *   await trackError(error, {
 *     componentName: 'Checkout',
 *     userId: user?.id
 *   });
 * }
 */
export async function trackError(
  error: Error | unknown,
  context?: Partial<ErrorContext>
): Promise<void> {
  // Implementation
}
```

---

## Error Handling

### Error Boundaries

```typescript
/**
 * Global Error Boundary
 * 
 * Catches unhandled errors in the application.
 * Displays user-friendly error message.
 * Logs error for debugging.
 * 
 * @file src/app/global-error.tsx
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error caught:', error);
    // Log to error tracking service
  }, [error]);

  return (
    <html>
      <body>
        {/* Error UI */}
      </body>
    </html>
  );
}
```

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
}
```

---

## Best Practices

### 1. Component Design

✅ **DO:**
- Keep components small and focused (Single Responsibility)
- Use TypeScript interfaces for props
- Add JSDoc comments
- Handle loading and error states
- Make components reusable

❌ **DON'T:**
- Create large components (>200 lines)
- Use `any` type
- Skip prop validation
- Forget error handling
- Hard-code values

### 2. State Management

✅ **DO:**
- Use Context for global state
- Use local state for component-specific data
- Minimize re-renders with useMemo/useCallback
- Persist important data

❌ **DON'T:**
- Overuse Context
- Store derived state
- Forget cleanup in useEffect
- Mutate state directly

### 3. API Calls

✅ **DO:**
- Use server actions for mutations
- Validate input server-side
- Handle errors gracefully
- Add loading states
- Use TypeScript types

❌ **DON'T:**
- Expose secret keys client-side
- Skip validation
- Ignore error handling
- Make unnecessary calls

### 4. Security

✅ **DO:**
- Use RLS policies
- Validate all input
- Sanitize user content
- Use environment variables
- Implement rate limiting

❌ **DON'T:**
- Trust client-side validation
- Commit secrets
- Skip authentication checks
- Log sensitive data

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-15 | Initial documentation |

---

**Last Updated:** 2026-03-15  
**Maintained By:** Oluwaseye Ayooluwa Philip (Engr Depaytez)
**Email:** depaytez@gmail.com
