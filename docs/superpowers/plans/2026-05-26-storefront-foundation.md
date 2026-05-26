# Storefront Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [`docs/superpowers/specs/2026-05-26-storefront-foundation-design.md`](../specs/2026-05-26-storefront-foundation-design.md)

**Goal:** Build the visual and structural backbone of the Maria Creations boutique storefront — brand system, layout chrome, home, shop, product detail, about, contact, and a stub checkout — using a client-only cart with typed seed product data.

**Architecture:** Next.js 16 App Router with React 19 + React Compiler. Tailwind 4 via `@theme` CSS tokens. Server Components for layouts, pages, and static pieces; `"use client"` only for interactivity (navbar scroll listener, cart drawer, product card heart/add, motion animations). Cart/wishlist via Zustand with `persist` middleware to `localStorage`. Motion via the `motion` package (renamed Framer Motion v12+) behind a `LazyMotion` + `domAnimation` provider.

**Tech Stack:** Next.js 16.2.6 · React 19.2.4 · TypeScript 5 · Tailwind CSS 4 · `motion` · `zustand` · `clsx` + `tailwind-merge` · Vitest (pure-logic tests only).

**Test discipline:** TDD for pure-logic units (`formatPrice`, sort/filter helpers, Zustand stores). Visual components are verified by running the dev server (`npm run dev` on port 4000) and confirming in a browser at multiple breakpoints — there is no visual snapshot framework in Phase 1.

**Commit cadence:** One commit per task (logical, reviewable chunks). Use `docs:`, `feat:`, `chore:` conventional prefixes.

**Next.js 16 reading rule:** AGENTS.md warns this Next version has breaking changes vs the model's training data. Each task that touches a Next API has a "Read the matching doc" step **first** — do not skip it. Specifically: `params`/`searchParams` are now **Promises** that must be `await`ed; `PageProps<'/route'>` is a global type helper.

---

## File Structure

This is the complete set of files Phase 1 creates or modifies. Each task below operates on a subset of these.

### Configuration (modified)
- `package.json` — add deps + scripts
- `next.config.ts` — keep React Compiler on; add `images.remotePatterns` empty for now (no remote images in Phase 1)
- `tsconfig.json` — already has `@/*` alias and Next plugin; no changes
- `.env.example` — new, documents `NEXT_PUBLIC_LOGO_FILE`
- `.env.local` — new, ignored by git; implementer sets `NEXT_PUBLIC_LOGO_FILE=/Maria-Creations-Logo.jpeg`
- `vitest.config.ts` — new, configures Vitest with `node` env (no DOM needed for tested code)

### Global app shell (modified)
- `src/app/layout.tsx` — root layout: fonts, html/body, viewport metadata
- `src/app/globals.css` — Tailwind 4 `@theme` tokens + global resets
- `src/app/page.tsx` — **delete** (becomes `src/app/(storefront)/page.tsx`)
- `src/app/robots.ts` — new
- `src/app/sitemap.ts` — new
- `src/app/opengraph-image.tsx` — new (default OG image for site)

### Route group: `(storefront)/`
- `src/app/(storefront)/layout.tsx` — Navbar + Footer + page transition wrapper + motion provider
- `src/app/(storefront)/page.tsx` — Home
- `src/app/(storefront)/shop/page.tsx` — Shop listing (server component, awaits `searchParams`)
- `src/app/(storefront)/shop/[slug]/page.tsx` — Product detail (server component, awaits `params`)
- `src/app/(storefront)/about/page.tsx`
- `src/app/(storefront)/contact/page.tsx`

### Other routes
- `src/app/checkout/page.tsx` — Phase 1 stub

### Library (new)
- `src/lib/cn.ts` — `clsx` + `twMerge` helper
- `src/lib/formatPrice.ts` — INR formatting
- `src/lib/formatPrice.test.ts` — Vitest unit tests
- `src/lib/sortProducts.ts` — pure sort logic
- `src/lib/sortProducts.test.ts`
- `src/lib/filterProducts.ts` — pure filter logic
- `src/lib/filterProducts.test.ts`
- `src/lib/brand.ts` — logo env-var helper

### Types (new)
- `src/types/product.ts`

### Data (new)
- `src/data/categories.ts`
- `src/data/products.ts`

### Stores (new)
- `src/store/cart.ts` + `cart.test.ts`
- `src/store/wishlist.ts` + `wishlist.test.ts`
- `src/store/ui.ts`

### Components — `src/components/`
**brand/**
- `Logo.tsx`
- `ScriptHeading.tsx`
- `SectionDivider.tsx`
- `FloatingPetals.tsx`

**ui/**
- `Container.tsx`
- `Button.tsx`
- `IconButton.tsx`
- `Chip.tsx`
- `GlassCard.tsx`

**motion/**
- `MotionProvider.tsx`
- `Reveal.tsx`
- `PageTransition.tsx`

**layout/**
- `Navbar.tsx`
- `MobileMenu.tsx`
- `Footer.tsx`
- `CartDrawer.tsx`

**product/**
- `ProductPrice.tsx`
- `QuantityStepper.tsx`
- `CategoryTile.tsx`
- `ProductCard.tsx`
- `ProductGrid.tsx`
- `ProductGallery.tsx`

---

## Task 1: Install dependencies, configure Vitest, set up env files

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `.env.example`, `.env.local`

- [ ] **Step 1: Install runtime deps**

Run:
```powershell
npm install motion@^12 zustand@^5 clsx tailwind-merge
```
Expected: installs without peer-dep errors.

- [ ] **Step 2: Install Vitest as a dev dep**

Run:
```powershell
npm install -D vitest @types/node
```
(`@types/node` is already there but harmless to re-pin.) Expected: installs cleanly.

- [ ] **Step 3: Add `test` script to `package.json`**

Edit `package.json` so `"scripts"` becomes:
```json
"scripts": {
  "dev": "next dev -p 4000",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Create `vitest.config.ts`**

Write `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
```
Rationale: every tested unit is pure TS (helpers, Zustand stores). No DOM needed → faster, simpler.

- [ ] **Step 5: Create `.env.example`**

Write `.env.example`:
```
# Path under /public to the brand logo image. Leave unset to use the wordmark fallback.
NEXT_PUBLIC_LOGO_FILE=/Maria-Creations-Logo.jpeg
```

- [ ] **Step 6: Create `.env.local`**

Write `.env.local`:
```
NEXT_PUBLIC_LOGO_FILE=/Maria-Creations-Logo.jpeg
```
(`.env*` is already gitignored.)

- [ ] **Step 7: Verify Vitest runs (no tests yet, so should exit 0)**

Run:
```powershell
npm test
```
Expected: "No test files found" → exits 0 (Vitest exits 0 when no tests match unless `--passWithNoTests=false`).

- [ ] **Step 8: Commit**

```powershell
git add package.json package-lock.json vitest.config.ts .env.example
git commit -m "chore: add motion, zustand, vitest deps for storefront work"
```
(`.env.local` is gitignored — do not stage it.)

---

## Task 2: Brand tokens, fonts, root layout

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1: Read the Next.js 16 fonts doc**

Read: `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` (first ~120 lines).
Confirm: import path `next/font/google`, options object pattern, `variable` for CSS-var binding.

- [ ] **Step 2: Replace `src/app/globals.css` with theme tokens**

Write `src/app/globals.css`:
```css
@import "tailwindcss";

@theme {
  /* Brand colors */
  --color-brand-pink: #ff4f93;
  --color-brand-pink-soft: #ff7fb2;
  --color-brand-blush: #ffd6e7;
  --color-brand-cream: #fff7fa;
  --color-brand-ink: #2a1620;
  --color-brand-ink-muted: #6b3a4d;

  /* Brand-aware shadows */
  --shadow-petal-sm: 0 8px 24px rgba(255, 79, 147, 0.08);
  --shadow-petal-md: 0 16px 36px rgba(255, 79, 147, 0.14);
  --shadow-petal-lg: 0 20px 50px rgba(255, 79, 147, 0.22);

  /* Font families (mapped to next/font CSS vars set on <html>) */
  --font-script: var(--font-great-vibes), cursive;
  --font-body: var(--font-quicksand), system-ui, -apple-system, sans-serif;
  --font-sans: var(--font-quicksand), system-ui, -apple-system, sans-serif;
}

:root {
  --brand-gradient: linear-gradient(135deg, var(--color-brand-pink), var(--color-brand-pink-soft));
}

@layer base {
  html {
    background: var(--color-brand-cream);
    color: var(--color-brand-ink);
  }

  body {
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }

  ::selection {
    background: var(--color-brand-blush);
    color: var(--color-brand-ink);
  }
}

@utility bg-brand-gradient {
  background-image: var(--brand-gradient);
}
```

- [ ] **Step 3: Replace `src/app/layout.tsx` with fonts + metadata template**

Write `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Great_Vibes, Quicksand } from "next/font/google";
import "./globals.css";

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:4000"),
  title: {
    default: "Maria Creations · Handmade Flowers",
    template: "%s · Maria Creations",
  },
  description:
    "Handmade flowers crafted with love. Bouquets, candle florals, and decorative pieces from Madurai.",
  openGraph: {
    title: "Maria Creations · Handmade Flowers",
    description: "Handmade flowers crafted with love. Made in Madurai.",
    siteName: "Maria Creations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${greatVibes.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-ink">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Delete the placeholder root `src/app/page.tsx`**

Run:
```powershell
Remove-Item src/app/page.tsx
```
Reason: the home page will live at `src/app/(storefront)/page.tsx` so it inherits the storefront layout. Deleting it prevents route ambiguity.

- [ ] **Step 5: Start the dev server in another terminal and visit /**

Run (background):
```powershell
npm run dev
```
Visit `http://localhost:4000/`. Expected: a 404 page (no `(storefront)/page.tsx` yet) but with the cream background and Quicksand font on the 404 text. **If you see Geist or Times New Roman → fonts didn't wire; debug before continuing.**

- [ ] **Step 6: Commit**

```powershell
git add src/app/globals.css src/app/layout.tsx
git rm src/app/page.tsx
git commit -m "feat: add brand theme tokens, Great Vibes + Quicksand fonts"
```

---

## Task 3: Type system, cn helper, formatPrice (TDD)

**Files:**
- Create: `src/types/product.ts`, `src/lib/cn.ts`, `src/lib/formatPrice.ts`, `src/lib/formatPrice.test.ts`

- [ ] **Step 1: Write the Product / Category types**

Write `src/types/product.ts`:
```ts
export type CategorySlug =
  | "bouquets"
  | "pipe-cleaner"
  | "flower-pots"
  | "gifts"
  | "candle-floral";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  images: string[];
  shortDescription: string;
  handmadeDetails: string[];
  stock: number;
  featured?: boolean;
  createdAt: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
};
```

- [ ] **Step 2: Write the `cn` helper**

Write `src/lib/cn.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Write the failing `formatPrice` test**

Write `src/lib/formatPrice.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("formats whole rupees with the rupee symbol", () => {
    expect(formatPrice(499)).toBe("₹499");
  });
  it("inserts the Indian thousands grouping (lakh/crore aware)", () => {
    expect(formatPrice(1299)).toBe("₹1,299");
    expect(formatPrice(125000)).toBe("₹1,25,000");
  });
  it("renders zero without decimals", () => {
    expect(formatPrice(0)).toBe("₹0");
  });
  it("rounds non-integer inputs to nearest whole rupee", () => {
    expect(formatPrice(499.4)).toBe("₹499");
    expect(formatPrice(499.6)).toBe("₹500");
  });
});
```

- [ ] **Step 4: Run the test, expect failure**

Run:
```powershell
npm test -- formatPrice
```
Expected: FAIL — module not found.

- [ ] **Step 5: Implement `formatPrice`**

Write `src/lib/formatPrice.ts`:
```ts
const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  // Intl uses a non-breaking space between symbol and number in some locales.
  // Normalize to a regular space-free "₹X" form for consistent UI rendering.
  return formatter.format(Math.round(amount)).replace(/\s/g, "");
}
```

- [ ] **Step 6: Run tests, expect pass**

Run:
```powershell
npm test -- formatPrice
```
Expected: 4/4 PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/types/product.ts src/lib/cn.ts src/lib/formatPrice.ts src/lib/formatPrice.test.ts
git commit -m "feat: add Product types, cn helper, INR formatPrice with tests"
```

---

## Task 4: Seed data (categories + 12 products)

**Files:**
- Create: `src/data/categories.ts`, `src/data/products.ts`

- [ ] **Step 1: Write `src/data/categories.ts`**

```ts
import type { Category } from "@/types/product";

export const categories: Category[] = [
  {
    slug: "bouquets",
    name: "Handmade Bouquets",
    description: "Hand-tied bouquets crafted from pipe cleaner roses, lilies, and seasonal blooms.",
    image: "/Handmade-1.jpeg",
  },
  {
    slug: "pipe-cleaner",
    name: "Pipe Cleaner Flowers",
    description: "Single-stem and small-cluster pipe cleaner flowers, perfect for gifting.",
    image: "/Handmade-2.jpeg",
  },
  {
    slug: "flower-pots",
    name: "Decorative Flower Pots",
    description: "Miniature pots arranged with handmade blooms — a cheerful piece of forever-spring.",
    image: "/Handmade-1.jpeg",
  },
  {
    slug: "gifts",
    name: "Floral Gifts",
    description: "Curated gift sets for birthdays, anniversaries, and just-because moments.",
    image: "/Handmade-2.jpeg",
  },
  {
    slug: "candle-floral",
    name: "Candle Flower Designs",
    description: "Scented candles wrapped in handmade petals — a softer kind of glow.",
    image: "/Handmade-1.jpeg",
  },
];
```

- [ ] **Step 2: Write `src/data/products.ts` with 12 products**

```ts
import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "mc-p-001",
    slug: "rose-garden-bouquet",
    name: "Rose Garden Bouquet",
    category: "bouquets",
    price: 499,
    images: ["/Handmade-1.jpeg", "/Handmade-2.jpeg"],
    shortDescription: "A dozen handmade pipe-cleaner roses tied with satin ribbon.",
    handmadeDetails: [
      "12 pipe-cleaner roses in soft pinks",
      "Satin ribbon wrap, hand-tied",
      "Approx. 28cm tall · 18cm wide",
    ],
    stock: 8,
    featured: true,
    createdAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "mc-p-002",
    slug: "blush-lily-bouquet",
    name: "Blush Lily Bouquet",
    category: "bouquets",
    price: 649,
    images: ["/Handmade-2.jpeg", "/Handmade-1.jpeg"],
    shortDescription: "Hand-shaped lilies in blush and ivory, gathered with kraft paper.",
    handmadeDetails: [
      "9 hand-shaped lilies",
      "Kraft paper wrap with twine",
      "Approx. 32cm tall",
    ],
    stock: 5,
    featured: true,
    createdAt: "2026-04-12T10:00:00.000Z",
  },
  {
    id: "mc-p-003",
    slug: "spring-meadow-bouquet",
    name: "Spring Meadow Bouquet",
    category: "bouquets",
    price: 899,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "A wildflower-style mix of pipe cleaner blooms in soft pastels.",
    handmadeDetails: [
      "Mixed-bloom arrangement",
      "Pastel palette: blush, mint, butter",
      "Hand-tied with lace ribbon",
    ],
    stock: 3,
    createdAt: "2026-04-20T10:00:00.000Z",
  },
  {
    id: "mc-p-004",
    slug: "single-stem-rose",
    name: "Single-Stem Rose",
    category: "pipe-cleaner",
    price: 99,
    images: ["/Handmade-2.jpeg"],
    shortDescription: "A single handcrafted pipe-cleaner rose — the perfect little gift.",
    handmadeDetails: [
      "Hand-shaped petals",
      "Approx. 22cm stem",
      "Choice of pink, red, or ivory (specify on order)",
    ],
    stock: 24,
    createdAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "mc-p-005",
    slug: "trio-of-tulips",
    name: "Trio of Tulips",
    category: "pipe-cleaner",
    price: 249,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "Three handcrafted tulips, tied together with a delicate ribbon.",
    handmadeDetails: [
      "Three pipe-cleaner tulips",
      "Pastel colour mix",
      "Ribbon wrap",
    ],
    stock: 12,
    featured: true,
    createdAt: "2026-05-02T10:00:00.000Z",
  },
  {
    id: "mc-p-006",
    slug: "cottage-bloom-pot",
    name: "Cottage Bloom Pot",
    category: "flower-pots",
    price: 899,
    images: ["/Handmade-1.jpeg", "/Handmade-2.jpeg"],
    shortDescription: "A miniature ceramic pot brimming with handmade flowers.",
    handmadeDetails: [
      "Ceramic pot · approx. 10cm diameter",
      "Mixed pipe-cleaner blooms",
      "Ready to display",
    ],
    stock: 4,
    createdAt: "2026-04-25T10:00:00.000Z",
  },
  {
    id: "mc-p-007",
    slug: "tiny-terrace-planter",
    name: "Tiny Terrace Planter",
    category: "flower-pots",
    price: 599,
    images: ["/Handmade-2.jpeg"],
    shortDescription: "A petite planter perfect for desks and bedside tables.",
    handmadeDetails: [
      "Hand-painted terracotta pot",
      "3 pipe-cleaner blooms",
      "Wipe-clean, no watering needed",
    ],
    stock: 7,
    createdAt: "2026-05-10T10:00:00.000Z",
  },
  {
    id: "mc-p-008",
    slug: "love-note-gift-box",
    name: "Love Note Gift Box",
    category: "gifts",
    price: 749,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "A gift box with a mini bouquet and handwritten love note.",
    handmadeDetails: [
      "Mini bouquet of 5 stems",
      "Handwritten note (specify wording on order)",
      "Branded gift box",
    ],
    stock: 6,
    featured: true,
    createdAt: "2026-04-30T10:00:00.000Z",
  },
  {
    id: "mc-p-009",
    slug: "anniversary-keepsake-set",
    name: "Anniversary Keepsake Set",
    category: "gifts",
    price: 1299,
    images: ["/Handmade-2.jpeg", "/Handmade-1.jpeg"],
    shortDescription: "A keepsake bouquet paired with a candle floral piece.",
    handmadeDetails: [
      "Handmade bouquet of 7 stems",
      "Matching candle floral piece",
      "Gift-ready presentation",
    ],
    stock: 3,
    createdAt: "2026-05-15T10:00:00.000Z",
  },
  {
    id: "mc-p-010",
    slug: "birthday-blooms-set",
    name: "Birthday Blooms Set",
    category: "gifts",
    price: 599,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "A bright handmade bouquet with a birthday tag.",
    handmadeDetails: [
      "Mixed-bloom mini bouquet",
      "Birthday card included",
      "Bright cheerful palette",
    ],
    stock: 9,
    createdAt: "2026-05-18T10:00:00.000Z",
  },
  {
    id: "mc-p-011",
    slug: "pink-petal-candle",
    name: "Pink Petal Candle",
    category: "candle-floral",
    price: 699,
    images: ["/Handmade-2.jpeg"],
    shortDescription: "A scented candle wrapped in handmade rose petals.",
    handmadeDetails: [
      "Soy wax · rose scent",
      "Hand-shaped petal wrap",
      "Approx. 8cm tall",
    ],
    stock: 5,
    createdAt: "2026-05-05T10:00:00.000Z",
  },
  {
    id: "mc-p-012",
    slug: "blush-glow-candle",
    name: "Blush Glow Candle",
    category: "candle-floral",
    price: 849,
    images: ["/Handmade-1.jpeg", "/Handmade-2.jpeg"],
    shortDescription: "A larger candle with a halo of handmade pink blooms.",
    handmadeDetails: [
      "Soy wax · jasmine scent",
      "Bloom halo arrangement",
      "Approx. 12cm tall",
    ],
    stock: 0,
    createdAt: "2026-05-20T10:00:00.000Z",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getRelatedProducts(
  productId: string,
  category: string,
  limit = 4
): Product[] {
  return products
    .filter((p) => p.id !== productId && p.category === category)
    .slice(0, limit);
}
```

- [ ] **Step 3: Type-check**

Run:
```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/data/categories.ts src/data/products.ts
git commit -m "feat: seed 5 categories and 12 products"
```

---

## Task 5: Sort + filter pure logic (TDD)

**Files:**
- Create: `src/lib/sortProducts.ts` + `.test.ts`, `src/lib/filterProducts.ts` + `.test.ts`

- [ ] **Step 1: Write sortProducts test**

Write `src/lib/sortProducts.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { sortProducts, type SortKey } from "./sortProducts";
import type { Product } from "@/types/product";

const sample: Product[] = [
  { id: "1", slug: "a", name: "A", category: "bouquets", price: 200, images: [], shortDescription: "", handmadeDetails: [], stock: 1, featured: false, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "2", slug: "b", name: "B", category: "bouquets", price: 100, images: [], shortDescription: "", handmadeDetails: [], stock: 1, featured: true,  createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "3", slug: "c", name: "C", category: "bouquets", price: 300, images: [], shortDescription: "", handmadeDetails: [], stock: 1, featured: false, createdAt: "2026-03-01T00:00:00.000Z" },
];

describe("sortProducts", () => {
  it("featured: featured items first, then by createdAt desc", () => {
    expect(sortProducts(sample, "featured").map((p) => p.id)).toEqual(["2", "3", "1"]);
  });
  it("price-asc: ascending price", () => {
    expect(sortProducts(sample, "price-asc").map((p) => p.id)).toEqual(["2", "1", "3"]);
  });
  it("price-desc: descending price", () => {
    expect(sortProducts(sample, "price-desc").map((p) => p.id)).toEqual(["3", "1", "2"]);
  });
  it("newest: by createdAt desc", () => {
    expect(sortProducts(sample, "newest").map((p) => p.id)).toEqual(["3", "2", "1"]);
  });
  it("does not mutate the input", () => {
    const before = sample.map((p) => p.id);
    sortProducts(sample, "price-desc");
    expect(sample.map((p) => p.id)).toEqual(before);
  });
  it("falls back to featured for unknown sort key", () => {
    expect(sortProducts(sample, "garbage" as SortKey).map((p) => p.id)).toEqual(["2", "3", "1"]);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```powershell
npm test -- sortProducts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement sortProducts**

Write `src/lib/sortProducts.ts`:
```ts
import type { Product } from "@/types/product";

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

const byCreatedAtDesc = (a: Product, b: Product) =>
  b.createdAt.localeCompare(a.createdAt);

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "newest":
      return copy.sort(byCreatedAtDesc);
    case "featured":
    default:
      return copy.sort((a, b) => {
        if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
        return byCreatedAtDesc(a, b);
      });
  }
}
```

- [ ] **Step 4: Run, expect pass**

```powershell
npm test -- sortProducts
```
Expected: 6/6 PASS.

- [ ] **Step 5: Write filterProducts test**

Write `src/lib/filterProducts.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { filterProducts } from "./filterProducts";
import type { Product } from "@/types/product";

const sample: Product[] = [
  { id: "1", slug: "a", name: "A", category: "bouquets",    price: 100, images: [], shortDescription: "", handmadeDetails: [], stock: 1, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "2", slug: "b", name: "B", category: "candle-floral", price: 200, images: [], shortDescription: "", handmadeDetails: [], stock: 1, createdAt: "2026-01-02T00:00:00.000Z" },
  { id: "3", slug: "c", name: "C", category: "bouquets",    price: 300, images: [], shortDescription: "", handmadeDetails: [], stock: 1, createdAt: "2026-01-03T00:00:00.000Z" },
];

describe("filterProducts", () => {
  it("returns all products when no category given", () => {
    expect(filterProducts(sample).length).toBe(3);
    expect(filterProducts(sample, undefined).length).toBe(3);
    expect(filterProducts(sample, "all").length).toBe(3);
  });
  it("filters by a known category", () => {
    expect(filterProducts(sample, "bouquets").map((p) => p.id)).toEqual(["1", "3"]);
  });
  it("returns empty for an unknown category", () => {
    expect(filterProducts(sample, "nope")).toEqual([]);
  });
});
```

- [ ] **Step 6: Run, expect failure**

```powershell
npm test -- filterProducts
```
Expected: FAIL.

- [ ] **Step 7: Implement filterProducts**

Write `src/lib/filterProducts.ts`:
```ts
import type { Product, CategorySlug } from "@/types/product";

const KNOWN_CATEGORIES = new Set<CategorySlug>([
  "bouquets",
  "pipe-cleaner",
  "flower-pots",
  "gifts",
  "candle-floral",
]);

export function filterProducts(
  products: Product[],
  category?: string | "all"
): Product[] {
  if (!category || category === "all") return products;
  if (!KNOWN_CATEGORIES.has(category as CategorySlug)) return [];
  return products.filter((p) => p.category === category);
}
```

- [ ] **Step 8: Run, expect pass**

```powershell
npm test
```
Expected: all tests PASS (formatPrice + sortProducts + filterProducts).

- [ ] **Step 9: Commit**

```powershell
git add src/lib/sortProducts.ts src/lib/sortProducts.test.ts src/lib/filterProducts.ts src/lib/filterProducts.test.ts
git commit -m "feat: sortProducts + filterProducts pure helpers with tests"
```

---

## Task 6: Cart store (TDD)

**Files:**
- Create: `src/store/cart.ts`, `src/store/cart.test.ts`

- [ ] **Step 1: Write the failing cart test**

Write `src/store/cart.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./cart";

const reset = () => useCartStore.setState({ items: [] }, true);

describe("cart store", () => {
  beforeEach(reset);

  it("starts empty", () => {
    expect(useCartStore.getState().items).toEqual([]);
  });
  it("adds a new item with default quantity 1", () => {
    useCartStore.getState().add("mc-p-001");
    expect(useCartStore.getState().items).toEqual([{ productId: "mc-p-001", quantity: 1 }]);
  });
  it("increments quantity when adding the same id again", () => {
    const { add } = useCartStore.getState();
    add("mc-p-001");
    add("mc-p-001", 2);
    expect(useCartStore.getState().items).toEqual([{ productId: "mc-p-001", quantity: 3 }]);
  });
  it("setQty replaces the quantity (clamped to >= 1)", () => {
    const { add, setQty } = useCartStore.getState();
    add("mc-p-001");
    setQty("mc-p-001", 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    setQty("mc-p-001", 0);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });
  it("remove drops the item", () => {
    const { add, remove } = useCartStore.getState();
    add("mc-p-001");
    add("mc-p-002");
    remove("mc-p-001");
    expect(useCartStore.getState().items).toEqual([{ productId: "mc-p-002", quantity: 1 }]);
  });
  it("clear empties the cart", () => {
    const { add, clear } = useCartStore.getState();
    add("mc-p-001");
    add("mc-p-002");
    clear();
    expect(useCartStore.getState().items).toEqual([]);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```powershell
npm test -- cart
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement cart store**

Write `src/store/cart.ts`:
```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = { productId: string; quantity: number };

export type CartState = {
  items: CartItem[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: qty }] };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, qty) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "mc-cart-v1",
      storage: createJSONStorage(() => {
        // SSR-safe: return a no-op storage on the server; real localStorage on client.
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
    }
  )
);
```

- [ ] **Step 4: Run, expect pass**

```powershell
npm test -- cart
```
Expected: 6/6 PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/store/cart.ts src/store/cart.test.ts
git commit -m "feat: Zustand cart store with persist + clamped setQty"
```

---

## Task 7: Wishlist store (TDD)

**Files:**
- Create: `src/store/wishlist.ts`, `src/store/wishlist.test.ts`

- [ ] **Step 1: Write the failing test**

Write `src/store/wishlist.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useWishlistStore } from "./wishlist";

const reset = () => useWishlistStore.setState({ ids: [] }, true);

describe("wishlist store", () => {
  beforeEach(reset);

  it("starts empty", () => {
    expect(useWishlistStore.getState().ids).toEqual([]);
    expect(useWishlistStore.getState().has("x")).toBe(false);
  });
  it("toggle adds when missing, removes when present", () => {
    const { toggle, has } = useWishlistStore.getState();
    toggle("mc-p-001");
    expect(has("mc-p-001")).toBe(true);
    toggle("mc-p-001");
    expect(has("mc-p-001")).toBe(false);
  });
  it("ids remain unique even if toggled twice quickly", () => {
    useWishlistStore.getState().toggle("a");
    useWishlistStore.getState().toggle("b");
    useWishlistStore.getState().toggle("a");
    useWishlistStore.getState().toggle("a");
    expect(useWishlistStore.getState().ids.sort()).toEqual(["a", "b"]);
  });
  it("clear empties the wishlist", () => {
    const { toggle, clear } = useWishlistStore.getState();
    toggle("a");
    toggle("b");
    clear();
    expect(useWishlistStore.getState().ids).toEqual([]);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```powershell
npm test -- wishlist
```
Expected: FAIL.

- [ ] **Step 3: Implement wishlist store**

Write `src/store/wishlist.ts`:
```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((state) => {
          const has = state.ids.includes(id);
          return {
            ids: has ? state.ids.filter((x) => x !== id) : [...state.ids, id],
          };
        }),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "mc-wishlist-v1",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return window.localStorage;
      }),
    }
  )
);
```

- [ ] **Step 4: Run, expect pass**

```powershell
npm test -- wishlist
```
Expected: 4/4 PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/store/wishlist.ts src/store/wishlist.test.ts
git commit -m "feat: Zustand wishlist store with toggle + persist"
```

---

## Task 8: UI store (drawer + menu open state)

**Files:**
- Create: `src/store/ui.ts`

No tests for this — it's three trivial booleans + setters. Visual verification when CartDrawer is wired in Task 17.

- [ ] **Step 1: Implement UI store**

Write `src/store/ui.ts`:
```ts
import { create } from "zustand";

export type UIState = {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
```

- [ ] **Step 2: Commit**

```powershell
git add src/store/ui.ts
git commit -m "feat: UI store for cart drawer + mobile menu open state"
```

---

## Task 9: UI primitives (Container, Button, IconButton, Chip, GlassCard)

**Files:**
- Create: `src/components/ui/Container.tsx`, `Button.tsx`, `IconButton.tsx`, `Chip.tsx`, `GlassCard.tsx`

All five are RSC (no `"use client"`).

- [ ] **Step 1: Container**

Write `src/components/ui/Container.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  width?: "page" | "hero";
};

export function Container({ children, className, width = "page" }: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        width === "page" ? "max-w-[1280px]" : "max-w-[1440px]",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Button**

Write `src/components/ui/Button.tsx`:
```tsx
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "gradient" | "ghost" | "outline" | "link";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: never;
  };

type LinkProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

const base =
  "inline-flex items-center justify-center rounded-full font-semibold tracking-wide uppercase " +
  "transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-brand-pink focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  gradient:
    "text-white bg-brand-gradient shadow-petal-md hover:-translate-y-0.5 hover:shadow-petal-lg",
  ghost:
    "text-brand-pink bg-white/70 backdrop-blur border border-brand-blush hover:bg-white hover:-translate-y-0.5",
  outline:
    "text-brand-pink border border-brand-pink hover:bg-brand-pink hover:text-white",
  link: "text-brand-pink underline-offset-4 hover:underline px-0 rounded-none",
};

const sizes: Record<Size, string> = {
  sm: "text-[11px] px-4 py-2",
  md: "text-xs px-6 py-3",
  lg: "text-sm px-8 py-3.5",
};

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "gradient", size = "md", className, children } = props;
  const cls = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={cls}
      >
        {children}
      </Link>
    );
  }
  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonProps;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
```

- [ ] **Step 3: IconButton**

Write `src/components/ui/IconButton.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  count?: number;
  children: React.ReactNode;
};

export function IconButton({ label, count, children, className, ...rest }: Props) {
  return (
    <button
      aria-label={count !== undefined ? `${label}, ${count} items` : label}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full",
        "bg-white/70 backdrop-blur border border-brand-blush text-brand-pink",
        "transition-all hover:bg-white hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2",
        className
      )}
      {...rest}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-pink text-white text-[10px] font-bold flex items-center justify-center"
        >
          {count}
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 4: Chip**

Write `src/components/ui/Chip.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Variant = "category" | "count" | "new";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

const variants: Record<Variant, string> = {
  category:
    "bg-white/85 backdrop-blur text-brand-ink-muted border border-brand-blush",
  count: "bg-brand-pink text-white",
  new: "bg-brand-pink text-white shadow-petal-sm",
};

export function Chip({ children, variant = "category", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: GlassCard**

Write `src/components/ui/GlassCard.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "bg-white/85 backdrop-blur-md border border-white/60 rounded-2xl shadow-petal-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Type-check + lint**

```powershell
npx tsc --noEmit
npm run lint
```
Expected: no errors.

- [ ] **Step 7: Commit**

```powershell
git add src/components/ui
git commit -m "feat: UI primitives (Container, Button, IconButton, Chip, GlassCard)"
```

---

## Task 10: Brand components (Logo, ScriptHeading, SectionDivider) + brand helper

**Files:**
- Create: `src/lib/brand.ts`, `src/components/brand/Logo.tsx`, `ScriptHeading.tsx`, `SectionDivider.tsx`

- [ ] **Step 1: brand helper**

Write `src/lib/brand.ts`:
```ts
export const LOGO_FILE: string | null =
  process.env.NEXT_PUBLIC_LOGO_FILE && process.env.NEXT_PUBLIC_LOGO_FILE.trim() !== ""
    ? process.env.NEXT_PUBLIC_LOGO_FILE
    : null;

export const BRAND = {
  name: "Maria Creations",
  tagline: "Handmade flowers crafted with love",
  location: "Madurai, India",
  instagram: "https://instagram.com/mariacreations",
  whatsapp: "https://wa.me/910000000000", // placeholder — user replaces with real number
  email: "hello@mariacreations.in",
};
```

- [ ] **Step 2: Read the next/image doc**

Read first 120 lines of `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`.
Key fact: local images need `width`/`height` props (or static import).

- [ ] **Step 3: Logo**

Write `src/components/brand/Logo.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { LOGO_FILE, BRAND } from "@/lib/brand";

type Props = {
  variant?: "default" | "mark";
  className?: string;
  href?: string;
  priority?: boolean;
};

export function Logo({ variant = "default", className, href = "/", priority = false }: Props) {
  const isMark = variant === "mark";

  const inner = LOGO_FILE ? (
    <Image
      src={LOGO_FILE}
      alt={BRAND.name}
      width={isMark ? 40 : 160}
      height={isMark ? 40 : 48}
      priority={priority}
      className={cn(
        "h-auto w-auto object-contain",
        isMark ? "max-h-10" : "max-h-12"
      )}
    />
  ) : (
    <span
      className={cn(
        "font-script text-brand-pink leading-none",
        isMark ? "text-3xl" : "text-4xl"
      )}
    >
      {isMark ? "M" : BRAND.name}
    </span>
  );

  return (
    <Link
      href={href}
      aria-label={BRAND.name}
      className={cn("inline-flex items-center", className)}
    >
      {inner}
    </Link>
  );
}
```

- [ ] **Step 4: ScriptHeading**

Write `src/components/brand/ScriptHeading.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  ornament?: boolean;
  align?: "left" | "center";
  className?: string;
};

const sizes: Record<NonNullable<Props["as"]>, string> = {
  h1: "text-5xl sm:text-6xl lg:text-7xl",
  h2: "text-4xl sm:text-5xl",
  h3: "text-3xl sm:text-4xl",
};

export function ScriptHeading({
  children,
  as = "h2",
  ornament = false,
  align = "left",
  className,
}: Props) {
  const Tag = as;
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <Tag
        className={cn(
          "font-script text-brand-pink leading-[1] tracking-tight",
          sizes[as]
        )}
      >
        {children}
      </Tag>
      {ornament && (
        <div
          aria-hidden
          className={cn(
            "mt-4 text-brand-pink/60 tracking-[0.8em]",
            align === "center" ? "text-center" : "text-left"
          )}
        >
          ✿ ✿ ✿
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: SectionDivider**

Write `src/components/brand/SectionDivider.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Props = { className?: string };

export function SectionDivider({ className }: Props) {
  return (
    <div
      role="presentation"
      className={cn(
        "flex items-center justify-center gap-4 py-4 text-brand-pink/60",
        className
      )}
    >
      <span className="h-px w-16 bg-brand-blush" />
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <g fill="currentColor">
          <circle cx="11" cy="11" r="2.2" />
          <ellipse cx="11" cy="5"  rx="2.4" ry="3.6" />
          <ellipse cx="11" cy="17" rx="2.4" ry="3.6" />
          <ellipse cx="5"  cy="11" rx="3.6" ry="2.4" />
          <ellipse cx="17" cy="11" rx="3.6" ry="2.4" />
        </g>
      </svg>
      <span className="h-px w-16 bg-brand-blush" />
    </div>
  );
}
```

- [ ] **Step 6: Type-check**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Commit**

```powershell
git add src/lib/brand.ts src/components/brand/Logo.tsx src/components/brand/ScriptHeading.tsx src/components/brand/SectionDivider.tsx
git commit -m "feat: brand components (Logo, ScriptHeading, SectionDivider)"
```

---

## Task 11: Motion infrastructure (MotionProvider, Reveal, PageTransition, FloatingPetals)

**Files:**
- Create: `src/components/motion/MotionProvider.tsx`, `Reveal.tsx`, `PageTransition.tsx`, `src/components/brand/FloatingPetals.tsx`

All four are `"use client"`.

- [ ] **Step 1: MotionProvider**

Write `src/components/motion/MotionProvider.tsx`:
```tsx
"use client";

import { LazyMotion, domAnimation } from "motion/react";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
```

- [ ] **Step 2: Reveal**

Write `src/components/motion/Reveal.tsx`:
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, className }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </m.div>
  );
}
```

- [ ] **Step 3: PageTransition**

Write `src/components/motion/PageTransition.tsx`:
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <m.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
```

- [ ] **Step 4: FloatingPetals**

Write `src/components/brand/FloatingPetals.tsx`:
```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { useMemo } from "react";

type Props = {
  count?: number;
  className?: string;
};

type Petal = {
  left: string;
  top: string;
  duration: number;
  delay: number;
  size: number;
  rotate: number;
  color: string;
};

function makePetals(count: number): Petal[] {
  const colors = ["#ff4f93", "#ff7fb2", "#ffd6e7"];
  return Array.from({ length: count }, (_, i) => ({
    left: `${(i * 97) % 100}%`,
    top: `${(i * 53) % 100}%`,
    duration: 8 + ((i * 7) % 6),
    delay: (i * 1.3) % 5,
    size: 8 + ((i * 5) % 8),
    rotate: -15 + ((i * 11) % 30),
    color: colors[i % colors.length],
  }));
}

export function FloatingPetals({ count = 6, className }: Props) {
  const reduce = useReducedMotion();
  const petals = useMemo(() => makePetals(count), [count]);

  if (reduce) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {petals.map((p, i) => (
        <m.span
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: 0.55,
            boxShadow: `0 0 12px ${p.color}55`,
          }}
          initial={{ y: 0, rotate: 0 }}
          animate={{
            y: [0, -90, 0],
            rotate: [0, p.rotate, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Type-check**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```powershell
git add src/components/motion src/components/brand/FloatingPetals.tsx
git commit -m "feat: motion infrastructure (provider, Reveal, PageTransition, FloatingPetals)"
```

---

## Task 12: Product primitives (ProductPrice, QuantityStepper, CategoryTile)

**Files:**
- Create: `src/components/product/ProductPrice.tsx`, `QuantityStepper.tsx`, `CategoryTile.tsx`

- [ ] **Step 1: ProductPrice (RSC)**

Write `src/components/product/ProductPrice.tsx`:
```tsx
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/cn";

type Props = {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
};

export function ProductPrice({ amount, className, size = "md" }: Props) {
  return (
    <span
      className={cn(
        "font-bold text-brand-ink tabular-nums",
        sizes[size],
        className
      )}
    >
      {formatPrice(amount)}
    </span>
  );
}
```

- [ ] **Step 2: QuantityStepper (Client)**

Write `src/components/product/QuantityStepper.tsx`:
```tsx
"use client";

type Props = {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  min?: number;
};

export function QuantityStepper({ value, onChange, max = 99, min = 1 }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-full border border-brand-blush bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={dec}
        disabled={value <= min}
        className="w-9 h-9 flex items-center justify-center text-brand-pink disabled:opacity-30 hover:bg-brand-cream rounded-l-full"
      >
        −
      </button>
      <span
        aria-live="polite"
        className="min-w-[2.5rem] text-center text-sm font-semibold tabular-nums text-brand-ink"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={inc}
        disabled={value >= max}
        className="w-9 h-9 flex items-center justify-center text-brand-pink disabled:opacity-30 hover:bg-brand-cream rounded-r-full"
      >
        +
      </button>
    </div>
  );
}
```

- [ ] **Step 3: CategoryTile (RSC)**

Write `src/components/product/CategoryTile.tsx`:
```tsx
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types/product";

type Props = { category: Category };

export function CategoryTile({ category }: Props) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group flex flex-col items-center text-center"
    >
      <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-2 border-white shadow-petal-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-petal-md">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 7rem, 8rem"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-brand-ink-muted font-semibold">
        {category.name}
      </p>
    </Link>
  );
}
```

- [ ] **Step 4: Type-check**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```powershell
git add src/components/product/ProductPrice.tsx src/components/product/QuantityStepper.tsx src/components/product/CategoryTile.tsx
git commit -m "feat: ProductPrice, QuantityStepper, CategoryTile components"
```

---

## Task 13: ProductCard + ProductGrid

**Files:**
- Create: `src/components/product/ProductCard.tsx`, `ProductGrid.tsx`

- [ ] **Step 1: ProductCard (Client — heart + add-to-cart)**

Write `src/components/product/ProductCard.tsx`:
```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { Chip } from "@/components/ui/Chip";
import { ProductPrice } from "./ProductPrice";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import type { Product } from "@/types/product";
import { cn } from "@/lib/cn";

type Props = {
  product: Product;
  categoryLabel?: string;
};

export function ProductCard({ product, categoryLabel }: Props) {
  const add = useCartStore((s) => s.add);
  const isWished = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const openCart = useUIStore((s) => s.openCart);
  const reduce = useReducedMotion();

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    add(product.id);
    openCart();
  };

  return (
    <m.article
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative group bg-white rounded-2xl overflow-hidden shadow-petal-sm hover:shadow-petal-md border border-white/60 flex flex-col"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-brand-blush"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.images[0] ?? "/Handmade-1.jpeg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {categoryLabel && (
          <span className="absolute top-3 left-3">
            <Chip variant="category">{categoryLabel}</Chip>
          </span>
        )}
        {outOfStock && (
          <span className="absolute bottom-3 left-3">
            <Chip variant="category">Sold Out</Chip>
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => toggleWish(product.id)}
        aria-label={isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={isWished}
        className={cn(
          "absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full",
          "bg-white/85 backdrop-blur border border-white/60 text-brand-pink shadow-petal-sm",
          "transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
        )}
      >
        {isWished ? "♥" : "♡"}
      </button>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <Link href={`/shop/${product.slug}`}>
            <h3 className="font-semibold text-brand-ink leading-tight hover:text-brand-pink transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-brand-ink-muted line-clamp-2">
            {product.shortDescription}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <ProductPrice amount={product.price} size="md" />
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.1em] px-4 py-2 rounded-full",
              "bg-brand-gradient text-white shadow-petal-sm transition-all",
              "hover:-translate-y-0.5 hover:shadow-petal-md",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
            )}
          >
            {outOfStock ? "Sold" : "Add"}
          </button>
        </div>
      </div>
    </m.article>
  );
}
```

> Note: the `<m.article>` has `relative` so the absolutely-positioned heart button anchors to the card, not the page.

- [ ] **Step 2: ProductGrid (RSC)**

Write `src/components/product/ProductGrid.tsx`:
```tsx
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function ProductGrid({ children, className }: Props) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/product/ProductCard.tsx src/components/product/ProductGrid.tsx
git commit -m "feat: ProductCard (Soft Glass) + ProductGrid"
```

---

## Task 14: ProductGallery

**Files:**
- Create: `src/components/product/ProductGallery.tsx`

- [ ] **Step 1: ProductGallery (Client)**

Write `src/components/product/ProductGallery.tsx`:
```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : ["/Handmade-1.jpeg"];
  const current = safeImages[active] ?? safeImages[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-brand-blush shadow-petal-sm group">
        <Image
          key={current}
          src={current}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {safeImages.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                i === active
                  ? "border-brand-pink shadow-petal-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add src/components/product/ProductGallery.tsx
git commit -m "feat: ProductGallery with thumbnail swap"
```

---

## Task 15: Navbar + MobileMenu

**Files:**
- Create: `src/components/layout/Navbar.tsx`, `MobileMenu.tsx`

- [ ] **Step 1: Navbar (Client — needs scroll listener + store reads)**

Write `src/components/layout/Navbar.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { Container } from "@/components/ui/Container";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const wishCount = useWishlistStore((s) => s.ids.length);
  const openCart = useUIStore((s) => s.openCart);
  const toggleMenu = useUIStore((s) => s.toggleMobileMenu);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "bg-white/85 backdrop-blur-md shadow-petal-sm"
            : "bg-transparent"
        )}
      >
        <Container>
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Logo priority />

            <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-ink hover:text-brand-pink transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                aria-label={`Wishlist, ${wishCount} items`}
                className="hidden sm:inline-flex relative h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur border border-brand-blush text-brand-pink hover:bg-white transition-all"
              >
                ♥
                {wishCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-pink text-white text-[10px] font-bold flex items-center justify-center">
                    {wishCount}
                  </span>
                )}
              </Link>

              <IconButton
                label="Open cart"
                count={cartCount}
                onClick={openCart}
              >
                🛍
              </IconButton>

              <button
                type="button"
                onClick={toggleMenu}
                aria-label="Open menu"
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur border border-brand-blush text-brand-pink"
              >
                ☰
              </button>
            </div>
          </div>
        </Container>
      </header>
      <MobileMenu links={links} />
    </>
  );
}
```

- [ ] **Step 2: MobileMenu (Client)**

Write `src/components/layout/MobileMenu.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { useUIStore } from "@/store/ui";
import { Logo } from "@/components/brand/Logo";

type Props = {
  links: { href: string; label: string }[];
};

export function MobileMenu({ links }: Props) {
  const open = useUIStore((s) => s.isMobileMenuOpen);
  const close = useUIStore((s) => s.closeMobileMenu);
  const pathname = usePathname();

  // Auto-close when the route changes (e.g. user clicked the Logo, which doesn't carry an onClick).
  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-50 bg-brand-cream md:hidden flex flex-col"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between h-16 px-5 border-b border-brand-blush">
            <Logo />
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-white border border-brand-blush text-brand-pink"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-6" aria-label="Mobile primary">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className="font-script text-5xl text-brand-pink hover:opacity-80"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="py-6 text-center text-xs uppercase tracking-[0.3em] text-brand-ink-muted">
            Maria Creations
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Type-check**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/layout/Navbar.tsx src/components/layout/MobileMenu.tsx
git commit -m "feat: Navbar with scroll-blur + MobileMenu overlay"
```

---

## Task 16: Footer

**Files:**
- Create: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Footer (RSC)**

Write `src/components/layout/Footer.tsx`:
```tsx
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/brand/SectionDivider";
import { BRAND } from "@/lib/brand";

const shopLinks = [
  { href: "/shop?category=bouquets", label: "Bouquets" },
  { href: "/shop?category=pipe-cleaner", label: "Pipe Cleaner Flowers" },
  { href: "/shop?category=flower-pots", label: "Flower Pots" },
  { href: "/shop?category=gifts", label: "Floral Gifts" },
  { href: "/shop?category=candle-floral", label: "Candle Florals" },
];

const aboutLinks = [
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
  { href: "/shop", label: "All Products" },
];

export function Footer() {
  return (
    <footer className="mt-24 pt-8 pb-12 bg-white/50 border-t border-brand-blush">
      <Container>
        <SectionDivider className="mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-brand-ink-muted leading-relaxed max-w-xs">
              {BRAND.tagline} — handmade in {BRAND.location}.
            </p>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="About" links={aboutLinks} />

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold mb-4">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-brand-ink-muted">
              <li>
                <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href={BRAND.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${BRAND.email}`} className="hover:text-brand-pink transition-colors">
                  {BRAND.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-brand-blush flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-ink-muted">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="font-script text-lg text-brand-pink">Handmade with love in Madurai</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold mb-4">
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-brand-ink-muted">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-brand-pink transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add src/components/layout/Footer.tsx
git commit -m "feat: Footer with shop/about/connect columns + brand mark"
```

---

## Task 17: CartDrawer

**Files:**
- Create: `src/components/layout/CartDrawer.tsx`

- [ ] **Step 1: CartDrawer (Client)**

Write `src/components/layout/CartDrawer.tsx`:
```tsx
"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { products } from "@/data/products";
import { ProductPrice } from "@/components/product/ProductPrice";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const open = useUIStore((s) => s.isCartOpen);
  const close = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const lineItems = useMemo(
    () =>
      items
        .map((i) => {
          const product = products.find((p) => p.id === i.productId);
          return product ? { ...i, product } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [items]
  );

  const subtotal = lineItems.reduce(
    (sum, l) => sum + l.product.price * l.quantity,
    0
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-brand-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <m.aside
            key="drawer"
            role="dialog"
            aria-label="Shopping cart"
            className="fixed z-50 bg-white shadow-petal-lg flex flex-col
              inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl
              sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md sm:max-h-none sm:rounded-l-3xl sm:rounded-t-none"
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <header className="flex items-center justify-between px-6 py-5 border-b border-brand-blush">
              <h2 className="font-script text-3xl text-brand-pink">Your Cart</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close cart"
                className="h-9 w-9 rounded-full bg-brand-cream border border-brand-blush text-brand-pink"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lineItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="font-script text-4xl text-brand-pink mb-3">Empty</p>
                  <p className="text-sm text-brand-ink-muted mb-6">
                    Your cart hasn't met a flower yet 🌸
                  </p>
                  <Button href="/shop" variant="gradient" size="md" >
                    Browse the Shop
                  </Button>
                </div>
              ) : (
                <ul className="space-y-5">
                  {lineItems.map((l) => (
                    <li key={l.productId} className="flex gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-brand-blush">
                        <Image
                          src={l.product.images[0] ?? "/Handmade-1.jpeg"}
                          alt={l.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${l.product.slug}`}
                          onClick={close}
                          className="font-semibold text-sm text-brand-ink hover:text-brand-pink"
                        >
                          {l.product.name}
                        </Link>
                        <div className="mt-1 text-xs text-brand-ink-muted">
                          <ProductPrice amount={l.product.price} size="sm" />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <QuantityStepper
                            value={l.quantity}
                            onChange={(q) => setQty(l.productId, q)}
                            max={l.product.stock || 99}
                          />
                          <button
                            type="button"
                            onClick={() => remove(l.productId)}
                            className="text-xs text-brand-ink-muted hover:text-brand-pink underline-offset-2 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lineItems.length > 0 && (
              <footer className="border-t border-brand-blush px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.15em] text-brand-ink-muted">
                    Subtotal
                  </span>
                  <ProductPrice amount={subtotal} size="lg" />
                </div>
                <Button href="/checkout" variant="gradient" size="lg" className="w-full">
                  Checkout
                </Button>
                <p className="text-[10px] text-center text-brand-ink-muted">
                  Shipping calculated at the next step.
                </p>
              </footer>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Type-check**

```powershell
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```powershell
git add src/components/layout/CartDrawer.tsx
git commit -m "feat: CartDrawer (slide right on desktop, bottom sheet on mobile)"
```

---

## Task 18: Storefront route group layout

**Files:**
- Create: `src/app/(storefront)/layout.tsx`

- [ ] **Step 1: Read the Next.js docs for route groups + layouts**

Read: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md` (full file — short).
Read: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md` (first ~80 lines).

Confirm:
- `(folder)` brackets exclude the segment from the URL while still nesting a layout
- A route-group layout does NOT include `<html>`/`<body>` — those belong only in the root layout

- [ ] **Step 2: Write the storefront layout**

Write `src/app/(storefront)/layout.tsx`:
```tsx
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PageTransition } from "@/components/motion/PageTransition";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartDrawer />
    </MotionProvider>
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add src/app/(storefront)/layout.tsx
git commit -m "feat: storefront route-group layout (Navbar + Footer + CartDrawer)"
```

---

## Task 19: Home page

**Files:**
- Create: `src/app/(storefront)/page.tsx`

- [ ] **Step 1: Write the home page**

Write `src/app/(storefront)/page.tsx`:
```tsx
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { SectionDivider } from "@/components/brand/SectionDivider";
import { FloatingPetals } from "@/components/brand/FloatingPetals";
import { CategoryTile } from "@/components/product/CategoryTile";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/motion/Reveal";
import { categories } from "@/data/categories";
import { getFeaturedProducts } from "@/data/products";

const categoryLabels: Record<string, string> = {
  bouquets: "BOUQUETS",
  "pipe-cleaner": "PIPE CLEANER",
  "flower-pots": "FLOWER POTS",
  gifts: "GIFTS",
  "candle-floral": "CANDLE FLORAL",
};

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* === HERO === */}
      <section className="relative">
        <Container width="hero">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16 lg:py-24">
            <div className="relative">
              <FloatingPetals count={6} className="hidden lg:block" />
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-brand-ink-muted mb-4 font-semibold">
                Est. Madurai · Handmade
              </p>
              <ScriptHeading as="h1">Maria Creations</ScriptHeading>
              <p className="mt-6 max-w-md text-base sm:text-lg text-brand-ink-muted leading-relaxed">
                Handmade flowers crafted with love — one petal at a time, made just for you.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/shop" variant="gradient" size="lg">Shop Now</Button>
                <Button href="/shop" variant="ghost" size="lg">Collections</Button>
              </div>
            </div>

            <div className="relative aspect-[4/5] lg:aspect-square rounded-3xl overflow-hidden shadow-petal-lg">
              <Image
                src="/Handmade-1.jpeg"
                alt="Handmade bouquet"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-5 right-5">
                <Chip variant="new">New · Bouquets</Chip>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <SectionDivider />

      {/* === SHOP BY CATEGORY === */}
      <section className="py-12 lg:py-20">
        <Container>
          <Reveal>
            <ScriptHeading as="h2" align="center" ornament>
              Shop by Category
            </ScriptHeading>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.05}>
                <CategoryTile category={c} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <SectionDivider />

      {/* === FEATURED === */}
      <section className="py-12 lg:py-20">
        <Container>
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <ScriptHeading as="h2">Featured Bouquets</ScriptHeading>
              <Button href="/shop" variant="link" size="sm">View all →</Button>
            </div>
          </Reveal>
          <ProductGrid>
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <ProductCard
                  product={p}
                  categoryLabel={categoryLabels[p.category]}
                />
              </Reveal>
            ))}
          </ProductGrid>
        </Container>
      </section>

      <SectionDivider />

      {/* === BRAND STORY === */}
      <section className="py-12 lg:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-petal-md">
                <Image
                  src="/Handmade-2.jpeg"
                  alt="Behind the scenes at Maria Creations"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted mb-3 font-semibold">
                Handmade with Love
              </p>
              <ScriptHeading as="h2">Made just for you</ScriptHeading>
              <p className="mt-6 text-base text-brand-ink-muted leading-relaxed">
                Every bloom is shaped by hand in our Madurai studio — no two are ever exactly alike.
                We use pipe cleaners, soft fabrics, and a quiet patience to make pieces that last
                far longer than the bouquets they were inspired by.
              </p>
              <p className="mt-4 text-base text-brand-ink-muted leading-relaxed">
                Whether it's a single rose or a candle wrapped in petals — it's made just for you.
              </p>
              <div className="mt-8">
                <Button href="/about" variant="outline" size="md">Our Story</Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <SectionDivider />

      {/* === INSTAGRAM STRIP === */}
      <section className="py-12 lg:py-16">
        <Container>
          <Reveal>
            <div className="text-center mb-8">
              <ScriptHeading as="h2" align="center">@mariacreations</ScriptHeading>
              <p className="mt-3 text-sm text-brand-ink-muted">Follow along for new blooms and behind-the-scenes</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <a
                key={i}
                href="https://instagram.com/mariacreations"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-2xl overflow-hidden group"
              >
                <Image
                  src={i % 2 === 0 ? "/Handmade-1.jpeg" : "/Handmade-2.jpeg"}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-brand-pink/0 group-hover:bg-brand-pink/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold uppercase tracking-[0.2em] transition-opacity">
                    @mariacreations
                  </span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* === FINAL CTA === */}
      <section className="my-12 lg:my-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 lg:p-14 text-center text-white shadow-petal-lg">
            <FloatingPetals count={4} />
            <h2 className="relative font-script text-5xl sm:text-6xl text-white leading-none">
              Explore the collection
            </h2>
            <p className="relative mt-4 text-white/90 text-base">A bloom for every story.</p>
            <div className="relative mt-8 flex justify-center">
              <Button href="/shop" variant="ghost" size="lg" className="bg-white text-brand-pink border-white">
                Shop Now
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Start dev server and visit /**

Run (background):
```powershell
npm run dev
```
Visit `http://localhost:4000/`. Expected: full home page with hero, categories, featured products, brand story, IG strip, CTA band. Verify:
- Hero text + image side-by-side on desktop; stacked on mobile
- Floating petals animate in hero left panel
- Featured product cards render with images, name, price, add button
- Section dividers visible between sections
- Footer shows at the bottom

**If the heart on a product card is positioned weirdly, fix `ProductCard.tsx` by ensuring the `<m.article>` is the relative-positioned container.** The heart uses `absolute top-3 right-3` so its parent must establish positioning.

- [ ] **Step 3: Test cart interaction**

In the browser:
1. Click "Add" on a featured product → cart drawer should slide in from the right with the item
2. Bump quantity → number updates
3. Click ♥ on a product → heart fills; navbar wishlist count increments
4. Refresh the page → cart and wishlist counts persist

- [ ] **Step 4: Mobile check**

Resize browser to ~390px wide. Verify:
- Hero stacks (text first)
- Navbar shows hamburger; click → full-screen menu opens with script links
- Cart drawer becomes a bottom sheet instead of side drawer

- [ ] **Step 5: Type-check + lint**

```powershell
npx tsc --noEmit
npm run lint
```
Expected: no errors.

- [ ] **Step 6: Commit**

```powershell
git add src/app/(storefront)/page.tsx
git commit -m "feat: Home page (hero, categories, featured, story, IG, CTA)"
```

---

## Task 20: Shop listing page

**Files:**
- Create: `src/app/(storefront)/shop/page.tsx`, `src/components/product/ShopControls.tsx`

- [ ] **Step 1: Write ShopControls (Client — needs router for URL writes)**

Write `src/components/product/ShopControls.tsx`:
```tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { categories } from "@/data/categories";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "newest", label: "Newest" },
] as const;

export function ShopControls() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const activeCategory = params.get("category") ?? "all";
  const activeSort = params.get("sort") ?? "featured";

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "all" || value === "featured") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const qs = next.toString();
      router.push(qs ? `${path}?${qs}` : path);
    },
    [params, router, path]
  );

  return (
    <div className="sticky top-16 lg:top-20 z-30 bg-brand-cream/85 backdrop-blur-md py-4 -mx-5 sm:-mx-8 px-5 sm:px-8 border-b border-brand-blush">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
          <CatChip
            label="All"
            active={activeCategory === "all"}
            onClick={() => setParam("category", null)}
          />
          {categories.map((c) => (
            <CatChip
              key={c.slug}
              label={c.name}
              active={activeCategory === c.slug}
              onClick={() => setParam("category", c.slug)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <label htmlFor="sort" className="text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-semibold">
            Sort:
          </label>
          <select
            id="sort"
            value={activeSort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="bg-white border border-brand-blush rounded-full px-4 py-2 text-sm text-brand-ink font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function CatChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] transition-all border",
        active
          ? "bg-brand-pink text-white border-brand-pink shadow-petal-sm"
          : "bg-white/85 text-brand-ink-muted border-brand-blush hover:bg-white"
      )}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 2: Read the page.md doc for searchParams**

Read: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` (first 120 lines).
Confirm: `searchParams` is `Promise<{ [k: string]: string | string[] | undefined }>` and must be awaited.

- [ ] **Step 3: Write the shop page (Server Component)**

Write `src/app/(storefront)/shop/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ShopControls } from "@/components/product/ShopControls";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { sortProducts, type SortKey } from "@/lib/sortProducts";
import { filterProducts } from "@/lib/filterProducts";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full collection of Maria Creations handmade flowers, candles, and gifts.",
};

const categoryLabels: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.slug, c.name.toUpperCase()])
);

const VALID_SORTS: SortKey[] = ["featured", "price-asc", "price-desc", "newest"];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category;
  const sort = (VALID_SORTS.includes(sp.sort as SortKey) ? sp.sort : "featured") as SortKey;

  const filtered = filterProducts(products, category);
  const sorted = sortProducts(filtered, sort);

  const categoryLabel =
    category && category !== "all"
      ? categories.find((c) => c.slug === category)?.name
      : null;

  return (
    <Container className="py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.2em] text-brand-ink-muted mb-3">
        <Link href="/" className="hover:text-brand-pink">Home</Link>
        <span className="mx-2">›</span>
        <span>Shop</span>
        {categoryLabel && (
          <>
            <span className="mx-2">›</span>
            <span className="text-brand-ink">{categoryLabel}</span>
          </>
        )}
      </nav>

      <ScriptHeading as="h1">
        {categoryLabel ?? "The Collection"}
      </ScriptHeading>

      <p className="mt-3 text-brand-ink-muted max-w-xl text-sm">
        {categoryLabel
          ? categories.find((c) => c.slug === category)?.description
          : "Every piece in our collection is handmade in Madurai. Browse by category or sort to find your favourite."}
      </p>

      <div className="mt-8">
        <ShopControls />
      </div>

      <div className="mt-8">
        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-script text-5xl text-brand-pink mb-3">Empty meadow</p>
            <p className="text-sm text-brand-ink-muted mb-6">
              No flowers match those filters yet 🌸
            </p>
            <Link
              href="/shop"
              className="inline-block text-brand-pink underline-offset-4 hover:underline text-sm font-semibold"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <ProductGrid>
            {sorted.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                categoryLabel={categoryLabels[p.category]}
              />
            ))}
          </ProductGrid>
        )}
      </div>
    </Container>
  );
}
```

- [ ] **Step 4: Verify in browser**

Restart dev server if needed. Visit:
- `/shop` — all 12 products, "Featured" sort
- `/shop?category=bouquets` — only 3 bouquets, breadcrumb shows "Bouquets"
- `/shop?sort=price-asc` — products sorted ascending price
- `/shop?category=garbage` — empty state with "Clear filters" link

Verify the chip and sort dropdown update the URL when clicked.

- [ ] **Step 5: Type-check + lint**

```powershell
npx tsc --noEmit
npm run lint
```
Expected: no errors.

- [ ] **Step 6: Commit**

```powershell
git add src/components/product/ShopControls.tsx src/app/(storefront)/shop/page.tsx
git commit -m "feat: shop listing page with URL-driven filter + sort"
```

---

## Task 21: Product detail page

**Files:**
- Create: `src/app/(storefront)/shop/[slug]/page.tsx`, `src/components/product/AddToCartControls.tsx`

- [ ] **Step 1: AddToCartControls (Client)**

Write `src/components/product/AddToCartControls.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "./QuantityStepper";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";

type Props = {
  productId: string;
  stock: number;
};

export function AddToCartControls({ productId, stock }: Props) {
  const [qty, setQty] = useState(1);
  const add = useCartStore((s) => s.add);
  const openCart = useUIStore((s) => s.openCart);
  const router = useRouter();
  const outOfStock = stock <= 0;

  const handleAdd = () => {
    add(productId, qty);
    openCart();
  };

  const handleBuy = () => {
    add(productId, qty);
    router.push("/checkout");
  };

  return (
    <div className="space-y-5">
      {!outOfStock && (
        <div className="flex items-center gap-4">
          <label className="text-xs uppercase tracking-[0.2em] text-brand-ink-muted font-semibold">
            Quantity
          </label>
          <QuantityStepper value={qty} onChange={setQty} max={stock} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="gradient"
          size="lg"
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex-1"
        >
          {outOfStock ? "Sold Out" : "Add to Cart"}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleBuy}
          disabled={outOfStock}
          className="flex-1"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the product detail page**

Write `src/app/(storefront)/shop/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Chip } from "@/components/ui/Chip";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { SectionDivider } from "@/components/brand/SectionDivider";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AddToCartControls } from "@/components/product/AddToCartControls";
import {
  products,
  getProductBySlug,
  getRelatedProducts,
} from "@/data/products";
import { categories } from "@/data/categories";

type Params = { slug: string };

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Not found" };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.category);
  const related = getRelatedProducts(product.id, product.category, 4);

  return (
    <Container className="py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.2em] text-brand-ink-muted mb-6">
        <Link href="/" className="hover:text-brand-pink">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/shop" className="hover:text-brand-pink">Shop</Link>
        {category && (
          <>
            <span className="mx-2">›</span>
            <Link
              href={`/shop?category=${category.slug}`}
              className="hover:text-brand-pink"
            >
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="flex flex-col gap-6">
          {category && <Chip variant="category">{category.name}</Chip>}
          <ScriptHeading as="h1">{product.name}</ScriptHeading>
          <ProductPrice amount={product.price} size="lg" />
          <p className="text-brand-ink-muted leading-relaxed">
            {product.shortDescription}
          </p>

          {product.handmadeDetails.length > 0 && (
            <div className="mt-2 pt-6 border-t border-brand-blush">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-ink-muted font-semibold mb-3">
                Handmade Details
              </p>
              <ul className="space-y-2">
                {product.handmadeDetails.map((detail, i) => (
                  <li key={i} className="flex gap-3 text-sm text-brand-ink">
                    <span className="text-brand-pink flex-shrink-0">✿</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-2 pt-6 border-t border-brand-blush">
            <AddToCartControls productId={product.id} stock={product.stock} />
            {product.stock > 0 && product.stock < 5 && (
              <p className="mt-3 text-xs text-brand-pink font-semibold">
                Only {product.stock} left — made by hand, limited quantity
              </p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <SectionDivider className="my-16" />
          <ScriptHeading as="h2">You may also love</ScriptHeading>
          <div className="mt-8">
            <ProductGrid>
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  categoryLabel={categories.find((c) => c.slug === p.category)?.name.toUpperCase()}
                />
              ))}
            </ProductGrid>
          </div>
        </>
      )}
    </Container>
  );
}
```

- [ ] **Step 3: Verify in browser**

Visit:
- `/shop/rose-garden-bouquet` → gallery, info, related products
- Click a thumbnail → main image swaps
- Bump quantity → updates
- Click "Add to Cart" → drawer opens with the right qty
- Click "Buy Now" → adds and navigates to /checkout
- Visit `/shop/nonexistent` → renders the Next.js default 404

- [ ] **Step 4: Type-check + lint**

```powershell
npx tsc --noEmit
npm run lint
```
Expected: no errors.

- [ ] **Step 5: Commit**

```powershell
git add src/components/product/AddToCartControls.tsx src/app/(storefront)/shop/[slug]/page.tsx
git commit -m "feat: product detail page with gallery + related products"
```

---

## Task 22: About + Contact pages

**Files:**
- Create: `src/app/(storefront)/about/page.tsx`, `src/app/(storefront)/contact/page.tsx`

- [ ] **Step 1: About page**

Write `src/app/(storefront)/about/page.tsx`:
```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { SectionDivider } from "@/components/brand/SectionDivider";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${BRAND.name} — handmade flowers crafted with love in ${BRAND.location}.`,
};

const values = [
  {
    title: "Handmade with patience",
    body: "Every petal, leaf, and stem is shaped by hand. We don't cut corners — we shape them.",
  },
  {
    title: "Made to last",
    body: "Our blooms never wilt. Pieces from years ago still look the way they did the day they were made.",
  },
  {
    title: "Small batch, on purpose",
    body: "We keep stock low so every piece gets full attention. If it's listed, it's been loved into being.",
  },
];

export default function AboutPage() {
  return (
    <Container className="py-12 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted mb-3 font-semibold">
          Our Story
        </p>
        <ScriptHeading as="h1">A boutique made by hand</ScriptHeading>
        <p className="mt-6 text-lg text-brand-ink-muted leading-relaxed">
          Maria Creations started in a small studio in {BRAND.location}, with a few pipe cleaners,
          a roll of satin ribbon, and the stubborn idea that flowers shouldn't have to wilt.
        </p>
        <p className="mt-4 text-base text-brand-ink-muted leading-relaxed">
          What began as a quiet passion has grown into a small collection of bouquets, candles,
          and gifts — each one made by hand, each one a little different from the last. We're
          glad you're here.
        </p>
      </div>

      <SectionDivider className="my-16" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-petal-md">
            <Image
              src="/Handmade-2.jpeg"
              alt="Maria in the studio"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted mb-3 font-semibold">
            Made by Maria
          </p>
          <ScriptHeading as="h2">Meet the maker</ScriptHeading>
          <p className="mt-6 text-base text-brand-ink-muted leading-relaxed">
            Hi, I'm Maria — the hands behind every piece. I learned to make pipe-cleaner flowers
            from my grandmother as a child, and I haven't really stopped since.
          </p>
          <p className="mt-4 text-base text-brand-ink-muted leading-relaxed">
            If there's a colour, size, or arrangement you're dreaming of that you don't see in the
            shop, message me on Instagram or WhatsApp — I love a custom request.
          </p>
        </Reveal>
      </div>

      <SectionDivider className="my-16" />

      <div>
        <ScriptHeading as="h2" align="center" ornament>What we believe</ScriptHeading>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.05}>
              <div className="bg-white/85 rounded-2xl p-8 shadow-petal-sm border border-white/60 h-full">
                <p className="text-brand-pink text-3xl mb-3">✿</p>
                <h3 className="font-script text-3xl text-brand-pink mb-3">{v.title}</h3>
                <p className="text-sm text-brand-ink-muted leading-relaxed">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <Button href="/shop" variant="gradient" size="lg">Browse the Collection</Button>
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Contact page**

Write `src/app/(storefront)/contact/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${BRAND.name} — handmade flowers from ${BRAND.location}.`,
};

const channels = [
  {
    label: "Instagram",
    value: "@mariacreations",
    href: BRAND.instagram,
    external: true,
  },
  {
    label: "WhatsApp",
    value: "Message us",
    href: BRAND.whatsapp,
    external: true,
  },
  {
    label: "Email",
    value: BRAND.email,
    href: `mailto:${BRAND.email}`,
    external: false,
  },
  {
    label: "Studio",
    value: BRAND.location,
    href: null,
    external: false,
  },
];

export default function ContactPage() {
  return (
    <Container className="py-12 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted mb-3 font-semibold">
          Say hello
        </p>
        <ScriptHeading as="h1">Let's chat</ScriptHeading>
        <p className="mt-6 text-base text-brand-ink-muted leading-relaxed">
          Whether you're placing a custom order, asking about delivery, or just want to talk
          flowers — we'd love to hear from you. Pick whichever channel works best.
        </p>
      </div>

      <GlassCard className="mt-12 p-8 lg:p-12 max-w-2xl">
        <ul className="space-y-6">
          {channels.map((c) => (
            <li key={c.label} className="flex items-center justify-between gap-4 pb-6 border-b border-brand-blush last:border-b-0 last:pb-0">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-ink-muted font-semibold mb-1">
                  {c.label}
                </p>
                <p className="text-lg text-brand-ink font-medium">{c.value}</p>
              </div>
              {c.href && (
                <a
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="text-brand-pink text-2xl"
                  aria-label={`Open ${c.label}`}
                >
                  →
                </a>
              )}
            </li>
          ))}
        </ul>
      </GlassCard>

      <p className="mt-10 text-center text-brand-ink-muted text-sm">
        A contact form is coming soon 🌸
      </p>
    </Container>
  );
}
```

- [ ] **Step 3: Verify in browser**

Visit `/about` and `/contact`. Verify both render with navbar + footer, page transitions work, mobile responsive.

- [ ] **Step 4: Type-check + lint**

```powershell
npx tsc --noEmit
npm run lint
```
Expected: no errors.

- [ ] **Step 5: Commit**

```powershell
git add src/app/(storefront)/about/page.tsx src/app/(storefront)/contact/page.tsx
git commit -m "feat: About + Contact pages"
```

---

## Task 23: Checkout stub

**Files:**
- Create: `src/app/checkout/page.tsx`, `src/components/checkout/CheckoutPreview.tsx`

Checkout is NOT inside the `(storefront)` route group — Phase 2 may swap layouts. For Phase 1 it still uses the same Navbar/Footer but mounted explicitly.

- [ ] **Step 1: CheckoutPreview (Client — reads cart)**

Write `src/components/checkout/CheckoutPreview.tsx`:
```tsx
"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { products } from "@/data/products";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Button } from "@/components/ui/Button";

export function CheckoutPreview() {
  const items = useCartStore((s) => s.items);

  const lineItems = useMemo(
    () =>
      items
        .map((i) => {
          const product = products.find((p) => p.id === i.productId);
          return product ? { ...i, product } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [items]
  );

  const subtotal = lineItems.reduce(
    (sum, l) => sum + l.product.price * l.quantity,
    0
  );

  if (lineItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-script text-5xl text-brand-pink mb-3">Empty cart</p>
        <p className="text-sm text-brand-ink-muted mb-8">
          Add a few flowers before checking out 🌸
        </p>
        <Button href="/shop" variant="gradient" size="lg">Browse the Shop</Button>
      </div>
    );
  }

  return (
    <div className="bg-white/85 rounded-2xl p-6 lg:p-8 shadow-petal-sm border border-white/60">
      <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold mb-6">
        Your cart preview
      </h2>
      <ul className="divide-y divide-brand-blush">
        {lineItems.map((l) => (
          <li key={l.productId} className="flex gap-4 py-4">
            <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-brand-blush">
              <Image
                src={l.product.images[0] ?? "/Handmade-1.jpeg"}
                alt={l.product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-ink text-sm">{l.product.name}</p>
                <p className="text-xs text-brand-ink-muted">Qty {l.quantity}</p>
              </div>
              <ProductPrice amount={l.product.price * l.quantity} size="sm" />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-6 border-t border-brand-blush flex items-center justify-between">
        <span className="text-sm uppercase tracking-[0.15em] text-brand-ink-muted">Subtotal</span>
        <ProductPrice amount={subtotal} size="lg" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Checkout page**

Write `src/app/checkout/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your handmade flower order and complete payment.",
};

export default function CheckoutPage() {
  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1">
        <Container className="py-12 lg:py-20 max-w-2xl">
          <div className="text-center">
            <ScriptHeading as="h1" align="center" ornament>
              Checkout opens soon 🌸
            </ScriptHeading>
            <p className="mt-6 text-base text-brand-ink-muted leading-relaxed">
              We're finishing up the secure checkout experience. Your cart is saved — come back
              any time and it'll be waiting for you. For urgent orders, message us on Instagram
              or WhatsApp.
            </p>
          </div>

          <div className="mt-12">
            <CheckoutPreview />
          </div>

          <div className="mt-10 flex justify-center">
            <Button href="/shop" variant="gradient" size="lg">Continue shopping</Button>
          </div>
        </Container>
      </main>
      <Footer />
      <CartDrawer />
    </MotionProvider>
  );
}
```

- [ ] **Step 3: Verify in browser**

Visit `/checkout`. Verify:
- With items in cart → preview shows them with line totals and subtotal
- Empty cart → empty state with "Browse the Shop" button
- Navbar + Footer present
- "Continue shopping" returns to `/shop`

- [ ] **Step 4: Type-check + lint**

```powershell
npx tsc --noEmit
npm run lint
```
Expected: no errors.

- [ ] **Step 5: Commit**

```powershell
git add src/components/checkout/CheckoutPreview.tsx src/app/checkout/page.tsx
git commit -m "feat: checkout stub with cart preview (Phase 1 placeholder)"
```

---

## Task 24: SEO files — robots.ts, sitemap.ts, opengraph-image

**Files:**
- Create: `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/opengraph-image.tsx`

- [ ] **Step 1: Read metadata file conventions doc**

Read: `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` (first 100 lines).
Confirm: `robots.ts`, `sitemap.ts` go in `app/` root and return typed objects.

- [ ] **Step 2: Pick a canonical site URL**

For Phase 1 we don't have a production domain yet. Use `process.env.NEXT_PUBLIC_SITE_URL` with a localhost fallback. Add to `.env.example` and `.env.local`:

Append to `.env.example`:
```
# Canonical site URL — set to your production domain when deploying
NEXT_PUBLIC_SITE_URL=http://localhost:4000
```

Append to `.env.local`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:4000
```

- [ ] **Step 3: Update root layout `metadataBase` to read the env var**

Edit `src/app/layout.tsx` — change the metadata `metadataBase` line to:
```tsx
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000"),
```

- [ ] **Step 4: Write robots.ts**

Write `src/app/robots.ts`:
```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
```

- [ ] **Step 5: Write sitemap.ts**

Write `src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/shop?category=${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
```

- [ ] **Step 6: Write opengraph-image.tsx (default OG)**

Write `src/app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Maria Creations · Handmade Flowers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #ffd6e7 0%, #fff7fa 50%, #ff7fb2 100%)",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 36, color: "#ff4f93", letterSpacing: 16, marginBottom: 24 }}>
          ✿ ✿ ✿
        </div>
        <div
          style={{
            fontSize: 140,
            fontStyle: "italic",
            color: "#ff4f93",
            lineHeight: 1,
          }}
        >
          Maria Creations
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: "#6b3a4d",
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          Handmade flowers · Madurai
        </div>
      </div>
    ),
    { ...size }
  );
}
```

> Note: `next/og` ships a built-in `ImageResponse`. The italic serif fallback approximates the brand script in OG previews; no extra font loading needed.

- [ ] **Step 7: Verify**

Restart dev. Visit:
- `http://localhost:4000/robots.txt` → see allow/disallow rules
- `http://localhost:4000/sitemap.xml` → see all routes
- `http://localhost:4000/opengraph-image` → see generated OG PNG

- [ ] **Step 8: Type-check + lint**

```powershell
npx tsc --noEmit
npm run lint
```
Expected: no errors.

- [ ] **Step 9: Commit**

```powershell
git add src/app/robots.ts src/app/sitemap.ts src/app/opengraph-image.tsx src/app/layout.tsx .env.example
git commit -m "feat: SEO basics (robots, sitemap, default OG, site URL env var)"
```

---

## Task 25: Final QA — build, lint, type-check, Lighthouse, responsive verify

**No new files** — verification only. Fix any issues that surface, then commit any cleanups.

- [ ] **Step 1: Production build**

```powershell
npm run build
```
Expected: build succeeds. Pay attention to:
- "Server" vs "Client" component warnings (none expected for our boundaries)
- Image optimization warnings (use `priority` on hero/first image only — already done)
- Metadata warnings (none expected)
- Bundle size of the largest client chunk (note it — should be under ~120 KB gzipped)

**If build fails:** read the error carefully. Common causes:
- Importing a Zustand store from a Server Component (move to a Client wrapper)
- Using a hook in a Server Component (split into a Client child)
- `searchParams` / `params` accessed without `await` (Next 16 requires await)

- [ ] **Step 2: Type-check**

```powershell
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 3: Lint**

```powershell
npm run lint
```
Expected: 0 errors and 0 warnings.

- [ ] **Step 4: Run all tests**

```powershell
npm test
```
Expected: all pass (formatPrice, sortProducts, filterProducts, cart, wishlist).

- [ ] **Step 5: Start production server, take a manual responsive tour**

```powershell
npm run start
```
(`npm run build` must have succeeded above.)

In the browser at `http://localhost:4000`, test these breakpoints (Chrome DevTools device toolbar):
- **iPhone 12 / 390×844** — hero stacks, hamburger menu opens, cart drawer is a bottom sheet
- **iPad / 768×1024** — 2-column grids on shop, full nav links visible
- **Desktop / 1440×900** — hero side-by-side, 4-column product grid on shop, full hover states

For each breakpoint, walk the full flow:
1. Land on `/` — hero loads, petals animate (or don't if you set `prefers-reduced-motion`)
2. Click "Shop Now" → `/shop`
3. Filter by category → URL updates, products filter
4. Sort by price asc → products reorder
5. Click a product → detail page
6. Bump qty to 2, click Add → drawer opens with qty 2
7. Click ♥ on a product → navbar wishlist count increments
8. Open drawer, change qty to 5 → subtotal updates
9. Click Checkout → checkout stub shows cart preview
10. Navigate to `/about` and `/contact` → page transitions animate

- [ ] **Step 6: Lighthouse mobile audit on / and /shop**

Open Chrome DevTools → Lighthouse → Mobile → Performance + Accessibility + Best Practices + SEO → Generate report.

Targets per the spec:
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 95

If Performance < 90: most likely cause is unused JS in the initial chunk or unoptimised images. Check the report's "Opportunities" section for specifics.

If Accessibility < 95: likely a missing aria-label, contrast issue, or a heading-order problem. Fix and re-run.

Record actual scores in the commit message below.

- [ ] **Step 7: Verify `prefers-reduced-motion`**

In Chrome DevTools → Rendering panel → "Emulate CSS media feature prefers-reduced-motion" → reduce. Reload `/`. Expected: floating petals disappear, page transitions skip, scroll reveals render instantly.

- [ ] **Step 8: Commit any fixes from Steps 1-7**

If you made any code changes during QA:
```powershell
git add -A
git commit -m "fix: <specific QA finding>"
```
(Replace `<specific QA finding>` with the actual issue. If no fixes were needed, skip this step.)

- [ ] **Step 9: Final commit with Lighthouse scores**

If no code changes happened, create a tag/note commit:
```powershell
git commit --allow-empty -m "chore: Phase 1 storefront foundation complete

Lighthouse mobile scores (recorded at <date>):
- /        Perf <PP>/100  A11y <AA>/100  BP <BB>/100  SEO <SS>/100
- /shop    Perf <PP>/100  A11y <AA>/100  BP <BB>/100  SEO <SS>/100

Spec: docs/superpowers/specs/2026-05-26-storefront-foundation-design.md
Plan: docs/superpowers/plans/2026-05-26-storefront-foundation.md"
```

---

## Coverage cross-check (self-review)

| Spec section | Implemented in |
|---|---|
| Stack (Next 16, React 19, TW4, motion, zustand, clsx+merge) | Task 1, 2 |
| `@theme` brand tokens + shadows | Task 2 |
| `Great Vibes` + `Quicksand` via `next/font/google` | Task 2 |
| Folder layout | Tasks 3–24 |
| Next 16 doc reading rule | Tasks 2 (fonts), 10 (image), 18 (route group + layout), 20 (page/searchParams), 24 (metadata) |
| Color usage convention (no pink small text) | Task 2 (tokens), Task 9 (Chip variants use ink-muted) |
| Logo via `NEXT_PUBLIC_LOGO_FILE` | Task 10 |
| ScriptHeading + ornament | Task 10 |
| FloatingPetals + reduced motion | Task 11 |
| SectionDivider | Task 10 |
| GlassCard, Button, Chip, IconButton, Container | Task 9 |
| Reveal, PageTransition, MotionProvider | Task 11 |
| Navbar (scroll blur, mobile menu) | Task 15 |
| MobileMenu (focus trap via Escape) | Task 15 |
| Footer | Task 16 |
| CartDrawer (slide-from-right desktop, bottom sheet mobile) | Task 17 |
| Storefront `(storefront)` route group layout | Task 18 |
| Home (hero, category row, featured, story, IG strip, CTA) | Task 19 |
| Shop listing (URL-driven filter + sort, empty state) | Task 20 |
| Product detail (gallery, info, related, 404) | Task 21 |
| About + Contact | Task 22 |
| Checkout stub | Task 23 |
| Cart store (add/remove/setQty/clear) + persist | Task 6 |
| Wishlist store (toggle) + persist | Task 7 |
| UI store (drawer/menu) | Task 8 |
| Product/Category types | Task 3 |
| Seed: 5 categories + 12 products | Task 4 |
| `formatPrice` (INR, no decimals) | Task 3 |
| `sortProducts` (featured/asc/desc/newest) | Task 5 |
| `filterProducts` | Task 5 |
| SEO metadata + robots + sitemap + OG | Task 24 |
| Mobile responsiveness | Tasks 15, 17, 19, 20, 25 |
| `prefers-reduced-motion` | Tasks 11 (Reveal, PageTransition, FloatingPetals), 25 |
| Build + lint pass | Task 25 |
| Lighthouse mobile targets | Task 25 |
