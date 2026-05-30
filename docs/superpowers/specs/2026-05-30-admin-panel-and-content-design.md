# Maria Creations — Phase 3: Admin Panel + Content Management + Polish

**Date:** 2026-05-30
**Status:** Approved design (pre-implementation)
**Scope:** Phase 3 of 4. Builds on Phases 1 (storefront) and 2 (orders + payment).
**Predecessors:** [`2026-05-26-storefront-foundation-design.md`](./2026-05-26-storefront-foundation-design.md), [`2026-05-28-order-payment-flow-design.md`](./2026-05-28-order-payment-flow-design.md).

---

## 1. Purpose

Move the boutique from "developer edits seed files" to "owner runs the shop." Maria logs in to a responsive admin panel and can:

- Verify customer payments and progress orders through the fulfillment workflow.
- Manage the product catalog (CRUD + multi-image upload).
- Manage categories (CRUD + drag-to-reorder).
- Edit the About page copy/image and the home Hero image + text.
- Watch dashboard tiles surface what needs attention (pending verification, out-of-stock).

The storefront stops reading from `src/data/*.ts` and reads from MongoDB instead. The seed files are deleted; a one-time migration script is provided as opt-in. Storefront pages handle empty data gracefully.

Cross-cutting polish ships with this phase because it touches the same files: a `sonner` toast system replaces silent success/error states across cart/wishlist/checkout/admin, and a `cursor-pointer` audit closes any gaps on interactive elements.

---

## 2. Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Admin auth | Env-based credentials, `jose`-signed HTTP-only cookie, middleware gating |
| Image storage | MongoDB `images` collection (Binary), served via route handler (consistent with Phase 2) |
| Order management depth | Full workflow — verify payment + status transitions Pending → Processing → Shipped → Delivered |
| Admin layout | Left sidebar (responsive — drawer on mobile) |
| Toast library | `sonner` (lightweight, accessible, `toast.promise` API) |
| Content storage | Generic `content` collection, one doc per editable singleton (`about`, `hero`) |
| About editor | Markdown in textarea (no rich editor) |
| Hero editing | Image + eyebrow + tagline + badge fields only (other home sections stay code-driven) |
| Order management routes | Under `/admin/orders` |
| Admin URL root | `/admin` |
| Login URL | `/admin/login` |
| Per-product image upload | Up to 6 images, ≤5MB each (jpeg/png/webp) |
| Seed migration | Opt-in via `scripts/seedCatalog.ts` — user chooses to run or skip |
| Original seed files | **Deleted** at end of phase |

---

## 3. Architecture & Stack

### New dependencies
- **`jose`** — sign + verify the admin session cookie; edge-runtime safe for middleware.
- **`bcryptjs`** — pure-JS bcrypt for hashing the admin password (no native build).
- **`sonner`** — toast system; small, accessible, brand-themable, supports `toast.promise(...)` for async flows.
- **`react-markdown`** — render admin-edited About page Markdown on the public storefront.

### Auth flow
- `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (bcrypt), and `ADMIN_SESSION_SECRET` live in `.env.local`.
- `scripts/hashAdminPassword.ts` is a helper that takes a plain password (CLI arg or stdin) and prints a bcrypt hash for `.env.local`.
- `POST /api/admin/login` — Zod-validates the body, compares the hash, issues an HMAC-signed JWT in an HTTP-only `Secure` cookie `mc-admin-session` (8-hour expiry), returns 200 with `{ ok: true }`.
- **`middleware.ts`** at the project root, `matcher: ['/admin/:path*']`. Logic:
  - Allow `/admin/login` and the login API.
  - Verify the cookie's signature with `jose.jwtVerify` at the edge — invalid/missing → `307` redirect to `/admin/login?next=<original>`.
  - Valid → pass through.
- **Server actions under `/admin`** call a small `requireAdminSession()` helper from a server-only `src/lib/adminSession.ts` that re-checks the cookie before any mutation — defense in depth, because middleware could be misconfigured.
- `POST /api/admin/logout` — clears the cookie and redirects.

### Server actions vs route handlers (Phase 3 conventions)
- **Server actions** for forms with structured input: create/update/delete product, create/update/delete category, save content, mark order paid/rejected, advance/revert order status. One `actions.ts` per admin resource.
- **Route handlers** for what they're better at:
  - Multipart uploads — `POST /api/admin/images` (returns `{ id }`).
  - Authenticated binary serve — `GET /api/admin/payments/[id]` (the Phase 2 deleted route, reintroduced with admin auth).
  - Public binary serve — `GET /api/images/[id]` (long cache).
  - Login + logout — needed because they set/clear cookies via `Response.headers`.

### Next 16 reading rule
Before writing code that touches a Next API, read the matching `node_modules/next/dist/docs/` page:
- `01-app/01-getting-started/16-proxy.md` (middleware) — confirm the matcher syntax, edge-runtime constraints, and `NextRequest`/`NextResponse` patterns.
- `01-app/03-api-reference/04-functions/use-form-state.md` (or `useActionState` if that's the current name in Next 16) — for the form/action wiring.
- Route handler doc already confirmed in Phase 2: `params` is a Promise.
- Server actions doc already confirmed in Phase 2: `"use server"` file-level, async functions, may take typed objects.

### Environment variables (added in this phase)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH` (bcrypt)
- `ADMIN_SESSION_SECRET` (≥32 char random string)

---

## 4. Data Model

Three new collections + one expanded existing collection. No `adminUsers` collection — auth is env-based.

### `products` (new — migrated from `src/data/products.ts`)
```ts
type ProductDoc = {
  _id: ObjectId;
  productId: string;          // "mc-p-001" — stable, admin can edit
  slug: string;                // url-safe, unique
  name: string;
  category: string;            // category slug
  price: number;               // ₹, whole rupees
  images: ObjectId[];          // → images collection (0..6)
  shortDescription: string;
  handmadeDetails: string[];   // bullet points
  stock: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```
**Indexes:** unique `slug`, unique `productId`, index `category`, index `{ featured: -1, createdAt: -1 }`.

### `categories` (new — migrated)
```ts
type CategoryDoc = {
  _id: ObjectId;
  slug: string;                // "bouquets"
  name: string;                // "Handmade Bouquets"
  description: string;
  image: ObjectId | null;      // → images, optional
  order: number;               // display order
  createdAt: Date;
  updatedAt: Date;
};
```
**Indexes:** unique `slug`, index `order`.

### `images` (new — products, categories, content)
```ts
type ImageDoc = {
  _id: ObjectId;
  data: Binary;                // bytes (≤5MB)
  contentType: string;         // "image/jpeg" | "image/png" | "image/webp"
  size: number;
  width?: number;              // optional metadata
  height?: number;
  createdAt: Date;
};
```
Served by `GET /api/images/[id]` with `Cache-Control: public, max-age=31536000, immutable` — image IDs are content-stable.

### `content` (new — singletons)
```ts
type ContentDoc = {
  _id: string;                 // "about" | "hero"
  body?: string;               // Markdown (used by "about")
  image?: ObjectId;            // → images
  fields?: Record<string, string>;  // per-content extra strings
  updatedAt: Date;
};
```
Seeded docs:
- `{ _id: "about", body: <existing About copy as Markdown>, image: <studio image ID>, fields: { eyebrow: "Our Story" } }`
- `{ _id: "hero", image: <hero image ID>, fields: { eyebrow: "Est. Madurai · Handmade", tagline: "Handmade flowers crafted with love — one petal at a time, made just for you.", badgeLabel: "New Arrival", badgeText: "Spring Bouquets" } }`

The About page's "Meet the maker" and "What we believe" sub-sections stay code-driven in Phase 3 (YAGNI — promotable to `content` later).

### `orders` (existing — Phase 2; schema bumps)
- `paymentStatus` gains a `"Rejected"` value.
- New `verification?: { verifiedAt?: Date; rejectedAt?: Date; notes?: string }` sub-doc.
- Status transitions (admin actions):
  - `Verification Pending → Paid` (markPaymentPaid)
  - `Verification Pending → Rejected` (markPaymentRejected)
  - `orderStatus Pending → Processing → Shipped → Delivered` (advanceOrderStatus, each step reversible via revertOrderStatus)

---

## 5. Catalog Migration & Empty States

### Migration mechanics

**One-time seed script `scripts/seedCatalog.ts`** — opt-in. Reads the existing `src/data/products.ts` and `src/data/categories.ts`, inserts the 5 categories + 12 products (with no image references — admin re-uploads real photos), prints the inserted IDs. Run with `npx tsx scripts/seedCatalog.ts --seed`. If skipped, the DB starts blank.

**Replacement data layer — `src/lib/catalog.ts`** preserves the exact function signatures Phase 1 components import:
```ts
export async function getAllProducts(): Promise<Product[]>;
export async function getProductBySlug(slug: string): Promise<Product | undefined>;
export async function getProductsByCategory(slug: string): Promise<Product[]>;
export async function getFeaturedProducts(): Promise<Product[]>;
export async function getRelatedProducts(productId: string, category: string, limit?: number): Promise<Product[]>;
export async function getAllCategories(): Promise<Category[]>;
export async function getCategoryBySlug(slug: string): Promise<Category | undefined>;
```
**Transformation at the boundary:** `catalog.ts` maps the DB shape (`ObjectId[]`) to the public shape (`images: string[]` of `/api/images/<id>` URLs). The `Product` and `Category` TypeScript types stay the same as Phase 1 — only the import line changes in storefront components.

Components that called these synchronously now `await` them. Affected files:
- `src/app/(storefront)/page.tsx` — already async-friendly (server component); just `await getFeaturedProducts()` + `await getAllCategories()`.
- `src/app/(storefront)/shop/page.tsx` — already async.
- `src/app/(storefront)/shop/[slug]/page.tsx` — already async.
- `src/components/layout/Footer.tsx` — currently uses static `shopLinks` literal of category slugs. **Decision:** keep the literal in the footer (the slugs are stable); rename the user-facing labels via DB only if you actually rename a category — that's a rare event and can be a Phase 4 polish. (Avoids making the footer async-fetch on every render.)

### `src/data/` cleanup
At the end of Phase 3:
- `src/data/products.ts` — **deleted**
- `src/data/categories.ts` — **deleted**

The literals only exist in `scripts/seedCatalog.ts` (which is not imported by any runtime code).

### Empty states (storefront)
- **`/`:**
  - "Featured Bouquets" section + its surrounding `SectionDivider` — hidden if `getFeaturedProducts()` returns `[]`.
  - "Shop by Category" row + its surrounding dividers — hidden if `getAllCategories()` returns `[]`.
  - Hero remains (content-managed). Brand story + Instagram strip + final CTA remain.
- **`/shop`:** If 0 products in DB, render "Coming soon — we're putting our first flowers together" + link to `/`. If categories also empty, hide the filter/sort `<ShopControls>`.
- **`/shop?category=X`:** if category has 0 products, show the existing "Empty meadow" state with copy adjusted to "No flowers in this category yet."
- **`/shop/[slug]`:** unchanged — `notFound()` when slug doesn't exist.

### Admin handles empty too
Dashboard tiles show `0` cleanly. Products list / Categories list show "No products yet — add your first" CTAs that route to the create form.

---

## 6. Admin Shell & Routes

### Route map
```
/admin/login                       (NOT gated)
/admin                             dashboard (redirects to /admin/orders if pending verifications)
/admin/orders                      list
/admin/orders/[orderId]            detail + actions
/admin/products                    list + search + filter
/admin/products/new                create form
/admin/products/[id]/edit          edit form
/admin/categories                  list (drag-to-reorder)
/admin/categories/new              create form
/admin/categories/[id]/edit        edit form
/admin/content                     hub
/admin/content/about               About editor
/admin/content/hero                Hero editor
```

### `middleware.ts`
- Matcher `['/admin/:path*']`.
- Allow `/admin/login`; allow `/api/admin/login`.
- Otherwise: verify `mc-admin-session` cookie via `jose.jwtVerify`. Fail → 307 to `/admin/login?next=<pathname+search>`.

### `src/app/admin/layout.tsx` (server)
- Reads session cookie server-side to render admin email + Logout button in the sidebar.
- Mounts: `<AdminSidebar />` (client), `<main>` wrapper, `<AdminToaster />` (client).
- Independent of storefront chrome (no Navbar / Footer / CartDrawer / MotionProvider here).

### Sidebar
- 220px on `lg+`, sticky `top-0 h-screen`.
- Brand wordmark (`Maria · Admin`, script font), then nav items: Dashboard / Orders (badge with pending-verification count) / Products / Categories / Content / Settings (placeholder for Phase 4).
- Active state: brand-gradient pill background, white text.
- Bottom: admin email + Logout `<form>`.

### Responsive
- **`md+`:** sidebar visible.
- **`< md`:** sidebar hidden by default. A top bar (brand + hamburger) replaces it. Hamburger opens the sidebar as a left-slide overlay drawer (motion-animated, backdrop closes on click + Escape, auto-closes on route change — same pattern as the storefront `MobileMenu`).
- Forms collapse to single-column at `< md`.
- `<AdminTable>` switches to "card per row" stack at `< md`.

### Admin styling baseline
- Reuses Phase 1 brand tokens.
- New shared components:
  - `<AdminCard>` — white bg, blush border, padding, optional section title slot.
  - `<AdminButton>` — variants `primary` (gradient), `secondary` (outline pink), `danger` (red border), `ghost`.
  - `<AdminTable>` — desktop table / mobile card-stack. Single component for every list page.
  - `<AdminToaster>` — wraps sonner's `<Toaster>` with brand theme.
  - `<AdminSidebar>` — the sidebar above.
  - `<AdminMobileTopbar>` — the mobile top bar with hamburger.

---

## 7. Admin Pages

### `/admin` — Dashboard
- 4 stat tiles: **Pending verification** · **Paid this week** · **Products live** · **Out of stock**.
- "Recent orders" — last 5, with link to detail.
- "Quick actions": **+ New product**, **+ New category**.

### `/admin/orders` — list
`<AdminTable>` of orders. Columns: Order ID · Customer · Items · Total · Payment Status · Created. Default sort: `createdAt desc`. Filter chips at top: **All · Verify · Paid · Processing · Shipped · Delivered**. Click row → detail.

### `/admin/orders/[orderId]` — detail
- **Left column:** customer info (full name, phone, full address — admin sees everything, no masking), items list with snapshotted prices, total, dates.
- **Right column:** payment screenshot via `<img src="/api/admin/payments/[id]">` (admin-gated), UTR (if provided), payment status badge.
- **Action buttons** (only visible when relevant):
  - `paymentStatus === "Verification Pending"` → **Mark Paid** / **Mark Rejected** + optional **Add note** textarea (saved to `verification.notes`).
  - `orderStatus` → "Advance to <next>" + "Revert" (each transition reversible).

**Server actions:** `markPaymentPaid(orderId, notes?)`, `markPaymentRejected(orderId, notes?)`, `advanceOrderStatus(orderId)`, `revertOrderStatus(orderId)`.

**Route handler:** `GET /api/admin/payments/[id]` — admin-gated (re-checks session); returns 401 otherwise.

### `/admin/products` — list
`<AdminTable>`: thumbnail · Name · Category · Price · Stock · Featured (badge) · Actions (Edit / Delete). Search input filters by name. Category filter chips above the table. "+ New product" CTA.

### `/admin/products/new` and `/admin/products/[id]/edit` — form
RHF + Zod (`productSchema`):
- `name` (required, ≤80)
- `slug` (required, kebab-case, auto-generated from `name` on create, **read-only on edit** — see "Slug immutability" below)
- `category` (required, must reference an existing category slug)
- `price` (required, integer ≥0)
- `stock` (required, integer ≥0)
- `featured` (boolean)
- `shortDescription` (required, ≤200)
- `handmadeDetails` (array of strings, 0..10 rows, add/remove UI)
- `images`: 0..6 image IDs. Multi-upload area:
  - Drag-drop or click-to-pick.
  - Each pick → `POST /api/admin/images` (multipart, ≤5MB, jpeg/png/webp) → returns `{ id }`.
  - Form stores `images: string[]` (ObjectId hex strings).
  - Thumbnails render via `/api/images/[id]`.
  - Reorder via arrow buttons (left/right per thumb) — drag-and-drop deferred to Phase 4 (avoids `@dnd-kit` dep).

Submit → `createProduct` or `updateProduct` server action. Both validate via `productSchema`. Delete (edit page only) → `deleteProduct` action, gated by a typed-name confirmation modal.

### `/admin/categories` — list
`<AdminCard>` list with drag-to-reorder rows (small custom HTML5 DnD — no `@dnd-kit`). Each row: image thumb · name · slug · product count · Edit · Delete. Reorder writes the new `order` values via `reorderCategories(orderedSlugs)` action.

### `/admin/categories/new` and `/admin/categories/[id]/edit` — form
`categorySchema`:
- `name` (required, ≤60)
- `slug` (required, kebab-case, **read-only on edit** — see "Slug immutability" below)
- `description` (required, ≤200)
- `image` (optional ObjectId)

Submit → `createCategory` / `updateCategory`. Delete refuses with a friendly error if `products` still reference this slug.

### Slug immutability (both products and categories)
Slugs are URL-stable identifiers. Once a product is at `/shop/rose-garden-bouquet` or a category lives at `/shop?category=bouquets`, changing the slug breaks every existing link (Google, customer bookmarks, the footer's static `shopLinks`, and — for categories — every `Product.category` reference in the DB). To keep URLs stable and avoid Phase 3 needing a redirect layer, slug fields are:

- **Set at create time only** (auto-generated from `name`, then user-editable in the create form).
- **Read-only on the edit form** (rendered as a disabled input with the helper text "Slugs are permanent — create a new entry to change the URL.").
- The `name` is fully editable — display names update everywhere; URLs stay put.

This decision is revisitable in Phase 4 (add a redirect table + auto-update consumers), but Phase 3 ships with the simpler invariant.

### `/admin/content` — hub
Two `<AdminCard>`s: "About page" and "Hero". Each shows a small preview and an "Edit" link. Future additions append cards here.

### `/admin/content/about` — About editor
- `body` Markdown textarea with a small "Preview" toggle that renders via `react-markdown`.
- Image picker (single ObjectId).
- `fields.eyebrow` text input.
- Submit → `updateAboutContent(input)`.

### `/admin/content/hero` — Hero editor
- Image picker (single ObjectId, swaps the right-side home hero photo).
- `fields.eyebrow` text input.
- `fields.tagline` textarea.
- `fields.badgeLabel`, `fields.badgeText` text inputs.
- Live preview tile beside the form that mirrors the home hero badge.
- Submit → `updateHeroContent(input)`.

### `/admin/login` — login form
Single small card. Email + password fields, "Sign in" gradient button, inline error if rejected. Submit `POST /api/admin/login`. On success, `Set-Cookie` + redirect to `next` query param or `/admin`. Rate-limited: 5 failed attempts per IP per 10 minutes (in-memory map keyed by IP from `x-forwarded-for`; sufficient for one-admin scale).

### Logout
A `<form action="/api/admin/logout" method="post">` in the sidebar bottom. Handler clears the cookie + redirects to `/admin/login`.

---

## 8. Toast System & Cursor-Pointer Audit (cross-cutting polish)

### Toast system

`sonner` is mounted in two places:
- `src/app/admin/layout.tsx` → `<AdminToaster />` (admin-themed)
- `src/app/(storefront)/layout.tsx` → `<StorefrontToaster />` (storefront-themed)
- Also in `src/app/checkout/page.tsx`, `src/app/checkout/[orderId]/page.tsx`, `src/app/checkout/[orderId]/done/page.tsx` (they mount their own bare chrome, so they need their own `<Toaster>` mount; share the `<StorefrontToaster>` wrapper).

Both wrappers apply brand-themed CSS overrides (rounded-full pill, `shadow-petal-md`, success `--color-brand-pink-dark` + white text, error red, loading cream).

**Where toasts fire (audit):**

| Action | Success | Error |
|---|---|---|
| Add to cart | "Added to cart" | "Couldn't add — try again" |
| Wishlist toggle | "Saved" / "Removed" | — (silent rollback) |
| Cart drawer Remove | "Removed" | — |
| `createOrder` submit | (redirect = feedback) | toast with the action's `error` |
| Payment screenshot upload | "Payment proof submitted" | "Upload failed — please try again" (inline kept for validation field errors) |
| Admin login | — | "Wrong email or password" |
| Admin create/update/delete product | "Product saved" / "Product deleted" | toast on error |
| Admin create/update/delete category | "Category saved" / "Category deleted" | toast on error or "Cannot delete — still in use" |
| Admin reorder categories | "Order saved" | toast on error |
| Admin update About/Hero | "Saved" | toast on error |
| Admin mark Paid / Rejected | "Marked Paid" / "Marked Rejected" | toast on error |
| Admin advance/revert order status | "Status updated" | toast on error |
| Admin image upload | (thumbnail appearing is feedback) | "Upload failed" |

Server actions are wrapped via `toast.promise(action(input), { loading: "Saving…", success: ..., error: ... })`.

### Cursor pointer audit

A single pass to add `cursor-pointer` to every interactive element that doesn't already have it. The plan task enumerates every file and component touched so nothing is missed. Storefront primitives mostly already have it after the earlier polish work; admin components ship with it from day one.

**Files audited:** every `*.tsx` in `src/components/` and the page files. The plan provides the exact `grep` command and the per-file checklist.

---

## 9. Validation, Security, Testing

### Validation (defense in depth)
- Zod schemas: `productSchema`, `categorySchema`, `contentSchema`, `aboutContentSchema`, `heroContentSchema`, `loginSchema`. Each used in both the client form (via `zodResolver`) and the server action / route handler.
- All admin server actions call `requireAdminSession()` before any DB write — middleware is the perimeter, action-level checks are the inner ring.
- Image upload (admin): `isAllowedImage(type, size)` re-used and re-validated server-side; size cap raised to 5MB (constant `MAX_PRODUCT_IMAGE_BYTES` separate from the existing 2MB payment cap).
- Order state-machine: `canTransition(from, to)` pure function — only allowed transitions go through. Actions reject otherwise.
- Slugs (product, category): regex-validated kebab-case; uniqueness enforced by the DB index + a Zod refinement that pre-checks.
- Category delete: `getProductsByCategory(slug).length === 0` guard; on failure returns a structured error rendered as a toast.

### Security
- `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` are server-only (no `NEXT_PUBLIC_` prefix).
- Cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, 8-hour expiry. Production sites must use HTTPS for `Secure` to function — fine for Vercel; flagged for self-host.
- JWT: HS256, secret from env, payload `{ sub: ADMIN_EMAIL, iat, exp }`. No other PII in the token.
- Login rate limit: 5 failures per IP per 10 minutes via in-memory `Map<string, number[]>` keyed by IP from `x-forwarded-for` / `remoteAddress`. Resets on success. Acknowledged limitation: a multi-instance deploy needs Redis; not needed at boutique scale.
- `GET /api/admin/payments/[id]` re-verifies session in the handler (middleware covers it too, but explicit is safer).
- No PII change on the customer-facing `/checkout/[orderId]/done` — still masked (only name + city).

### Testing
**Unit tests (TDD, Vitest, Node env):**
- `formatProductSlug` (or whichever helper auto-slugs the name): edge cases.
- `productSchema`, `categorySchema`, `loginSchema`: accept/reject cases.
- `canTransition(from, to)` for both payment and order state machines.
- `requireAdminSession`: signs a token, verifies, rejects tampered.
- `MAX_PRODUCT_IMAGE_BYTES` upload validator: 5MB cap.
- `mapProductDoc(doc): Product` — the boundary transform in `catalog.ts` — including image URL building.

**DB-touching code** (`catalog.ts` queries, admin actions, route handlers, middleware) is verified end-to-end against Atlas; no mocked-DB tests.

**Manual flow at QA time:** seed → login → CRUD a product (with images) → create a category → assign products → edit About + Hero → place a test order on the storefront → verify in admin → advance to Shipped → confirm the customer-facing `done` page still says what it said.

---

## 10. Scope Boundary

### ✅ In Phase 3
- All of §3–§9 above.
- Admin auth (env-based, `jose` + `bcryptjs` + middleware).
- New collections: `products`, `categories`, `images`, `content`.
- `orders` schema bump (`Rejected` payment status, `verification` sub-doc).
- `src/lib/catalog.ts` data layer; storefront pages refactored to use it.
- `src/data/products.ts` + `src/data/categories.ts` deleted.
- Opt-in `scripts/seedCatalog.ts`.
- Empty-state UI on Home, Shop, category pages.
- Admin shell (sidebar, mobile drawer, toaster), all admin pages.
- Admin server actions per resource + `POST /api/admin/images` multipart.
- Admin-gated `GET /api/admin/payments/[id]`.
- Public `GET /api/images/[id]` with long cache.
- Sonner toasts everywhere per the §8 audit table.
- Cursor-pointer audit pass.
- Unit tests for pure logic.
- Build + lint + type-check clean.

### ❌ Deferred to Phase 4 (Polish & Ops)
- Email / WhatsApp order notifications.
- Real Instagram feed integration.
- Contact form (still mailto + WhatsApp deep link).
- Public order-status lookup page.
- Multi-admin user table.
- Audit log of admin actions.
- Image resize/optimization on upload (`sharp`).
- Drag-and-drop reorder for product images (uses `@dnd-kit`); Phase 3 ships arrow-buttons reorder.
- Production deployment config (Vercel project, env vars, image domains, Atlas allowlist for the production server's egress IP).
- Renaming category labels via admin (currently the Footer's `shopLinks` are static literals — promotion to dynamic is Phase 4).
- About page sub-sections "Meet the maker" + "What we believe" — still code-driven; promotable to `content` later.

### User-supplied before implementation
1. `ADMIN_EMAIL` and a plain password → `.env.local`. I'll provide the helper script to hash it.
2. `ADMIN_SESSION_SECRET` (≥32 char random) → `.env.local`.
3. At Task 1 of execution: choose to **seed-migrate** the existing 12 products / 5 categories OR start the DB empty. I'll ask once.

---

## 11. Open Questions

None at design time. New questions arising during implementation should be raised to the user before being silently resolved.
