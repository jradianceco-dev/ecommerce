# Tiptap Build Error Fix - TODO

## Plan Steps:

- [x] Step 1: Fix imports in src/components/admin/RichTextEditor.tsx (Table, TextStyle, Color → named) - ALREADY FIXED
- [x] Step 2: Fix imports in src/components/products/RichViewer.tsx (Image, Link, FontFamily, TextAlign, Highlight, Underline, Subscript, Superscript, HardBreak → named)
- [ ] Step 3: Run `npm run build` to verify fix
- [ ] Step 4: Test admin catalog editor
- [ ] Step 5: Test product detail rendering

**Runtime Fix Applied**

✓ Build success confirmed
✗ New SSR error in RichTextEditor → Added `immediatelyRender: false`

**Current: Test dev server (npm run dev) → Add product in /admin/catalog**
