# Quick SEO Reference Guide - JRADIANCE

## 🚀 Quick Start

### 1. Set Environment Variables
```bash
# Create .env.local file
NEXT_PUBLIC_BASE_URL=https://jradianceco.com
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 2. Build & Deploy
```bash
npm run build
npm run start
```

---

## 📁 New Files Created

| File | Purpose |
|------|---------|
| `src/utils/seo/metadata-factory.ts` | Reusable metadata generation |
| `src/utils/supabase/static-client.ts` | Cookie-independent Supabase client |
| `src/app/sitemap.ts` | Dynamic sitemap |
| `src/app/robots.ts` | Robots.txt |
| `src/app/(users)/products/[slug]/page.tsx` | Product detail page |
| `src/components/seo/ProductJsonLd.tsx` | Product structured data |
| `src/components/seo/BreadcrumbJsonLd.tsx` | Breadcrumb structured data |

---

## 🔧 Updated Files

| File | Changes |
|------|---------|
| `src/app/layout.tsx` | Uses metadata factory, added Organization JSON-LD |
| `src/components/products/ProductCard.tsx` | Now uses `<Link>` instead of onClick |
| `src/components/products/ProductFeeds.tsx` | Removed modal, uses routing |
| `src/utils/supabase/services-server.ts` | Added `getProductBySlug`, `getAllProductSlugs` |
| `next.config.ts` | Enhanced image optimization, security headers |

---

## 📊 SEO Features Checklist

### Metadata
- ✅ Title tags with template
- ✅ Meta descriptions
- ✅ OpenGraph tags
- ✅ Twitter Cards
- ✅ Canonical URLs
- ✅ Keywords

### Structured Data
- ✅ Product Schema (JSON-LD)
- ✅ Organization Schema (JSON-LD)
- ✅ Breadcrumb Schema (JSON-LD)

### Technical SEO
- ✅ Dynamic sitemap.xml
- ✅ Robots.txt
- ✅ Clean URLs (`/products/[slug]`)
- ✅ Server-side rendering
- ✅ Image optimization
- ✅ Mobile-friendly

---

## 🎯 How It Works

### Product Page Flow

```
1. User visits: /products/nivea-soft-light-cream
2. Next.js calls: generateMetadata() → SEO tags
3. Next.js calls: generateStaticParams() → Pre-render
4. Component renders: Product details + JSON-LD
5. Google crawls: Sees structured data → Rich snippet
```

### Metadata Generation

```typescript
// In products/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const product = await getProductBySlug(slug);
  return createProductMetadata({
    name: product.name,
    price: product.price,
    // ... more options
  });
}
```

### Structured Data

```tsx
// In product page
<ProductJsonLd product={product} />
// Outputs: <script type="application/ld+json">...</script>
```

---

## 🔍 Testing URLs

After deployment, test these URLs:

1. **Homepage**: `https://jradianceco.com/`
2. **Product Page**: `https://jradianceco.com/products/[product-slug]`
3. **Sitemap**: `https://jradianceco.com/sitemap.xml`
4. **Robots**: `https://jradianceco.com/robots.txt`

---

## 🧪 Google Tools

1. **Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Test any product page URL

2. **Search Console**
   - Submit: `sitemap.xml`
   - Monitor: Index coverage, Core Web Vitals

3. **PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - Test homepage and product pages

---

## 📈 Monitoring

### Key Metrics to Watch

- **Organic Traffic**: Google Analytics
- **Search Rankings**: Search Console
- **Rich Results**: Search Console → Enhancements
- **Page Speed**: PageSpeed Insights
- **Index Coverage**: Search Console → Coverage

---

## 🐛 Troubleshooting

### Product pages not indexed?
- Check robots.txt allows `/products/*`
- Verify sitemap includes product URLs
- Ensure products have `is_active: true` in database

### No rich snippets showing?
- Wait 1-2 weeks for Google to crawl
- Test with Rich Results Test tool
- Verify JSON-LD is valid

### Slow page load?
- Check image sizes (should be optimized)
- Verify SSR is working
- Check Core Web Vitals in Search Console

---

## 📝 Best Practices

### For New Products
1. Add product in Supabase with unique slug
2. Include detailed description
3. Add high-quality images
4. Set proper category
5. Rebuild or wait for auto-revalidation

### For Content Pages
1. Use descriptive titles
2. Write unique meta descriptions
3. Include relevant keywords
4. Add internal links
5. Use header tags (H1, H2, H3)

---

## 🎓 SOLID Principles Summary

- **SRP**: Each file has one responsibility
- **OCP**: Easy to extend without modifying existing code
- **LSP**: Components are interchangeable
- **ISP**: Small, focused interfaces
- **DIP**: Depends on abstractions, not concretions

---

## 📞 Support

For questions or issues:
1. Check `SEO_IMPLEMENTATION.md` for detailed docs
2. Review code comments in respective files
3. Test with Google's tools before deployment

---

**Last Updated**: February 19, 2026  
**Version**: 1.0.0
