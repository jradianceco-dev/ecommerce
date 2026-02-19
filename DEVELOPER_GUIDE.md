# JRADIANCE E-Commerce Platform - Developer Documentation

**Version:** 2.0.0  
**Last Updated:** February 19, 2026  
**Author:** Engr Depaytez  (depaytez@gmail.com/+2348107382655)
**Client:** JRADIANCE Organic Cosmetics & Skincare  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [User Journey Maps](#user-journey-maps)
4. [Architecture Overview](#architecture-overview)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [File Structure](#file-structure)
8. [Development Guidelines](#development-guidelines)
9. [Deployment Guide](#deployment-guide)
10. [Maintenance & Support](#maintenance--support)

---

## 🎯 Project Overview

### What is JRADIANCE?

JRADIANCE is a full-featured e-commerce and CRM platform for premium organic cosmetics and skincare products, designed specifically for the Nigerian market with global reach.

### Key Features

- ✅ **Customer Shopping Experience**
  - Product browsing with advanced filtering
  - Shopping cart and wishlist
  - Secure checkout with Paystack integration
  - Order tracking and history

- ✅ **Admin Management System**
  - Role-based access control (4 levels)
  - Product catalog management (CRUD)
  - Order management and fulfillment
  - User management and permissions
  - Sales analytics and reporting
  - Audit trail for accountability

- ✅ **SEO Optimization**
  - Dynamic metadata generation
  - Sitemap and robots.txt
  - Structured data (JSON-LD)
  - OpenGraph and Twitter Cards
  - Fast page load with Next.js SSR/SSG

### Business Goals

1. **Increase Sales**: Streamlined checkout process with multiple payment options
2. **Customer Retention**: Order history, wishlist, and personalized experience
3. **Operational Efficiency**: Comprehensive admin panel for inventory and order management
4. **Brand Visibility**: SEO-optimized for search engines
5. **Scalability**: Built on modern stack for future growth

---

## 🛠 Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.10 | React framework with SSR/SSG |
| **React** | 19.1.0 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Lucide React** | 0.562.0 | Icon library |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.x | PostgreSQL database + Auth + Storage |
| **Supabase SSR** | 0.8.0 | Server-side rendering integration |

### Payment & Storage
| Technology | Purpose |
|------------|---------|
| **Paystack** | Payment gateway (Nigeria-focused) |
| **Namecheap FTP** | Image and video storage |

### Deployment & Hosting
| Technology | Purpose |
|------------|---------|
| **Vercel** | Frontend deployment and CDN |
| **Namecheap** | Domain and file storage |
| **Supabase** | Database hosting (EU/US) |

---

## 👥 User Journey Maps

### User Type 1: Customer (Shopper)

#### Persona: "Beauty Enthusiast Ngozi"
- **Age**: 28
- **Location**: Lagos, Nigeria
- **Goal**: Buy authentic skincare products
- **Tech Savvy**: Moderate

#### Journey Stages

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DISCOVER   │ ──> │    BROWSE   │ ──> │  SELECT     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  - Google search     - View products     - Add to cart
  - Social media      - Filter by category - Add to wishlist
  - Direct URL        - Search products   - View details
```

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  CHECKOUT   │ ──> │    PAY      │ ──> │  TRACK      │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  - Fill delivery     - Paystack popup    - View order history
  - Review order      - Card payment      - Track status
  - Confirm           - Payment success   - Delivery updates
```

#### Detailed Flow

**1. Discovery**
- Lands on homepage via Google/social media
- Sees featured products and promotions
- Clear navigation to shop categories

**2. Browsing**
- Uses search bar or category filters
- Views product grid with images and prices
- Sorts by price, newest, or rating

**3. Product Selection**
- Clicks product to view details
- Reads description and reviews
- Checks availability and price
- Adds to cart or wishlist

**4. Checkout**
- Opens cart overlay
- Reviews items and quantities
- Clicks "Proceed to Checkout"
- Fills delivery information form
- Confirms order total

**5. Payment**
- Paystack payment modal opens
- Enters card details
- Completes 3D Secure verification
- Receives confirmation

**6. Post-Purchase**
- Redirected to order history
- Can track order status
- Receives email confirmation
- Can re-order from history

#### Pages Used
- `/` - Homepage
- `/shop` - Product listing
- `/products/[slug]` - Product detail
- `/shop/checkout` - Checkout page
- `/shop/history` - Order history
- `/shop/wishlist` - Wishlist
- `/shop/auth` - Login/Register

---

### User Type 2: Agent (Support Staff)

#### Persona: "Customer Support Chinedu"
- **Age**: 25
- **Role**: Support Agent
- **Goal**: Help customers, manage orders
- **Access Level**: Limited admin

#### Journey Stages

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    LOGIN    │ ──> │  DASHBOARD  │ ──> │  MANAGE     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  - Admin portal      - View stats      - Product catalog
  - Email/password    - Quick actions   - Order manager
  - Role verification - Navigate menu   - Update status
```

#### Detailed Flow

**1. Login**
- Visits `/admin/login`
- Enters admin credentials
- System verifies agent role
- Redirected to dashboard

**2. Dashboard**
- Sees overview statistics
- Quick access to common tasks
- Recent activity feed

**3. Product Management**
- Navigates to Products Catalog
- Can add new products
- Can edit existing products
- Can toggle product status
- **Cannot** delete products (admin only)

**4. Order Management**
- Navigates to Orders Manager
- Views all customer orders
- Can update order status:
  - pending → confirmed → shipped → delivered
- Views customer details
- Tracks payment status

**5. Limitations**
- **Cannot** access Users Manager
- **Cannot** access Audit Logs
- **Cannot** access Sales Reports
- **Cannot** manage other admins

#### Pages Used
- `/admin/login` - Admin login
- `/admin/dashboard` - Dashboard
- `/admin/catalog` - Product management
- `/admin/orders` - Order management

#### Permissions Matrix
| Feature | Agent Access |
|---------|--------------|
| Manage Products | ✅ Yes |
| Manage Orders | ✅ Yes |
| View Sales Logs | ❌ No |
| View Audit Logs | ❌ No |
| Manage Users | ❌ No |
| Manage Agents | ❌ No |

---

### User Type 3: Admin (Manager)

#### Persona: "Operations Manager Adaora"
- **Age**: 32
- **Role**: Administrator
- **Goal**: Oversee operations, manage team
- **Access Level**: Full except user management

#### Journey Stages

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    LOGIN    │ ──> │  DASHBOARD  │ ──> │  OVERSEE    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  - Admin portal      - Full stats      - All agent features
  - 2FA recommended   - Team activity   - Sales analytics
  - Role verification - Audit trail     - Reports
```

#### Detailed Flow

**1. Login & Dashboard**
- Same as agent login
- Sees comprehensive dashboard
- Full statistics and analytics
- Team activity overview

**2. Product Management**
- All agent capabilities PLUS:
- Can delete products
- Can manage inventory levels
- Can set discount prices

**3. Order Management**
- All agent capabilities PLUS:
- Can handle refunds/returns
- Can override order status
- Can add order notes

**4. Sales Analytics**
- Navigates to Sales Log
- Views revenue reports
- Filters by time period (day/week/month/all)
- Sees order completion rates
- Downloads reports (future feature)

**5. Audit Trail**
- Navigates to Audit Log
- Views all admin activities
- Tracks who did what and when
- Investigates issues
- Ensures accountability

**6. Team Management**
- Can view agents' activities
- **Cannot** promote/demote users (chief admin only)
- Can report issues to chief admin

#### Pages Used
- All agent pages PLUS:
- `/admin/sales-log` - Sales analytics
- `/admin/audit-log` - Activity logs

#### Permissions Matrix
| Feature | Admin Access |
|---------|--------------|
| Manage Products | ✅ Yes (full) |
| Manage Orders | ✅ Yes (full) |
| View Sales Logs | ✅ Yes |
| View Audit Logs | ✅ Yes |
| Manage Users | ❌ No |
| Manage Agents | ❌ No |

---

### User Type 4: Chief Admin (Owner/Super Admin)

#### Persona: "Owner Philip Depaytez"
- **Age**: 35
- **Role**: Chief Administrator
- **Goal**: Full control, business growth
- **Access Level**: Complete system access

#### Journey Stages

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    LOGIN    │ ──> │  DASHBOARD  │ ──> │  CONTROL    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  - Master access     - Business intel  - User management
  - Secure auth       - All metrics     - Role assignment
  - Audit trail       - Growth tracking - System settings
```

#### Detailed Flow

**1. Login & Dashboard**
- Premium dashboard experience
- Complete business overview
- All metrics and KPIs
- Recent activities across all modules

**2. User Management**
- Navigates to Users Manager
- Views all registered users
- **Promote users**: customer → agent → admin
- **Demote users**: admin/agent → customer
- **Delete users**: Remove problematic accounts
- **Toggle status**: Activate/deactivate accounts
- Maintains audit trail of all changes

**3. Agents Management**
- Dedicated agents view
- Promote agents to admin
- Demote admins to agent
- Monitor agent performance
- Assign roles and responsibilities

**4. Permission Roles**
- Views permission matrix
- Understands role hierarchy
- Makes informed promotion decisions
- Ensures proper access control

**5. Full Admin Capabilities**
- All admin features PLUS:
- Delete products permanently
- Manage admin staff records
- Override any system setting
- Access all audit logs

**6. Business Intelligence**
- Sales analytics with full filters
- User growth tracking
- Product performance metrics
- Order fulfillment rates
- Customer retention data

#### Pages Used
- All admin pages PLUS:
- `/admin/users` - User management
- `/admin/agents` - Agents management
- `/admin/roles` - Permission matrix

#### Permissions Matrix
| Feature | Chief Admin Access |
|---------|-------------------|
| Manage Products | ✅ Yes (full + delete) |
| Manage Orders | ✅ Yes (full) |
| View Sales Logs | ✅ Yes |
| View Audit Logs | ✅ Yes |
| Manage Users | ✅ Yes (promote/demote/delete) |
| Manage Agents | ✅ Yes |
| System Settings | ✅ Yes |

---

## 🏗 Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Customer │  │   Admin  │  │   SEO    │              │
│  │   Pages  │  │   Pages  │  │  Pages   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 NEXT.JS APPLICATION                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Server  │  │  Client  │  │   API    │              │
│  │  Actions │  │ Components│  │  Routes  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Supabase │  │ Paystack │  │ Namecheap│              │
│  │ Database │  │ Payment  │  │   FTP    │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

**Customer Purchase Flow:**
```
Customer → Browse Products → Add to Cart → Checkout → 
Paystack → Payment Verified → Order Created → 
Email Confirmation → Order History
```

**Admin Order Management Flow:**
```
Admin Login → View Orders → Update Status → 
Log Action → Notify Customer → Track Delivery
```

---

## 🗄 Database Schema

### Core Tables

#### 1. `profiles` - User Management
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  role user_role DEFAULT 'customer',
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**User Roles:**
- `customer` - Regular shopper
- `agent` - Support staff (limited admin)
- `admin` - Manager (full admin except users)
- `chief_admin` - Owner (complete access)

#### 2. `products` - Product Catalog
```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  category text NOT NULL,
  price decimal(10, 2) NOT NULL,
  discount_price decimal(10, 2),
  stock_quantity integer DEFAULT 0,
  sku text UNIQUE,
  images jsonb DEFAULT '[]',
  attributes jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES admin_staff(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 3. `orders` - Customer Orders
```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  order_number text UNIQUE NOT NULL,
  subtotal decimal(10, 2) NOT NULL,
  tax decimal(10, 2) DEFAULT 0,
  shipping_cost decimal(10, 2) DEFAULT 0,
  total_amount decimal(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  shipping_address text,
  created_at timestamptz DEFAULT now()
);
```

**Order Status Flow:**
```
pending → confirmed → shipped → delivered
                ↓
           cancelled
```

#### 4. `cart_items` - Shopping Cart
```sql
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);
```

#### 5. `admin_activity_logs` - Audit Trail
```sql
CREATE TABLE admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admin_staff(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Logged Actions:**
- `user_promoted` - User role changed
- `user_demoted` - User role removed
- `product_created` - New product added
- `order_status_updated` - Order status changed
- `dashboard_access` - Admin login

---

## 📁 File Structure

```
ecommerce/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (users)/                  # Customer-facing pages
│   │   │   ├── shop/
│   │   │   │   ├── checkout/         # Checkout page
│   │   │   │   ├── history/          # Order history
│   │   │   │   └── page.tsx          # Shop listing
│   │   │   └── products/[slug]/      # Product detail (SEO)
│   │   ├── admin/                    # Admin portal
│   │   │   ├── dashboard/            # Admin dashboard
│   │   │   ├── catalog/              # Product management
│   │   │   ├── orders/               # Order management
│   │   │   ├── users/                # User management (Chief Admin)
│   │   │   ├── agents/               # Agents management (Chief Admin)
│   │   │   ├── roles/                # Permission matrix (Chief Admin)
│   │   │   ├── sales-log/            # Sales analytics (Admin+)
│   │   │   ├── audit-log/            # Audit trail (Admin+)
│   │   │   ├── issues/               # Bug tracking (Admin+)
│   │   │   └── action.ts             # Admin server actions
│   │   ├── layout.tsx                # Root layout
│   │   ├── sitemap.ts                # Dynamic sitemap
│   │   └── robots.ts                 # Robots.txt
│   ├── components/                   # React components
│   │   ├── products/                 # Product components
│   │   ├── seo/                      # SEO components (JSON-LD)
│   │   └── CartOverlay.tsx           # Shopping cart
│   ├── utils/                        # Utilities
│   │   ├── supabase/                 # Supabase client
│   │   └── seo/                      # SEO utilities
│   └── types/                        # TypeScript types
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── next.config.ts                    # Next.js configuration
└── package.json                      # Dependencies
```

---

## 🔌 API Reference

### Server Actions (Admin)

All admin actions are in `src/app/admin/action.ts`.

#### Authentication
```typescript
// Login admin user
async function login(prevState, formData): Promise<AuthState>
```

#### User Management (Chief Admin Only)
```typescript
async function getAllUsers()
async function promoteUser(userId, newRole): Promise<AdminActionResult>
async function demoteUser(userId): Promise<AdminActionResult>
async function deleteUser(userId): Promise<AdminActionResult>
async function toggleUserStatus(userId): Promise<AdminActionResult>
async function getAllAgents()
```

#### Product Management (Agent+ Access)
```typescript
async function createProduct(productData): Promise<AdminActionResult>
async function updateProduct(productId, updates): Promise<AdminActionResult>
async function deleteProduct(productId): Promise<AdminActionResult>
async function toggleProductStatus(productId): Promise<AdminActionResult>
```

#### Order Management (Agent+ Access)
```typescript
async function getAllOrders()
async function updateOrderStatus(orderId, status): Promise<AdminActionResult>
```

#### Analytics (Admin+ Access)
```typescript
async function getSalesStats(period): Promise<SalesStats>
async function getActivityLogs(limit): Promise<ActivityLog[]>
async function getSystemIssues()
```

#### Permission Checks
```typescript
async function checkPermission(requiredRole): Promise<boolean>
async function getAdminPermissions(): Promise<Permissions>
```

---

## 📝 Development Guidelines

### Coding Standards

#### 1. TypeScript Best Practices
```typescript
// ✅ DO: Use explicit types
interface Product {
  id: string;
  name: string;
  price: number;
}

// ❌ DON'T: Use 'any'
const product: any = {}; // Bad!
```

#### 2. Server Actions Pattern
```typescript
/**
 * Clear JSDoc comment with description
 * 
 * @param param - Description of parameter
 * @returns Description of return value
 * 
 * @security Chief Admin only
 * @audit Logs action to admin_activity_logs
 */
export async function myAction(param: string): Promise<ActionResult> {
  // Implementation
}
```

#### 3. Error Handling
```typescript
try {
  // Operation
} catch (error) {
  console.error("Descriptive error message:", error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : "User-friendly message"
  };
}
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/product-search

# Commit with clear message
git commit -m "feat: add product search functionality"

# Push and create PR
git push origin feature/product-search
```

### Commit Message Format
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 🚀 Deployment Guide

### Pre-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations run in Supabase
- [ ] First chief admin created
- [ ] Paystack keys configured (live mode)
- [ ] Namecheap FTP credentials added
- [ ] Domain connected to Vercel
- [ ] SSL certificate active

### Vercel Deployment

1. **Connect GitHub Repository**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com/new
   - Select repository
   - Configure project

3. **Add Environment Variables**
   - Copy from `.env.local`
   - Add to Vercel dashboard

4. **Deploy**
   - Click "Deploy"
   - Wait for build
   - Test live site

### Post-Deployment Tests

1. **Homepage**: Load test
2. **Product Pages**: SEO check
3. **Checkout**: Payment test (₦1)
4. **Admin Login**: Access control
5. **Mobile**: Responsive test
6. **Performance**: Lighthouse score

---

## 🛠 Maintenance & Support

### Regular Maintenance

**Daily:**
- Monitor order notifications
- Check admin activity logs
- Respond to customer issues

**Weekly:**
- Update product inventory
- Review sales reports
- Backup database (automatic with Supabase)

**Monthly:**
- Security updates
- Performance optimization
- Content updates

### Monitoring

**Tools:**
- Vercel Analytics - Performance
- Supabase Logs - Database
- Paystack Dashboard - Payments

**Alerts:**
- Failed payments
- Low stock products
- System errors

### Support Contacts

| Issue | Contact |
|-------|---------|
| Technical Issues | Philip Depaytez (Developer) |
| Payment Issues | Paystack Support |
| Database Issues | Supabase Support |
| Hosting Issues | Vercel Support |

---

## 📞 Client Handover Notes

### For Business Owner

**You Have Access To:**
1. **Chief Admin Dashboard** - Full control
2. **Paystack Dashboard** - Payment reports
3. **Supabase Dashboard** - Database (read-only recommended)
4. **Vercel Dashboard** - Deployment status
5. **Namecheap Dashboard** - Domain & storage

**Recommended Actions:**
1. Change all passwords after handover
2. Enable 2FA on all accounts
3. Regular backup exports (monthly)
4. Monitor sales reports weekly

**Training Provided:**
- ✅ Admin panel usage
- ✅ Product management
- ✅ Order fulfillment
- ✅ User management
- ✅ Sales reporting

---

## 📊 Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Current |
|--------|--------|---------|
| Page Load Time | < 2.5s | ~1.8s |
| Conversion Rate | > 2% | TBD |
| Cart Abandonment | < 70% | TBD |
| Customer Retention | > 30% | TBD |
| Mobile Traffic | > 60% | TBD |

### Analytics Setup

**Google Analytics:**
- Add tracking code to `layout.tsx`
- Configure e-commerce tracking
- Set up conversion goals

**Search Console:**
- Submit sitemap.xml
- Monitor search queries
- Fix crawl errors

---

## 🎓 Training Resources

### For Admins

1. **Product Management**
   - How to add products
   - Image optimization
   - Inventory tracking

2. **Order Fulfillment**
   - Processing orders
   - Status updates
   - Customer communication

3. **User Management**
   - Role assignment
   - Permission levels
   - Security best practices

### For Developers

1. **Codebase Tour**
   - File structure
   - Component hierarchy
   - Data flow

2. **Development Setup**
   - Local environment
   - Database seeding
   - Testing procedures

---

**End of Documentation**

For questions or support, contact: **Engr Depaytez @ +2348107382655/depaytez@gmail.com**
