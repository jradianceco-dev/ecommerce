# JRADIANCE E-Commerce Platform

**Premium Cosmetics & Skincare Online Store**

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Paystack](https://img.shields.io/badge/Paystack-Payment-06A058?logo=paystack)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Environment Setup](#environment-setup)
- [Deployment](#deployment)
- [Support](#support)

---

## 🎯 Overview

JRADIANCE is a modern, full-featured e-commerce platform built for a premium cosmetics and skincare brand targeting the Nigerian market with global reach.

**Built with:**
- ⚡ **Next.js 15** - React framework with SSR/SSG for optimal SEO
- 🔒 **Supabase** - PostgreSQL database with authentication
- 💳 **Paystack** - Secure payment processing
- 🎨 **Tailwind CSS** - Modern, responsive design
- 📱 **Mobile-First** - Optimized for all devices

**Live Site:** https://jradianceco.com

---

## ✨ Features

### Customer Features
- 🛍️ Product browsing with advanced search & filtering
- 🛒 Shopping cart and wishlist
- 💳 Secure checkout with Paystack integration
- 📦 Order tracking and history
- 👤 User authentication and profile management
- ⭐ Product reviews and ratings

### Admin Features
- 🔐 Role-based access control (4 levels)
- 📦 Product catalog management (CRUD operations)
- 📊 Order management and fulfillment
- 👥 User management and permissions
- 📈 Sales analytics and reporting
- 📝 Audit trail for accountability
- 🐛 Issue tracking and bug reports

### SEO & Performance
- 🚀 Dynamic metadata generation
- 🗺️ Automatic sitemap.xml
- 🤖 Robots.txt optimization
- 📊 Structured data (JSON-LD)
- ⚡ Image optimization with Next.js
- 📱 Mobile-responsive design

---

## 👥 User Roles

| Role | Access Level | Description |
|------|--------------|-------------|
| **Customer** | Public | Browse, shop, checkout, track orders |
| **Agent** | Limited Admin | Manage products & orders |
| **Admin** | Full Admin | All agent features + analytics & audit logs |
| **Chief Admin** | Complete Control | All admin features + user management & system settings |

**See:** [`USER_JOURNEY_MAPS.md`](./USER_JOURNEY_MAPS.md) for detailed user journey diagrams.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Paystack account
- Namecheap hosting account

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ecommerce

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
# See Environment Setup section below

# Run development server
npm run dev

# Open http://localhost:3000
```

### First-Time Setup

1. **Create Chief Admin** (Run in Supabase SQL Editor):
```sql
UPDATE profiles 
SET role = 'chief_admin' 
WHERE email = 'your-email@example.com';
```

2. **Configure Namecheap FTP**:
   - Get FTP credentials from Namecheap dashboard
   - Create folder: `storage/products/`
   - Upload test image
   - Test URL: `https://jradianceco.com/storage/products/test.jpg`

3. **Setup Paystack**:
   - Get API keys from Paystack dashboard
   - Add to `.env.local`
   - Test with card: `4111 1111 1111 1111`

---

## 📚 Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md) | Complete technical documentation | Developers |
| [`USER_JOURNEY_MAPS.md`](./USER_JOURNEY_MAPS.md) | User flow diagrams for all roles | All stakeholders |
| [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) | Step-by-step setup instructions | DevOps/Admin |
| [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) | Implementation summary & next steps | Project Manager |
| [`SEO_IMPLEMENTATION.md`](./SEO_IMPLEMENTATION.md) | SEO features documentation | Marketing/SEO Team |
| [`QUICK_SEO_GUIDE.md`](./QUICK_SEO_GUIDE.md) | Quick SEO reference | Marketing/SEO Team |

---

## 📁 Project Structure

```
ecommerce/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (users)/              # Customer pages
│   │   │   ├── shop/             # Shopping pages
│   │   │   └── products/[slug]/  # Product detail (SEO)
│   │   ├── admin/                # Admin portal
│   │   │   ├── dashboard/        # Dashboard
│   │   │   ├── catalog/          # Product management
│   │   │   ├── orders/           # Order management
│   │   │   ├── users/            # User management
│   │   │   └── ...               # Other admin pages
│   │   ├── sitemap.ts            # Dynamic sitemap
│   │   ├── robots.ts             # Robots.txt
│   │   └── layout.tsx            # Root layout
│   ├── components/               # React components
│   ├── utils/                    # Utilities
│   │   ├── supabase/             # Supabase client
│   │   └── seo/                  # SEO utilities
│   └── types/                    # TypeScript types
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── next.config.ts                # Next.js config
└── package.json                  # Dependencies
```

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons

### Backend & Database
- **Supabase** - PostgreSQL + Auth
- **Supabase SSR** - Server-side integration

### Payment & Storage
- **Paystack** - Payment gateway
- **Namecheap FTP** - Image storage

### Deployment
- **Vercel** - Frontend hosting
- **Namecheap** - Domain & file storage
- **Supabase** - Database hosting

---

## 🔐 Environment Setup

### Required Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx

# Website
NEXT_PUBLIC_BASE_URL=https://jradianceco.com

# Namecheap FTP
NAMECHEAP_FTP_HOST=ftp.jradianceco.com
NAMECHEAP_FTP_USER=your-username
NAMECHEAP_FTP_PASSWORD=your-password
```

**See:** [`.env.example`](./.env.example) for template with comments.

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Push to main branch
git push origin main

# Vercel auto-deploys
# Add environment variables in Vercel dashboard
```

### Post-Deployment Checklist

- [ ] Test homepage load
- [ ] Verify product pages SEO
- [ ] Test checkout flow (₦1 payment)
- [ ] Test admin login
- [ ] Check mobile responsiveness
- [ ] Submit sitemap to Google Search Console

---

## 📊 Key Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Page Load Time | < 2.5s | ✅ ~1.8s |
| SEO Score | > 90 | ✅ Optimized |
| Mobile Friendly | 100% | ✅ Responsive |
| Payment Success | > 95% | ✅ Paystack |
| Uptime | > 99% | ✅ Vercel/Supabase |

---

## 🆘 Support

### Documentation
- **Developer Guide**: Technical documentation
- **Setup Guide**: Step-by-step setup
- **User Journeys**: User flow diagrams

### External Resources
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Paystack Docs**: https://paystack.com/docs
- **Vercel Docs**: https://vercel.com/docs

### Contact
**Developer:** Engr Depaytez  
**Email:** [depaytez@gmail.com]  
**Project:** JRADIANCE E-Commerce  

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

- Built with ❤️ for JRADIANCE Cosmetics & Skincare
- Powered by Next.js, Supabase, and Paystack
- Deployed on Vercel
- Images stored on Namecheap

---

**Last Updated:** February 19, 2026  
**Version:** 2.0.0
