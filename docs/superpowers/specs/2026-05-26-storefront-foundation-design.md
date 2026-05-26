# Maria Creations — Phase 1: Storefront Foundation

**Date:** 2026-05-26
**Status:** Approved design (pre-implementation)
**Scope:** Phase 1 of 4. Phases 2–4 (Order + Payment Flow, Admin Panel, Polish & Ops) will each receive their own spec.

---

## 1. Purpose

Build the visual and structural backbone of the Maria Creations boutique storefront — brand design system, layout chrome, home, shop listing, product detail, About, Contact, and a stub checkout page — using a client-only cart and seed product data. The result is a fully browsable, mobile-responsive site that customers can shop and add to cart, with checkout intentionally stubbed for Phase 2 to plug into.

The design direction is **"Floral Wonderland"**: cursive script headlines, pink gradient buttons, floating petals, and a romantic boutique feel — restrained enough to feel premium, not busy.

---

## 2. Architecture & Stack

### Already installed
- **Next.js 16.2.6** (App Router) — runs on port 4000 via `npm run dev`
- **React 19.2.4** with the React Compiler enabled (`reactCompiler: true` in `next.config.ts`)
- **TypeScript 5**
- **Tailwind CSS 4** (uses `@theme` in CSS for tokens, not `tailwind.config.ts`)

### Adding for Phase 1
- **`motion`** (Framer Motion v12+; renamed package, import from `motion/react`) — hero reveals, petal animation, card hover, page transitions
- **`zustand`** with `persist` middleware — cart + wishlist (localStorage-backed)
- **`clsx`** + **`tailwind-merge`** — clean conditional classnames

### Deliberately not in Phase 1
`mongodb`/`mongoose`, `next-auth`/`jose`, `react-hook-form` + `zod`, image upload SDKs. They arrive in Phases 2/3 when their first consumer is built.

### Next.js 16 reading discipline
`AGENTS.md` warns that this Next.js version has breaking changes vs the model's training data. Before writing any code that touches a Next.js API, the implementer **must** read the corresponding file under `node_modules/next/dist/docs/`. Specifically:
- `01-app/01-getting-started/05-server-and-client-components.md` — before the storefront layout
- `01-app/01-getting-started/12-images.md` — before any `next/image` usage
- `01-app/01-getting-started/13-fonts.md` — before adding Google Fonts
- `01-app/01-getting-started/14-metadata-and-og-images.md` — before per-page metadata
- `01-app/01-getting-started/15-route-handlers.md` — only if Phase 1 actually adds one (it does not; deferred to Phase 2)
- The relevant `03-api-reference/` page for any API the implementer hasn't used recently in Next 16

### Folder layout (Phase 1 only)
```
src/
├── app/
│   ├── (storefront)/
│   │   ├── layout.tsx          ← navbar + footer + page transitions
│   │   ├── page.tsx            ← Home
│   │   ├── shop/page.tsx       ← Shop listing (server component, searchParams driven)
│   │   ├── shop/[slug]/page.tsx ← Product detail
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   ├── checkout/page.tsx       ← Phase 1 stub
│   ├── layout.tsx              ← html/body, fonts, providers
│   └── globals.css             ← Tailwind v4 @theme tokens + base styles
├── components/
│   ├── brand/                  ← Logo, ScriptHeading, FloatingPetals, SectionDivider
│   ├── layout/                 ← Navbar, MobileMenu, Footer, CartDrawer
│   ├── product/                ← ProductCard, ProductGrid, ProductGallery, QuantityStepper, CategoryTile, ProductPrice
│   ├── ui/                     ← Button, IconButton, Chip, GlassCard, Container
│   └── motion/                 ← Reveal, PageTransition, MotionProvider
├── data/
│   ├── products.ts             ← ~12 typed seed products
│   └── categories.ts           ← 5 categories
├── store/
│   ├── cart.ts                 ← Zustand + persist
│   ├── wishlist.ts             ← Zustand + persist
│   └── ui.ts                   ← drawer/menu open state (not persisted)
├── lib/
│   ├── formatPrice.ts          ← Intl.NumberFormat('en-IN', INR, no decimals)
│   └── cn.ts                   ← clsx + twMerge
├── types/
│   └── product.ts              ← Product, Category, CategorySlug types
└── (styles/ — optional, only if tokens can't fit in globals.css @theme)
```

---

## 3. Brand System & Design Tokens

### Colors
Defined as Tailwind 4 `@theme` in `src/app/globals.css`:

| Token | Hex | Usage |
|---|---|---|
| `--color-brand-pink` | `#ff4f93` | CTA backgrounds (white text on top), heart icons, decorative accents, large script headings (≥18pt / 24px); **never small body text** |
| `--color-brand-pink-soft` | `#ff7fb2` | Gradient partner, hover states |
| `--color-brand-blush` | `#ffd6e7` | Borders, chip backgrounds, hairlines |
| `--color-brand-cream` | `#fff7fa` | Page background |
| `--color-brand-ink` | `#2a1620` | Primary body text on light backgrounds (~17:1 on cream) |
| `--color-brand-ink-muted` | `#6b3a4d` | Secondary text, eyebrows, small labels (~9.7:1 on cream — passes WCAG AAA) |

A gradient utility `bg-brand-gradient` resolves to `linear-gradient(135deg, #ff4f93, #ff7fb2)`.

**Color usage convention** — to keep the design feeling pink while staying accessible:
- **Pink (`brand-pink`)** is reserved for: CTA backgrounds (with white text on top), heart icons, hero/section script headings at large sizes (≥24px), and decorative SVG (petals, dividers, ornaments).
- **Chip text, eyebrow labels, breadcrumbs, badges, category tags** — all use `brand-ink-muted` on light backgrounds for AAA contrast, never pink.
- **Body paragraphs** — always `brand-ink`.

### Typography
Loaded via `next/font/google` (zero CLS, self-hosted):

- **Great Vibes** — script display. Tailwind class `font-script`. Used for: hero headline, page H1s, section intro headlines, footer wordmark.
- **Quicksand** (400/500/600/700) — body sans. Set as default `font-sans` on `<html>`. Also available as `font-body`. Used for: paragraphs, navigation, buttons, product info, prices.
- Fallbacks: `cursive` and `system-ui, -apple-system, sans-serif`.

### Spacing & radius
- Container max widths: `max-w-[1280px]` for pages; `max-w-[1440px]` for the hero block only.
- Section vertical rhythm: `py-20 lg:py-28` between major sections; `py-12 lg:py-16` for tighter blocks.
- Card radius: `rounded-2xl` (16px) standard; `rounded-3xl` (24px) hero & glass cards; `rounded-full` for buttons & chips.

### Shadows (custom `@theme` entries)
- `shadow-petal-sm` → `0 8px 24px rgba(255, 79, 147, 0.08)` — cards at rest
- `shadow-petal-md` → `0 16px 36px rgba(255, 79, 147, 0.14)` — card hover
- `shadow-petal-lg` → `0 20px 50px rgba(255, 79, 147, 0.22)` — CTAs, hero badge

### Signature elements (reused everywhere)
- **`<Logo />`** — renders the logo image (default: `/Maria-Creations-Logo.jpeg`, already present in `public/`) via `next/image` if the env var `NEXT_PUBLIC_LOGO_FILE` is set; otherwise renders a `Great Vibes` wordmark "Maria Creations". Implementer sets `NEXT_PUBLIC_LOGO_FILE=/Maria-Creations-Logo.jpeg` in `.env.local` and commits an example file `.env.example`. Variants: `default`, `mark` (smaller, used in the mobile navbar). Using an env var (rather than `node:fs`) keeps the component runtime-agnostic so it works inside both server and client component trees (`Navbar` is a client component and imports `Logo`).
- **`<ScriptHeading>`** — `Great Vibes` heading component. Props: `as` ('h1' | 'h2' | 'h3'), `ornament` (boolean — adds `✿ ✿ ✿` divider beneath), `align` ('center' | 'left').
- **`<GlassCard>`** — `bg-white/85 backdrop-blur-md border border-white/60 shadow-petal-sm rounded-2xl`.
- **`<FloatingPetals count={N} />`** — `motion`-animated SVG petals that drift slowly. Auto-disabled under `prefers-reduced-motion`.
- **`<SectionDivider />`** — inline SVG floral motif flanked by hairline rules.
- **`<Button variant="gradient" | "ghost" | "outline" | "link">`** — pill-shaped; hover lift achieved via Tailwind transitions (no client boundary required).

---

## 4. Routes & Page Anatomy

Every public route lives under the `(storefront)` route group so it shares the navbar/footer layout. The `/checkout` stub is intentionally outside the group — Phase 2 may give it a different shell.

### `/` — Home
- **Hero (Split Editorial layout)** — Two columns on desktop, stacked on mobile (text first, image below). Left: small uppercase eyebrow "Est. Madurai · Handmade", script headline "Maria Creations", tagline "Handmade flowers crafted with love — one petal at a time, made just for you.", "Shop Now" (gradient) + "Collections" (ghost). Right: `Handmade-1.jpeg` with a corner badge "New · Bouquets". `<FloatingPetals count={6} />` overlays the left panel only.
- **Shop by Category row** — 5 round `<CategoryTile>`s linking to `/shop?category=…`.
- **Featured Bouquets** — grid of 4 `<ProductCard>`s filtered to `featured: true`. Each card wrapped in `<Reveal>` for scroll-in animation.
- **Handmade with Love** — brand story block: script heading + two short paragraphs + `Handmade-2.jpeg`.
- **Instagram strip** — 4–6 square tiles with `@mariacreations` overlay. Phase 1 ships a placeholder grid using existing photos; a real feed integration is a Phase 4 task.
- **Final CTA band** — full-width pink gradient strip with "Explore the collection 🌸" + button to `/shop`.
- **`<SectionDivider />`** between every section.

### `/shop` — Shop listing
- Page header — script "The Collection" + breadcrumb (Home › Shop).
- **Sticky filter bar (desktop)** — category chips (All + 5 categories) and sort dropdown (`Featured`, `Price: low → high`, `Price: high → low`, `Newest`).
- **Mobile** — category chips horizontally scroll; sort opens a bottom-sheet style overlay.
- **Filter & sort state lives in URL search params** (`?category=…&sort=…`) so the page is a Server Component, initial HTML matches the URL, and links are shareable.
- Product grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- **Empty state** — "No flowers match those filters yet 🌸" + a "clear filters" link.

### `/shop/[slug]` — Product detail
- Two-column on desktop, stacked on mobile.
- **Left:** `<ProductGallery>` — main image + thumbnail strip; click thumbnail to swap; hover-zoom on the main image via `next/image` + scale transform.
- **Right:** category chip → script product name → `<ProductPrice>` → 1-paragraph description → "Handmade details" bullet list → `<QuantityStepper>` → "Add to Cart" (gradient) + "Buy Now" (ghost). In Phase 1, "Buy Now" routes directly to `/checkout` after adding the item; Phase 2 may change this behavior.
- **You may also love** — 4 related products from the same category (excluding the current one) in a `<ProductCard>` row.
- 404 via Next's `notFound()` if slug doesn't resolve.

### `/about`
- Script title, brand story (2–3 paragraphs), "Made by Maria" portrait block (placeholder image — user-supplied later), values list with floral bullet markers.

### `/contact`
- Script title + intro paragraph.
- Contact card with: WhatsApp link, Instagram link, email, location ("Madurai, India").
- Map embed deferred to Phase 4. Contact form deferred to Phase 2 (when react-hook-form + zod arrive).

### `/checkout` — Phase 1 stub
- Beautiful page that reads the cart from Zustand and shows a summary (line items, qty, subtotal, total).
- Headline: "Checkout opens soon 🌸"
- "Continue shopping" button → `/shop`.
- This page exists so the cart drawer's "Checkout" button has a real destination in Phase 1; Phase 2 replaces the body with the real form + order creation + GPay flow.

### Shared chrome — `(storefront)/layout.tsx`
- **`<Navbar>`** — sticky. Transparent at top, transitions to `bg-white/85 backdrop-blur-md shadow-petal-sm` once scroll > 40px. Links: Home, Shop, About, Contact. Right cluster: wishlist heart (count badge), cart icon (count badge). Mobile: hamburger → `<MobileMenu>` full-screen overlay.
- **`<CartDrawer>`** — slide-from-right on cart click (desktop), full-height bottom sheet on mobile (`< sm`). Glass overlay backdrop; backdrop click closes. Renders line items, qty steppers, subtotal, "Checkout" button → `/checkout`.
- **`<Footer>`** — logo, three link columns (Shop / About / Connect), Instagram CTA, tagline "Handmade with love in Madurai 🌸", `<SectionDivider />` above it.

### Mobile responsiveness
Every page is mobile-first. Hero stacks; navbar collapses to hamburger; grids drop to one column; cart drawer becomes a bottom sheet on `< sm`; horizontal-scroll category chips on shop.

---

## 5. Component Breakdown

`RSC` = React Server Component (default). `C` = `"use client"` required.

### `components/brand/`
| File | Type | Notes |
|---|---|---|
| `Logo.tsx` | RSC | `/logo.svg` via `next/image` if present; otherwise script wordmark. Variants: `default`, `mark`. |
| `ScriptHeading.tsx` | RSC | Props: `as`, `ornament`, `align`. Renders script font + optional ✿ divider. |
| `SectionDivider.tsx` | RSC | Inline SVG floral motif with hairline rules. |
| `FloatingPetals.tsx` | **C** | Props: `count`, `area`. Renders absolutely-positioned SVG petals animated via `motion`. Renders nothing under `prefers-reduced-motion`. |

### `components/layout/`
| File | Type | Notes |
|---|---|---|
| `Navbar.tsx` | **C** | Scroll listener for blur threshold; reads cart/wishlist counts. |
| `MobileMenu.tsx` | **C** | Full-screen overlay, slides in from right; traps focus; closes on link click. |
| `Footer.tsx` | RSC | |
| `CartDrawer.tsx` | **C** | Reads cart from Zustand and drawer open state from UI store. |

### `components/product/`
| File | Type | Notes |
|---|---|---|
| `ProductCard.tsx` | **C** | Soft Glass design. Heart toggle, Add-to-Cart, hover lift via `motion`. |
| `ProductGrid.tsx` | RSC | Pure layout wrapper. |
| `ProductGallery.tsx` | **C** | Main image swap; first image uses `next/image` `priority`. |
| `QuantityStepper.tsx` | **C** | `−` / value / `+`, min=1, max=stock. |
| `CategoryTile.tsx` | RSC | Round image with name overlay; links to filtered shop. |
| `ProductPrice.tsx` | RSC | Calls `formatPrice`. |

### `components/ui/`
| File | Type | Notes |
|---|---|---|
| `Button.tsx` | RSC | Variants: `gradient`, `ghost`, `outline`, `link`. Sizes: `sm`, `md`, `lg`. Pill-shaped. |
| `IconButton.tsx` | RSC | Round visual shell — interactivity is owned by the parent client component. |
| `Chip.tsx` | RSC | Variants: `category`, `count`, `new`. |
| `GlassCard.tsx` | RSC | Reusable glass wrapper. |
| `Container.tsx` | RSC | Standardizes max-width + horizontal padding. |

### `components/motion/`
| File | Type | Notes |
|---|---|---|
| `Reveal.tsx` | **C** | `whileInView` fade+rise, `once: true`. Respects reduced motion. |
| `PageTransition.tsx` | **C** | Wraps `(storefront)` page content with 200ms fade. |
| `MotionProvider.tsx` | **C** | `LazyMotion` + `domAnimation` for bundle hygiene; every motion component goes through this. |

### Client/Server discipline
Pages, layouts (where possible), grids, and most static markup are RSC. Only pieces with event handlers, store reads, scroll listeners, or motion are `"use client"`. Cart, wishlist, and UI stores are imported only from client components — server components never reference them. The `(storefront)/layout.tsx` is itself a server component; client concerns (page transition wrapper, motion provider) are mounted as child components.

---

## 6. State, Data & Animation

### Types — `src/types/product.ts`
```ts
export type CategorySlug =
  | "bouquets" | "pipe-cleaner" | "flower-pots" | "gifts" | "candle-floral";

export type Product = {
  id: string;            // "mc-p-001" — stable, source of truth for cart keys
  slug: string;          // url-safe ("rose-garden-bouquet")
  name: string;
  category: CategorySlug;
  price: number;         // INR, whole rupees
  images: string[];      // relative to /public, first is primary
  shortDescription: string;
  handmadeDetails: string[]; // bullet points
  stock: number;         // 0 = out of stock, disables Add to Cart
  featured?: boolean;    // shown on home featured row
  createdAt: string;     // ISO — drives "Newest" sort
};

export type Category = {
  slug: CategorySlug;
  name: string;          // "Handmade Bouquets"
  description: string;
  image: string;         // round tile image
};
```

### Seed data — `src/data/`
- `products.ts` exports `products: Product[]` with ~12 items (2–3 per category).
- `categories.ts` exports the 5 categories: Handmade Bouquets, Pipe Cleaner Flowers, Decorative Flower Pots, Floral Gifts, Candle Flower Designs.
- All image fields point to `/Handmade-1.jpeg` or `/Handmade-2.jpeg` for now (cycling). User will swap in real product photos as they become available.
- **Phase 2 replaces only these two files** with a MongoDB-backed data layer that returns the same `Product` / `Category` types. Components are unaffected.

### Cart store — `src/store/cart.ts`
```ts
type CartItem = { productId: string; quantity: number };
type CartState = {
  items: CartItem[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};
```
Persisted to `localStorage` under key `mc-cart-v1` via Zustand's `persist` middleware. **Stores only IDs + quantities** — product data is looked up at render time. Stale carts auto-correct when product details change. Derived values (`count`, `subtotal`, `lineItems`) are computed in components, not stored.

### Wishlist store — `src/store/wishlist.ts`
```ts
type WishlistState = {
  ids: string[];            // serializable; treated as a Set in code
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};
```
Persisted under key `mc-wishlist-v1`. Phase 1 surfaces the count in the navbar heart only — no dedicated `/wishlist` route (would clutter Phase 1; can be added later).

### UI store — `src/store/ui.ts`
```ts
type UIState = {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
};
```
Not persisted. Kept separate from cart so opening the drawer doesn't trigger cart-related re-renders.

### Animation specifics
- **Hero entrance** — staggered: eyebrow → script headline → tagline → buttons → product image (0.6s total).
- **Floating petals** — 6 SVG petals in the hero left panel; each animates with random `y` translate (~80–120px), rotation (~±15°), duration (8–14s), looped. Disabled under `prefers-reduced-motion`.
- **Scroll reveals** — `<Reveal>` wraps product cards and section headings: `opacity 0 → 1`, `y: 20 → 0`, viewport threshold 30%, `once: true`.
- **Card hover** — `motion.div whileHover={{ y: -4 }}` + shadow shift via Tailwind transition.
- **Page transitions** — fade-in (200ms) on every storefront route change.
- **Cart drawer** — slide from right (`x: 100% → 0`, 250ms ease-out); backdrop fades in.
- **Button hover** — gradient shifts via Tailwind background-position trick; no JS.
- **Bundle hygiene** — `LazyMotion` + `domAnimation` features only.

### Formatting
- `formatPrice(499)` → `"₹499"` via `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })`.
- Filter/sort happen on the server in `/shop` via `searchParams` so initial HTML matches the URL (SEO + no flash).

---

## 7. SEO, Accessibility, Performance

### SEO
- Per-page metadata via Next 16's metadata API (`export const metadata: Metadata` for static pages; `generateMetadata` for product detail).
- Site-level `<title>` template (`'%s · Maria Creations'`).
- OpenGraph + Twitter card metadata on home and every product detail page (uses first product image at 1200×630 served via Next's OG image route, deferred until images are big enough).
- `robots.ts` and `sitemap.ts` (Next 16 metadata-file conventions) — sitemap is generated from the seed product list at build time.

### Accessibility
- All interactive elements reachable via keyboard; focus rings visible (`focus-visible:ring-2 ring-brand-pink ring-offset-2`).
- Cart drawer and mobile menu trap focus while open; `Escape` closes them.
- Heart and cart icons have visible counts and `aria-label`s ("Open cart, 3 items").
- All images have meaningful `alt` text from `Product.name`.
- Color contrast: `brand-pink` (#ff4f93) on cream is ~2.95:1 — usable only for **large text (≥24px or ≥18.5px bold)** where the WCAG threshold drops to 3:1, plus decorative/non-text use. All small text uses `brand-ink` (~17:1) or `brand-ink-muted` (~9.7:1) on cream, both AAA. CTA buttons render white text on the pink gradient (white on #ff4f93 ≈ 4.6:1, passes AA for normal text).
- `prefers-reduced-motion` honoured by `FloatingPetals`, `Reveal`, and `PageTransition`.

### Performance
- Every product/hero image goes through `next/image` with correct `sizes`.
- Hero product image uses `priority`; everything else is lazy.
- Fonts via `next/font/google` (self-hosted, zero CLS, no third-party request).
- React Compiler already enabled — components don't need manual `memo` / `useMemo`.
- `motion` via `LazyMotion` + `domAnimation` to keep bundle small.
- Lighthouse target on mobile for `/` and `/shop`: Performance ≥ 90, Accessibility ≥ 95.

---

## 8. Phase 1 Scope Boundary

### ✅ In Phase 1
- Brand design system (color tokens, typography, shadows, signature components)
- Storefront chrome — Navbar (scroll-blur, mobile menu), Footer, CartDrawer, page transitions, floating petals, section dividers
- Home page (hero, category row, featured products, brand story, Instagram strip placeholder, CTA band)
- Shop listing (filter chips, sort dropdown, URL-driven state, empty state)
- Product detail (gallery, info column, you-may-also-love row, 404 handling)
- About + Contact pages (static, no form)
- `/checkout` stub that renders the cart summary and "coming soon"
- Cart store (add / remove / setQty / clear, persisted localStorage)
- Wishlist store (toggle, persisted localStorage, navbar count only)
- 12 seed products across 5 categories in `src/data/`
- Full mobile responsiveness (sm/md/lg/xl breakpoints, mobile-first)
- `prefers-reduced-motion` honoured everywhere
- SEO basics — metadata, OG for home + product, `<title>` template, `robots.ts`, `sitemap.ts`
- Image optimization via `next/image`
- Font loading via `next/font/google`
- Lighthouse target met on mobile
- `npm run build` passes; `npm run lint` clean

### ❌ Deferred to Phase 2 (Order + Payment Flow)
Checkout form (React Hook Form + Zod), order creation, MC#### ID generator, MongoDB persistence, GPay QR page, payment screenshot upload, order confirmation page, MongoDB connection/schemas/route handlers.

### ❌ Deferred to Phase 3 (Admin Panel)
Admin auth, dashboard, product CRUD, order management, payment verification, image upload, stock management UI.

### ❌ Deferred to Phase 4 (Polish & Ops)
Real Instagram feed integration, contact form, map embed, `/wishlist` route, search bar, reviews/testimonials, production deployment config.

### User-supplied dependencies before implementation
1. ~~Logo file~~ — **already provided** (`public/Maria-Creations-Logo.jpeg`). Implementer sets `NEXT_PUBLIC_LOGO_FILE=/Maria-Creations-Logo.jpeg` in `.env.local`.
2. *(Nice-to-have)* 2–3 more handmade photos in `public/` so the seed isn't repeating two images. Phase 1 ships fine with the existing two if needed.

---

## 9. Open Questions

None at design time — all decisions captured above. Any new questions surfaced during implementation should be raised back to the user before being silently resolved.
