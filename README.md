# JRADIANCE E-Commerce Platform

## 🏪 Professional E-Commerce Solution

<div align="center">

![JRADIANCE](https://img.shields.io/badge/JRADIANCE-E--Commerce-gold?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.5.10-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Flutterwave](https://img.shields.io/badge/Payment-Flutterwave-FFCC00?style=for-the-badge&logo=flutterwave)

**Premium Cosmetics & Skincare E-Commerce Platform**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

JRADIANCE is a modern, full-stack e-commerce platform built for premium cosmetics and skincare products. Designed with scalability, security, and user experience in mind, it provides a complete solution for online retail operations.

### Key Highlights

- 🌍 **Multi-Currency Support** - NGN (Nigeria) and USD (International)
- 💳 **Secure Payments** - Flutterwave integration with server-side verification
- 📱 **Fully Responsive** - Mobile-first design for all devices
- 🔐 **Enterprise Security** - RLS policies, audit logging, role-based access
- 📊 **Admin Dashboard** - Complete order, product, and user management
- 🎨 **Modern UI/UX** - Beautiful, intuitive interface with Tailwind CSS

---

## ✨ Features

### Customer Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Product Browsing** | Browse products with filters, search, and sorting | ✅ Complete |
| **Product Details** | Rich product pages with images, videos, descriptions | ✅ Complete |
| **Shopping Cart** | Real-time cart management with sync | ✅ Complete |
| **Wishlist** | Save favorite products for later | ✅ Complete |
| **Checkout** | Secure checkout with Flutterwave payment | ✅ Complete |
| **Order Tracking** | Real-time order status tracking | ✅ Complete |
| **Order History** | View all past orders and status | ✅ Complete |
| **Multi-Currency** | Switch between NGN and USD | ✅ Complete |
| **Product Reviews** | Rate and review products | ⏳ Planned |
| **Recommendations** | "You May Also Like" suggestions | ✅ Complete |
| **Report Issues** | Submit bugs, complaints, feedback | ✅ Complete |
| **Contact Support** | Contact form with email integration | ✅ Complete |
| **Password Reset** | Secure password recovery | ✅ Complete |

### Admin Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Dashboard** | Sales stats, recent orders, analytics | ✅ Complete |
| **Product Management** | CRUD operations, multi-currency pricing | ✅ Complete |
| **Order Management** | View, update status, cancel, refund | ✅ Complete |
| **User Management** | View, promote, demote, delete users | ✅ Complete |
| **Agent Management** | Manage admin staff and permissions | ✅ Complete |
| **Role Management** | Create and manage user roles | ✅ Complete |
| **Issues Log** | View and resolve customer issues | ✅ Complete |
| **Audit Log** | Track all admin actions | ✅ Complete |
| **Sales Log** | Revenue tracking and reports | ✅ Complete |
| **Analytics** | Sales trends and performance metrics | ✅ Complete |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.10 | React framework with App Router |
| **TypeScript** | 5.0 | Type-safe JavaScript |
| **Tailwind CSS** | 4.0 | Utility-first CSS framework |
| **Lucide Icons** | 0.562.0 | Beautiful icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.93.3 | PostgreSQL database + Auth + Storage |
| **Next.js API Routes** | - | Server-side logic |
| **Server Actions** | - | Form handling and mutations |

### Payment & Analytics

| Service | Purpose |
|---------|---------|
| **Flutterwave** | Payment processing (NGN/USD) |
| **Vercel Analytics** | Performance monitoring |
| **Vercel Speed Insights** | Real-user performance metrics |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Git** | Version control |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Flutterwave account (for payments)
- Vercel account (for deployment)

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/jradianceco-dev/ecommerce.git
cd ecommerce

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Configure environment variables (see Configuration section)

# 5. Run database migrations
# Run SUPABASE_SCHEMA_V4.sql in Supabase SQL Editor

# 6. Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
# Run SUPABASE_SCHEMA_V4.sql in Supabase SQL Editor
# Run SUPABASE_WIPE_DATA.sql to clear all data (development only)
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# =============================================
# JRADIANCE E-Commerce Environment Variables
# =============================================

# SUPABASE CONFIGURATION
# Get from: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# FLUTTERWAVE PAYMENT GATEWAY
# Get from: https://dashboard.flutterwave.com
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key_here
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key_here
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key_here
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret_here

# WEBSITE URLs
NEXT_PUBLIC_BASE_URL=https://jradianceco.com
NEXT_PUBLIC_SITE_URL=https://jradianceco.com

# ENVIRONMENT
NODE_ENV=development
```

### Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Run Schema Migration**
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `SUPABASE_SCHEMA_V4.sql`
   - Run the script
   - Verify tables are created

3. **Configure Storage**
   - Create buckets: `product-images`, `avatars`
   - Set policies as defined in schema

4. **Create Admin User**
   - Create user in Authentication
   - Run SQL to set role to `chief_admin`
   - Create admin_staff record

---

## 📖 Usage

### Customer Journey

1. **Browse Products**
   ```
   Home → Shop → Filter/Search → Product Details
   ```

2. **Make Purchase**
   ```
   Add to Cart → Checkout → Payment → Order Confirmation
   ```

3. **Track Order**
   ```
   Order History → Select Order → Track Status
   ```

### Admin Operations

1. **Product Management**
   ```
   Admin → Catalog → Add/Edit Product → Set Prices (NGN/USD) → Save
   ```

2. **Order Management**
   ```
   Admin → Orders → Select Order → Update Status → Save
   ```

3. **User Management**
   ```
   Admin → Users → Select User → Promote/Demote → Confirm
   ```

---

## 📁 Project Structure

```
ecommerce/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (users)/              # Customer-facing pages
│   │   │   ├── shop/
│   │   │   │   ├── page.tsx      # Shop page
│   │   │   │   ├── products/[slug]/  # Product details
│   │   │   │   ├── checkout/     # Checkout flow
│   │   │   │   ├── track-order/  # Order tracking
│   │   │   │   ├── history/      # Order history
│   │   │   │   ├── wishlist/     # Wishlist
│   │   │   │   ├── report-issue/ # Report issues
│   │   │   │   └── contact/      # Contact form
│   │   │   ├── auth/             # Authentication
│   │   │   └── about-us/         # About page
│   │   ├── admin/                # Admin panel
│   │   │   ├── dashboard/        # Admin dashboard
│   │   │   ├── catalog/          # Product management
│   │   │   ├── orders/           # Order management
│   │   │   ├── users/            # User management
│   │   │   ├── agents/           # Agent management
│   │   │   ├── roles/            # Role management
│   │   │   ├── issues/           # Issues log
│   │   │   ├── audit-log/        # Audit trail
│   │   │   └── sales-log/        # Sales reports
│   │   ├── api/                  # API routes
│   │   │   ├── flutterwave/      # Payment verification
│   │   │   └── admin/            # Admin APIs
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── products/             # Product components
│   │   ├── checkout/             # Checkout components
│   │   └── ...                   # Other components
│   ├── context/                  # React Context providers
│   │   ├── UserContext.tsx       # User authentication
│   │   ├── CartContext.tsx       # Shopping cart
│   │   ├── WishlistContext.tsx   # Wishlist
│   │   ├── ToastContext.tsx      # Toast notifications
│   │   └── CurrencyContext.tsx   # Multi-currency
│   ├── utils/                    # Utility functions
│   │   ├── supabase/             # Supabase clients
│   │   ├── currency.ts           # Currency utilities
│   │   ├── error-tracking.ts     # Error tracking
│   │   └── seo/                  # SEO utilities
│   └── types/                    # TypeScript types
│       ├── index.ts              # Main types
│       ├── flutterwave.ts        # Payment types
│       └── ...
├── public/                       # Static assets
├── SUPABASE_SCHEMA_V4.sql        # Database schema
├── SUPABASE_WIPE_DATA.sql        # Data wipe script
├── .env.example                  # Environment template
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## 🔒 Security

### Authentication & Authorization

- **Supabase Auth** - Secure user authentication
- **Role-Based Access Control (RBAC)** - customer, agent, admin, chief_admin
- **Row Level Security (RLS)** - Database-level access control
- **Server-Side Verification** - All sensitive operations verified server-side

### Payment Security

- **Server-Side Verification** - All payments verified via API
- **Webhook Signatures** - Webhook authenticity verified
- **No Card Storage** - Payment details never stored
- **PCI Compliance** - Flutterwave handles PCI compliance

### Data Protection

- **HTTPS Only** - All traffic encrypted
- **Environment Variables** - Secrets never committed
- **Input Sanitization** - All user input sanitized
- **SQL Injection Prevention** - Parameterized queries

---

## 📊 Database Schema

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profiles | id, email, role, is_active |
| `admin_staff` | Admin staff | id, profile_id, position, permissions |
| `products` | Product catalog | id, name, price, usd_price, stock_quantity |
| `cart_items` | Shopping cart | id, user_id, product_id, quantity |
| `wishlist` | Wishlist | id, user_id, product_id |
| `orders` | Orders | id, order_number, status, payment_status, currency |
| `order_items` | Order line items | id, order_id, product_id, quantity |
| `issues` | Customer issues | id, type, status, priority |
| `admin_activity_logs` | Audit trail | id, admin_id, action, changes |
| `sales_analytics` | Sales reports | id, period, revenue, orders |

### Relationships

```
profiles (1) ──→ (M) cart_items
profiles (1) ──→ (M) wishlist
profiles (1) ──→ (M) orders
products (1) ──→ (M) cart_items
products (1) ──→ (M) wishlist
products (1) ──→ (M) order_items
orders (1) ──→ (M) order_items
admin_staff (1) ──→ (M) admin_activity_logs
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Add to cart and checkout
- [ ] Payment processing (test mode)
- [ ] Order tracking
- [ ] Admin product management
- [ ] Admin order management
- [ ] Multi-currency toggle
- [ ] Password reset flow

### Automated Testing (Planned)

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

---

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: ready for production"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import GitHub repository
   - Configure environment variables
   - Deploy

3. **Post-Deployment**
   - Update Flutterwave webhook URL
   - Test payment flow in production
   - Monitor analytics

### Environment-Specific Configuration

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Development** | http://localhost:3000 | Local development |
| **Staging** | https://staging.jradianceco.com | Pre-production testing |
| **Production** | https://jradianceco.com | Live production |

---

## 📚 Documentation

| Document | Description | Location |
|----------|-------------|----------|
| **README.md** | Project overview | Root |
| **CODE_DOCUMENTATION.md** | Code-level documentation | Root |
| **PRODUCT_REQUIREMENTS.md** | Product requirements & features | Root |
| **FEATURE_AUDIT.md** | Feature completion status | Root |
| **IMPLEMENTATION_STATUS.md** | Implementation progress | Root |
| **SUPABASE_SCHEMA_V4.sql** | Database schema with comments | Root |

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/feature-name
   ```
3. **Make changes and test**
4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new feature"
   ```
5. **Push and create PR**
   ```bash
   git push origin feature/feature-name
   ```

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

---

## 📄 License

Copyright © 2026 JRADIANCE. All rights reserved.

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 💬 Support

### Contact Information

| Channel | Contact |
|---------|---------|
| **Email** | info@jradianceco.com |
| **Website** | https://jradianceco.com |
| **Support** | https://jradianceco.com/shop/contact |

### Business Hours

- **Monday - Friday:** 9:00 AM - 6:00 PM WAT
- **Saturday:** 10:00 AM - 4:00 PM WAT
- **Sunday:** Closed

### Response Time

- **Email:** 24-48 hours
- **Critical Issues:** Immediate
- **Feature Requests:** 1 week

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Supabase Team** - Excellent backend-as-a-service
- **Flutterwave Team** - Seamless payment integration
- **Vercel Team** - Perfect deployment platform
- **Tailwind CSS Team** - Beautiful utility framework

---

<div align="center">

**Built with ❤️ for the radiant Nigerian soul**

[JRadiance](https://jradianceco.com) © 2026

</div>
