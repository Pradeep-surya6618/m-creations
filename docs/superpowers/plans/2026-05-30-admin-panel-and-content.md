# Admin Panel + Content Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [`docs/superpowers/specs/2026-05-30-admin-panel-and-content-design.md`](../specs/2026-05-30-admin-panel-and-content-design.md)

**Goal:** Ship a responsive admin panel that controls products, categories, the About page, and the home Hero — plus migrate the catalog from `src/data/` to MongoDB, wire `sonner` toasts into every action, and audit cursor-pointer site-wide.

**Architecture:** Env-based admin auth (jose-signed cookie) gated by Next 16 `proxy.ts`. New MongoDB collections (`products`, `categories`, `images`, `content`) read by a `src/lib/catalog.ts` data layer that preserves the Phase 1 function shapes. Admin shell is a sidebar that drawer-collapses on mobile. Image bytes live in `images`, served via a public route handler with long cache. Server actions per resource for writes; one multipart route handler for uploads.

**Tech Stack:** Next.js 16.2.6 (App Router, `proxy.ts`) · React 19 · MongoDB (driver v7) · `jose` · `bcryptjs` · `sonner` · `react-markdown` · `react-hook-form` + `zod@4` · Vitest (pure-logic tests).

**Test discipline:** TDD for pure logic: admin session sign/verify, all Zod schemas, order/payment state machine, product-doc → public-Product transform, image upload validator. DB-touching code is verified end-to-end against Atlas.

**Commit cadence:** One commit per task.

**Next.js 16 reading rule:** Before any task touching a Next API, read the matching `node_modules/next/dist/docs/` page. Confirmed:
- Middleware was renamed to **Proxy** in Next 16 (`src/proxy.ts`, named/default export `proxy`).
- `cookies()` from `next/headers` is **async** (`const c = await cookies()`).
- Route handler `params` is a Promise.
- Server actions: file-level `"use server"`, may take typed objects.

**Prerequisite env (user provides before Task 4 runs end-to-end):**
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH` (bcrypt, produced by Task 1's helper)
- `ADMIN_SESSION_SECRET` (≥32 char random)

---

## File Structure

### Config (modified)
- `package.json` — adds 5 new deps
- `.env.example` — documents 3 new keys
- `.env.local` — user-managed, not staged

### Auth foundation (new)
- `src/lib/adminSession.ts` + `.test.ts` — sign/verify JWT, `requireAdminSession`
- `scripts/hashAdminPassword.ts` — bcrypt hash helper
- `src/app/api/admin/login/route.ts` — POST, Zod-validated, sets cookie
- `src/app/api/admin/logout/route.ts` — POST, clears cookie
- `src/proxy.ts` — gates `/admin/*` (note: not middleware.ts — Next 16 rename)

### Data layer & migration (new + modifications)
- `src/types/catalog.ts` + Phase 1 type rename move
- `src/lib/catalog.ts` + `.test.ts` for the boundary transform
- `src/lib/content.ts` — fetch `about` / `hero` singletons
- `src/lib/orderTransitions.ts` + `.test.ts` — pure state machine
- `scripts/seedCatalog.ts` — opt-in one-time seed
- `src/lib/repriceCart.ts` — refactored: takes products as param (sync stays sync)
- `src/actions/createOrder.ts` — fetches products once, passes to repriceCart
- Storefront pages — swap imports from `@/data/*` to `@/lib/catalog`
- `src/data/products.ts` — **deleted** at end of phase
- `src/data/categories.ts` — **deleted** at end of phase

### Image storage (new)
- `src/lib/images.ts` — `saveImage`, `getImageById`, `deleteImage`
- `src/app/api/images/[id]/route.ts` — public GET, long cache
- `src/app/api/admin/images/route.ts` — POST upload (admin-gated)
- `src/app/api/admin/payments/[id]/route.ts` — admin-gated screenshot view (Phase 2 reintroduced)

### Admin shell (new)
- `src/components/admin/AdminCard.tsx`
- `src/components/admin/AdminButton.tsx`
- `src/components/admin/AdminTable.tsx`
- `src/components/admin/AdminToaster.tsx`
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/AdminMobileTopbar.tsx`
- `src/app/admin/login/page.tsx` — outside the authenticated group
- `src/app/admin/(authenticated)/layout.tsx`

### Admin pages (new)
- `/admin` Dashboard: `src/app/admin/(authenticated)/page.tsx`
- Orders: `src/app/admin/(authenticated)/orders/page.tsx`, `[orderId]/page.tsx`, plus `src/actions/orderAdmin.ts`
- Products: `src/app/admin/(authenticated)/products/{page,new,[id]/edit}/...`, plus `src/actions/productAdmin.ts`, `src/lib/validation/product.ts` + tests
- Categories: same shape, `src/actions/categoryAdmin.ts`, `src/lib/validation/category.ts` + tests
- Content: `src/app/admin/(authenticated)/content/{page,about,hero}/page.tsx`, plus `src/actions/contentAdmin.ts`, `src/lib/validation/content.ts` + tests
- Image picker: `src/components/admin/ImagePicker.tsx`, `MultiImagePicker.tsx`, `MarkdownEditor.tsx`

### Storefront polish (modifications)
- `src/components/storefront/StorefrontToaster.tsx` — new
- `src/app/(storefront)/layout.tsx` — mount Toaster
- `src/app/checkout/page.tsx` + `[orderId]/page.tsx` + `[orderId]/done/page.tsx` — mount Toaster
- `src/components/product/ProductCard.tsx` — toast on Add / Wishlist
- `src/components/checkout/PaymentUpload.tsx` — toast on success/failure
- `src/components/checkout/CheckoutForm.tsx` — toast on error
- About page + Home Hero — read from `content.about` / `content.hero`
- Empty-state branches on Home, Shop list, category pages

This file structure informs the 30 tasks below.

---

The plan is broken into **30 tasks**, grouped:
- **Tasks 1–5** Auth foundation
- **Tasks 6–10** Data layer + migration
- **Tasks 11–13** Image storage + serving
- **Tasks 14–16** Admin shell + UI primitives
- **Tasks 17–19** Dashboard + Orders admin
- **Tasks 20–23** Products admin
- **Tasks 24–25** Categories admin
- **Tasks 26–27** Content admin + storefront consumption
- **Tasks 28–29** Toasts + cursor audit
- **Task 30** Final QA

Each task is self-contained with complete code blocks; engineers can pick up any single task without reading the others.

The full task bodies follow in dedicated sections below.

---

## Task 1: Install deps + env vars + password-hash helper

**Files:** Modify `package.json`, `.env.example`. Create `scripts/hashAdminPassword.ts`.

- [ ] **Step 1: Install runtime deps**

```powershell
npm install jose bcryptjs sonner react-markdown
```

- [ ] **Step 2: Install types**

```powershell
npm install -D @types/bcryptjs
```

- [ ] **Step 3: Append three new env keys to `.env.example`**

Append to the END of `.env.example` (do not remove existing entries):
```
# Admin panel (Phase 3)
ADMIN_EMAIL=maria@mariacreations.in
ADMIN_PASSWORD_HASH=$2b$10$REPLACE_ME_WITH_OUTPUT_FROM_hashAdminPassword_script
ADMIN_SESSION_SECRET=replace-me-with-a-32-plus-char-random-string
```

- [ ] **Step 4: Write the password-hash helper script**

Write `scripts/hashAdminPassword.ts`:
```ts
import { hash } from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: npx tsx scripts/hashAdminPassword.ts <plain-password>");
    process.exit(1);
  }
  const out = await hash(password, 10);
  console.log(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 5: Verify existing tests still pass**

```powershell
npx vitest run
```
Expected: existing 42 tests still green.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json .env.example scripts/hashAdminPassword.ts
git commit -m "chore: add jose, bcryptjs, sonner, react-markdown + admin env vars"
```
(`.env.local` is user-managed — never staged. The user runs `npx tsx scripts/hashAdminPassword.ts 'theirPassword'` once and pastes the output into `.env.local`.)

---

## Task 2: Admin session sign/verify (TDD)

**Files:** Create `src/lib/adminSession.ts` + `src/lib/adminSession.test.ts`.

- [ ] **Step 1: Write the failing test**

Write `src/lib/adminSession.test.ts`:
```ts
import { describe, it, expect, beforeAll } from "vitest";
import { signAdminToken, verifyAdminToken } from "./adminSession";

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = "test-secret-at-least-32-chars-long-okay";
});

describe("adminSession", () => {
  it("round-trips a signed token", async () => {
    const token = await signAdminToken("admin@example.com");
    const payload = await verifyAdminToken(token);
    expect(payload?.sub).toBe("admin@example.com");
  });
  it("rejects a tampered token", async () => {
    const token = await signAdminToken("admin@example.com");
    const tampered = token.slice(0, -2) + (token.endsWith("a") ? "b" : "a");
    expect(await verifyAdminToken(tampered)).toBeNull();
  });
  it("rejects garbage", async () => {
    expect(await verifyAdminToken("not.a.token")).toBeNull();
    expect(await verifyAdminToken("")).toBeNull();
  });
});
```

- [ ] **Step 2: Run, expect failure**

```powershell
npx vitest run adminSession
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/adminSession.ts`**

```ts
import { SignJWT, jwtVerify } from "jose";

const EXPIRY_SECONDS = 60 * 60 * 8; // 8 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(email: string): Promise<string> {
  return new SignJWT({ sub: email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRY_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAdminToken(
  token: string
): Promise<{ sub: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "mc-admin-session";
export const SESSION_MAX_AGE = EXPIRY_SECONDS;
```

- [ ] **Step 4: Run, expect pass**

```powershell
npx vitest run adminSession
```
Expected: 3/3 PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/adminSession.ts src/lib/adminSession.test.ts
git commit -m "feat: adminSession sign/verify with jose + tests"
```

---

## Task 3: Login + logout route handlers

**Files:** Create `src/lib/validation/admin.ts` + test, `src/app/api/admin/login/route.ts`, `src/app/api/admin/logout/route.ts`.

- [ ] **Step 1: Write the loginSchema test**

Write `src/lib/validation/admin.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { loginSchema } from "./admin";

const valid = { email: "maria@example.com", password: "hunter22HUNTER22" };

describe("loginSchema", () => {
  it("accepts valid creds", () => {
    expect(loginSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects bad email", () => {
    expect(loginSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ ...valid, password: "" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```powershell
npx vitest run validation/admin
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/validation/admin.ts`**

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Password is required.").max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 4: Run, expect pass**

```powershell
npx vitest run validation/admin
```
Expected: 3/3 PASS.

- [ ] **Step 5: Write `src/app/api/admin/login/route.ts`**

```ts
import { compare } from "bcryptjs";
import { loginSchema } from "@/lib/validation/admin";
import {
  signAdminToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/adminSession";

// In-memory rate limit: 5 failures per IP per 10 minutes.
const failuresByIp = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 5;

function bumpFailure(ip: string): boolean {
  const now = Date.now();
  const arr = (failuresByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  failuresByIp.set(ip, arr);
  return arr.length > MAX_FAILURES;
}

function clearFailures(ip: string) {
  failuresByIp.delete(ip);
}

function getIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const ip = getIp(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details." },
      { status: 400 }
    );
  }

  // Throttle check BEFORE bcrypt to keep the failure path fast.
  const existing = (failuresByIp.get(ip) ?? []).filter(
    (t) => Date.now() - t < WINDOW_MS
  );
  if (existing.length >= MAX_FAILURES) {
    return Response.json(
      { error: "Too many attempts — try again later." },
      { status: 429 }
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const adminHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!adminEmail || !adminHash) {
    console.error("Admin env vars not set.");
    return Response.json({ error: "Server not configured." }, { status: 500 });
  }

  const emailOk =
    parsed.data.email.toLowerCase() === adminEmail.toLowerCase();
  const passwordOk = emailOk
    ? await compare(parsed.data.password, adminHash)
    : false;

  if (!emailOk || !passwordOk) {
    bumpFailure(ip);
    return Response.json(
      { error: "Wrong email or password." },
      { status: 401 }
    );
  }

  clearFailures(ip);
  const token = await signAdminToken(adminEmail);

  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`
  );
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers,
  });
}
```

- [ ] **Step 6: Write `src/app/api/admin/logout/route.ts`**

```ts
import { SESSION_COOKIE_NAME } from "@/lib/adminSession";

export async function POST() {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  );
  headers.append("Location", "/admin/login");
  return new Response(null, { status: 303, headers });
}
```
(`303 See Other` is the correct redirect for a POST → GET handoff.)

- [ ] **Step 7: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/validation/admin.ts src/lib/validation/admin.test.ts "src/app/api/admin/login/route.ts" "src/app/api/admin/logout/route.ts"
git commit -m "feat: admin login + logout route handlers (rate-limited)"
```

---

## Task 4: Proxy (renamed middleware) gating /admin/*

**Files:** Create `src/proxy.ts`.

- [ ] **Step 1: Read the Next 16 proxy doc**

Read `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` (first ~80 lines). Confirm:
- File is `src/proxy.ts` (NOT `middleware.ts`).
- Function exported as `proxy` (named) or default.
- Config: `export const config = { matcher: '...' }`.

- [ ] **Step 2: Write `src/proxy.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, SESSION_COOKIE_NAME } from "@/lib/adminSession";

export const config = {
  matcher: ["/admin/:path*"],
};

const PUBLIC_PATHS = ["/admin/login"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? "";
  const session = await verifyAdminToken(token);
  if (session) {
    return NextResponse.next();
  }

  const next = encodeURIComponent(pathname + search);
  return NextResponse.redirect(
    new URL(`/admin/login?next=${next}`, request.url)
  );
}
```

- [ ] **Step 3: Type-check + smoke test (no admin pages exist yet)**

```powershell
npx tsc --noEmit
```
Expected: 0 errors. (Dev-server visits to `/admin/anything` will redirect to `/admin/login` even though that page doesn't exist yet — that's expected; pages come in Task 14.)

- [ ] **Step 4: Commit**

```powershell
git add src/proxy.ts
git commit -m "feat: src/proxy.ts gates /admin/* on signed session cookie"
```

---

## Task 17: Admin Dashboard

**Files:** Create `src/app/admin/(authenticated)/page.tsx`, `src/lib/dashboardStats.ts`.

- [ ] **Step 1: Stats helper**

Create `src/lib/dashboardStats.ts`:
```ts
import { getDb } from "./mongodb";

export type DashboardStats = {
  pendingVerification: number;
  paidThisWeek: number;
  productsLive: number;
  outOfStock: number;
  recentOrders: Array<{
    orderId: string;
    name: string;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
  }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDb();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [pending, paidWeek, products, oos, recent] = await Promise.all([
    db.collection("orders").countDocuments({ paymentStatus: "Verification Pending" }),
    db.collection("orders").countDocuments({
      paymentStatus: "Paid",
      "verification.verifiedAt": { $gte: weekAgo },
    }),
    db.collection("products").countDocuments({}),
    db.collection("products").countDocuments({ stock: { $lte: 0 } }),
    db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray(),
  ]);

  return {
    pendingVerification: pending,
    paidThisWeek: paidWeek,
    productsLive: products,
    outOfStock: oos,
    recentOrders: recent.map((o) => ({
      orderId: o.orderId,
      name: o.customer?.name ?? "—",
      totalAmount: o.totalAmount ?? 0,
      paymentStatus: o.paymentStatus ?? "Pending",
      createdAt: (o.createdAt as Date)?.toISOString() ?? "",
    })),
  };
}
```

- [ ] **Step 2: Dashboard page**

Create `src/app/admin/(authenticated)/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/lib/dashboardStats";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { formatPrice } from "@/lib/formatPrice";

export const metadata: Metadata = { title: "Admin · Dashboard" };

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const tiles = [
    { label: "Pending Verification", value: stats.pendingVerification, alert: stats.pendingVerification > 0 },
    { label: "Paid This Week", value: stats.paidThisWeek },
    { label: "Products Live", value: stats.productsLive },
    { label: "Out of Stock", value: stats.outOfStock, alert: stats.outOfStock > 0 },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-ink">Dashboard</h1>
        <div className="flex gap-2">
          <AdminButton href="/admin/products/new" variant="primary" size="sm">+ Product</AdminButton>
          <AdminButton href="/admin/categories/new" variant="secondary" size="sm">+ Category</AdminButton>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <AdminCard key={t.label} className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-ink-muted font-bold">{t.label}</p>
            <p className={`mt-2 text-3xl font-bold ${t.alert ? "text-brand-pink" : "text-brand-ink"}`}>{t.value}</p>
          </AdminCard>
        ))}
      </div>

      <AdminCard title="Recent Orders">
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-brand-ink-muted py-8 text-center">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-brand-blush">
            {stats.recentOrders.map((o) => (
              <li key={o.orderId}>
                <Link
                  href={`/admin/orders/${o.orderId}`}
                  className="flex items-center justify-between py-3 px-1 text-sm hover:bg-brand-cream transition-colors rounded cursor-pointer"
                >
                  <span className="font-semibold text-brand-ink">{o.orderId}</span>
                  <span className="text-brand-ink-muted truncate flex-1 px-3">{o.name}</span>
                  <span className="text-xs text-brand-pink-dark uppercase tracking-wide mr-3">
                    {o.paymentStatus}
                  </span>
                  <span className="font-semibold text-brand-ink">{formatPrice(o.totalAmount)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
```

- [ ] **Step 3: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/dashboardStats.ts "src/app/admin/(authenticated)/page.tsx"
git commit -m "feat: admin dashboard (4 stat tiles + recent orders)"
```

---

## Task 18: Orders list page

**Files:** Create `src/app/admin/(authenticated)/orders/page.tsx`, `src/lib/ordersAdmin.ts`.

- [ ] **Step 1: Orders admin lib**

Create `src/lib/ordersAdmin.ts`:
```ts
import { getDb } from "./mongodb";
import type { OrderRecord, PaymentStatus } from "@/types/order";

export async function listOrdersForAdmin(
  filter?: PaymentStatus | "all" | "Verify"
): Promise<OrderRecord[]> {
  const db = await getDb();
  const q: Record<string, unknown> = {};
  if (filter && filter !== "all") {
    q.paymentStatus = filter === "Verify" ? "Verification Pending" : filter;
  }
  const docs = await db.collection("orders").find(q).sort({ createdAt: -1 }).limit(200).toArray();
  return docs.map(
    (d): OrderRecord => ({
      orderId: d.orderId,
      customer: d.customer,
      items: d.items,
      totalAmount: d.totalAmount,
      paymentStatus: d.paymentStatus,
      orderStatus: d.orderStatus,
      payment: d.payment
        ? {
            screenshotId: d.payment.screenshotId.toHexString?.() ?? String(d.payment.screenshotId),
            utr: d.payment.utr,
            uploadedAt: (d.payment.uploadedAt as Date).toISOString(),
          }
        : undefined,
      verification: d.verification
        ? {
            verifiedAt: d.verification.verifiedAt?.toISOString?.(),
            rejectedAt: d.verification.rejectedAt?.toISOString?.(),
            notes: d.verification.notes,
          }
        : undefined,
      createdAt: (d.createdAt as Date).toISOString(),
      updatedAt: (d.updatedAt as Date).toISOString(),
    })
  );
}
```

- [ ] **Step 2: Orders list page**

Create `src/app/admin/(authenticated)/orders/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { listOrdersForAdmin } from "@/lib/ordersAdmin";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Admin · Orders" };

const FILTERS = ["All", "Verify", "Paid", "Rejected", "Processing", "Shipped", "Delivered"] as const;
type FilterKey = (typeof FILTERS)[number];

function statusColor(s: string): string {
  if (s === "Verification Pending") return "text-brand-pink";
  if (s === "Paid") return "text-emerald-700";
  if (s === "Rejected") return "text-red-600";
  return "text-brand-ink-muted";
}

export default async function OrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = (FILTERS.includes(sp.filter as FilterKey) ? sp.filter : "All") as FilterKey;
  // Map UI filter to DB filter
  const dbFilter =
    filter === "All"
      ? "all"
      : filter === "Verify"
      ? "Verify"
      : (filter as "Paid" | "Rejected" | "Processing" | "Shipped" | "Delivered");
  const orders = await listOrdersForAdmin(dbFilter as Parameters<typeof listOrdersForAdmin>[0]);

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "All" ? "/admin/orders" : `/admin/orders?filter=${f}`}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] transition-all border cursor-pointer",
              filter === f
                ? "bg-brand-pink text-white border-brand-pink"
                : "bg-white text-brand-ink-muted border-brand-blush hover:bg-brand-cream"
            )}
          >
            {f}
          </Link>
        ))}
      </div>

      <AdminCard>
        <AdminTable
          rows={orders}
          rowKey={(o) => o.orderId}
          emptyMessage="No orders match that filter."
          columns={[
            { key: "id", label: "Order", render: (o) => (
                <Link href={`/admin/orders/${o.orderId}`} className="font-semibold text-brand-ink hover:text-brand-pink cursor-pointer">
                  {o.orderId}
                </Link>
            )},
            { key: "customer", label: "Customer", render: (o) => o.customer.name },
            { key: "items", label: "Items", render: (o) => o.items.reduce((s, i) => s + i.quantity, 0) },
            { key: "total", label: "Total", render: (o) => formatPrice(o.totalAmount), className: "tabular-nums" },
            { key: "status", label: "Status", render: (o) => (
                <span className={cn("text-xs font-bold uppercase tracking-wide", statusColor(o.paymentStatus))}>
                  {o.paymentStatus}
                </span>
            )},
            { key: "date", label: "Created", render: (o) => new Date(o.createdAt).toLocaleDateString() },
          ]}
        />
      </AdminCard>
    </div>
  );
}
```

- [ ] **Step 3: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/ordersAdmin.ts "src/app/admin/(authenticated)/orders/page.tsx"
git commit -m "feat: admin orders list with filter chips"
```

---

## Task 19: Order detail page + verify/status actions

**Files:** Create `src/actions/orderAdmin.ts`, `src/app/admin/(authenticated)/orders/[orderId]/page.tsx`, `src/components/admin/OrderActions.tsx`.

- [ ] **Step 1: Server actions**

Create `src/actions/orderAdmin.ts`:
```ts
"use server";

import { getDb } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/adminSession";
import {
  canTransitionPayment,
  canAdvanceOrder,
  canRevertOrder,
  nextOrderStatus,
  prevOrderStatus,
} from "@/lib/orderTransitions";
import type { PaymentStatus, OrderStatus } from "@/types/order";

type Result = { ok: true } | { ok: false; error: string };

async function loadOrder(orderId: string) {
  const db = await getDb();
  return db.collection("orders").findOne({ orderId });
}

async function setPayment(orderId: string, to: PaymentStatus, notes?: string): Promise<Result> {
  await requireAdminSession();
  const o = await loadOrder(orderId);
  if (!o) return { ok: false, error: "Order not found." };
  if (!canTransitionPayment(o.paymentStatus, to)) {
    return { ok: false, error: `Cannot change payment from ${o.paymentStatus} to ${to}.` };
  }
  const db = await getDb();
  const now = new Date();
  const verificationField = to === "Paid"
    ? { verifiedAt: now, notes }
    : { rejectedAt: now, notes };
  await db.collection("orders").updateOne(
    { orderId },
    {
      $set: {
        paymentStatus: to,
        verification: { ...(o.verification ?? {}), ...verificationField },
        updatedAt: now,
      },
    }
  );
  return { ok: true };
}

export async function markPaymentPaid(orderId: string, notes?: string) {
  return setPayment(orderId, "Paid", notes);
}
export async function markPaymentRejected(orderId: string, notes?: string) {
  return setPayment(orderId, "Rejected", notes);
}

async function moveStatus(
  orderId: string,
  direction: "advance" | "revert"
): Promise<Result> {
  await requireAdminSession();
  const o = await loadOrder(orderId);
  if (!o) return { ok: false, error: "Order not found." };
  const from = o.orderStatus as OrderStatus;
  const allowed = direction === "advance" ? canAdvanceOrder(from) : canRevertOrder(from);
  if (!allowed) return { ok: false, error: "Cannot change status." };
  const to = direction === "advance" ? nextOrderStatus(from) : prevOrderStatus(from);
  if (!to) return { ok: false, error: "No further transition." };
  const db = await getDb();
  await db.collection("orders").updateOne(
    { orderId },
    { $set: { orderStatus: to, updatedAt: new Date() } }
  );
  return { ok: true };
}

export async function advanceOrderStatus(orderId: string) { return moveStatus(orderId, "advance"); }
export async function revertOrderStatus(orderId: string)  { return moveStatus(orderId, "revert"); }
```

- [ ] **Step 2: OrderActions client component**

Create `src/components/admin/OrderActions.tsx`:
```tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  markPaymentPaid,
  markPaymentRejected,
  advanceOrderStatus,
  revertOrderStatus,
} from "@/actions/orderAdmin";
import { AdminButton } from "./AdminButton";
import {
  canAdvanceOrder,
  canRevertOrder,
  nextOrderStatus,
  prevOrderStatus,
} from "@/lib/orderTransitions";
import type { OrderRecord, OrderStatus } from "@/types/order";

type Props = { order: OrderRecord };

export function OrderActions({ order }: Props) {
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();

  const verifyShow = order.paymentStatus === "Verification Pending";

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, successMsg: string) => {
    start(async () => {
      const res = await fn();
      if (res.ok) toast.success(successMsg);
      else toast.error(res.error);
    });
  };

  return (
    <div className="space-y-6">
      {verifyShow && (
        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional verification notes…"
            className="w-full rounded-xl border border-brand-blush bg-white p-3 text-sm"
            rows={3}
          />
          <div className="flex gap-2">
            <AdminButton
              variant="primary"
              disabled={pending}
              onClick={() => run(() => markPaymentPaid(order.orderId, notes || undefined), "Marked Paid")}
            >
              Mark Paid
            </AdminButton>
            <AdminButton
              variant="danger"
              disabled={pending}
              onClick={() => run(() => markPaymentRejected(order.orderId, notes || undefined), "Marked Rejected")}
            >
              Mark Rejected
            </AdminButton>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-brand-blush">
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand-ink-muted font-bold mb-3">
          Order Status — {order.orderStatus}
        </p>
        <div className="flex gap-2">
          {canRevertOrder(order.orderStatus as OrderStatus) && (
            <AdminButton
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => run(() => revertOrderStatus(order.orderId), `Reverted to ${prevOrderStatus(order.orderStatus as OrderStatus)}`)}
            >
              ← Revert
            </AdminButton>
          )}
          {canAdvanceOrder(order.orderStatus as OrderStatus) && (
            <AdminButton
              variant="primary"
              size="sm"
              disabled={pending}
              onClick={() => run(() => advanceOrderStatus(order.orderId), `Advanced to ${nextOrderStatus(order.orderStatus as OrderStatus)}`)}
            >
              Advance to {nextOrderStatus(order.orderStatus as OrderStatus)} →
            </AdminButton>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Detail page (RSC)**

Create `src/app/admin/(authenticated)/orders/[orderId]/page.tsx`:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getOrderByOrderId } from "@/lib/orders";
import { AdminCard } from "@/components/admin/AdminCard";
import { formatPrice } from "@/lib/formatPrice";
import { OrderActions } from "@/components/admin/OrderActions";

export const metadata: Metadata = { title: "Admin · Order" };

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderByOrderId(orderId);
  if (!order) notFound();

  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand-pink-dark font-bold">Order</p>
        <h1 className="text-2xl font-bold mt-1">{order.orderId}</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <AdminCard title="Customer & Items">
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-brand-ink-muted">Name</dt><dd>{order.customer.name}</dd>
            <dt className="text-brand-ink-muted">Phone</dt><dd>{order.customer.phone}</dd>
            <dt className="text-brand-ink-muted">Address</dt>
            <dd className="break-words">
              {order.customer.addressLine1}
              {order.customer.addressLine2 ? <>, {order.customer.addressLine2}</> : null}
              <br />
              {order.customer.city}, {order.customer.state} — {order.customer.pincode}
            </dd>
            <dt className="text-brand-ink-muted">Created</dt>
            <dd>{new Date(order.createdAt).toLocaleString()}</dd>
          </dl>
          <ul className="mt-6 divide-y divide-brand-blush">
            {order.items.map((item) => (
              <li key={item.productId} className="py-3 flex gap-3">
                <div className="relative h-12 w-12 rounded overflow-hidden bg-brand-blush flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-brand-ink-muted">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-brand-blush flex justify-between text-sm font-bold">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </AdminCard>

        <AdminCard title="Payment">
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-ink-muted font-bold">
            Status — <span className="text-brand-pink-dark">{order.paymentStatus}</span>
          </p>
          {order.payment?.screenshotId && (
            <a
              href={`/api/admin/payments/${order.payment.screenshotId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4"
            >
              <Image
                src={`/api/admin/payments/${order.payment.screenshotId}`}
                alt="Payment screenshot"
                width={400}
                height={600}
                unoptimized
                className="rounded-xl border border-brand-blush max-h-96 w-auto object-contain"
              />
              <p className="mt-2 text-xs text-brand-pink cursor-pointer hover:underline">Open full size →</p>
            </a>
          )}
          {order.payment?.utr && (
            <p className="mt-3 text-sm">
              <span className="text-brand-ink-muted">UTR:</span>{" "}
              <span className="font-mono">{order.payment.utr}</span>
            </p>
          )}
          {order.verification?.notes && (
            <p className="mt-3 text-sm italic text-brand-ink-muted">"{order.verification.notes}"</p>
          )}
          <div className="mt-6">
            <OrderActions order={order} />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/actions/orderAdmin.ts src/components/admin/OrderActions.tsx "src/app/admin/(authenticated)/orders/[orderId]/page.tsx"
git commit -m "feat: admin order detail page + verify + status actions"
```

---

## Task 11: Image storage helpers + public GET route

**Files:** Create `src/lib/images.ts`, `src/app/api/images/[id]/route.ts`.

- [ ] **Step 1: Bump the product-image upload size constant**

Edit `src/lib/upload.ts`. Add at the bottom:
```ts
/** Product / hero / about-image upload cap. Looser than the payment 2MB cap. */
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

export function isAllowedProductImage(type: string, size: number): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(type)) {
    return { ok: false, error: "Please upload a JPG, PNG, or WebP image." };
  }
  if (size <= 0) {
    return { ok: false, error: "The file appears to be empty." };
  }
  if (size > MAX_PRODUCT_IMAGE_BYTES) {
    return { ok: false, error: "Image must be 5MB or smaller." };
  }
  return { ok: true };
}
```

Add tests at the bottom of `src/lib/upload.test.ts`:
```ts
describe("isAllowedProductImage", () => {
  it("accepts a jpeg under 5MB", () => {
    expect(isAllowedProductImage("image/jpeg", 4 * 1024 * 1024).ok).toBe(true);
  });
  it("rejects a 6MB image", () => {
    expect(isAllowedProductImage("image/jpeg", 6 * 1024 * 1024).ok).toBe(false);
  });
});
```
Update the existing import line in `upload.test.ts`:
```ts
import { isAllowedImage, isAllowedProductImage, MAX_UPLOAD_BYTES } from "./upload";
```

Run:
```powershell
npx vitest run upload
```
Expected: 7/7 PASS (5 prior + 2 new).

- [ ] **Step 2: Write `src/lib/images.ts`**

```ts
import { Binary, ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import type { ImageDoc } from "@/types/catalog";

type ImageDocWithData = ImageDoc & { data: Binary };

async function col() {
  return (await getDb()).collection<ImageDocWithData>("images");
}

export async function saveImage(args: {
  bytes: Buffer;
  contentType: string;
  width?: number;
  height?: number;
}): Promise<string> {
  const c = await col();
  const _id = new ObjectId();
  await c.insertOne({
    _id,
    data: new Binary(args.bytes),
    contentType: args.contentType,
    size: args.bytes.length,
    width: args.width,
    height: args.height,
    createdAt: new Date(),
  });
  return _id.toHexString();
}

export async function getImageById(
  hexId: string
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!ObjectId.isValid(hexId)) return null;
  const c = await col();
  const doc = await c.findOne({ _id: new ObjectId(hexId) });
  if (!doc) return null;
  return { bytes: Buffer.from(doc.data.buffer), contentType: doc.contentType };
}

export async function deleteImage(hexId: string): Promise<void> {
  if (!ObjectId.isValid(hexId)) return;
  const c = await col();
  await c.deleteOne({ _id: new ObjectId(hexId) });
}
```

- [ ] **Step 3: Write the public GET route**

Create `src/app/api/images/[id]/route.ts`:
```ts
import { getImageById } from "@/lib/images";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const img = await getImageById(id);
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(img.bytes), {
    headers: {
      "Content-Type": img.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
```

- [ ] **Step 4: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/upload.ts src/lib/upload.test.ts src/lib/images.ts "src/app/api/images/[id]/route.ts"
git commit -m "feat: image storage helpers + public GET /api/images/[id] (long cache)"
```

---

## Task 12: Admin image upload route

**Files:** Create `src/app/api/admin/images/route.ts`.

- [ ] **Step 1: Write the route handler**

```ts
import { requireAdminSession } from "@/lib/adminSession";
import { isAllowedProductImage } from "@/lib/upload";
import { saveImage } from "@/lib/images";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No image provided." }, { status: 400 });
  }

  const check = isAllowedProductImage(file.type, file.size);
  if (!check.ok) {
    return Response.json({ error: check.error }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const id = await saveImage({ bytes, contentType: file.type });
    return Response.json({ id });
  } catch (err) {
    console.error("admin image upload failed:", err);
    return Response.json({ error: "Upload failed. Try again." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Type-check + commit**

```powershell
npx tsc --noEmit
git add "src/app/api/admin/images/route.ts"
git commit -m "feat: POST /api/admin/images (auth-gated multipart upload)"
```

---

## Task 13: Reintroduce admin-gated payment screenshot serve

**Files:** Create `src/app/api/admin/payments/[id]/route.ts`.

(Phase 2 deleted the unauthenticated GET. Phase 3 brings it back under admin auth.)

- [ ] **Step 1: Write the route handler**

```ts
import { requireAdminSession } from "@/lib/adminSession";
import { getPaymentById } from "@/lib/payments";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const payment = await getPaymentById(id);
  if (!payment) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(payment.bytes), {
    headers: {
      "Content-Type": payment.contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
```

- [ ] **Step 2: Type-check + commit**

```powershell
npx tsc --noEmit
git add "src/app/api/admin/payments/[id]/route.ts"
git commit -m "feat: admin-gated GET /api/admin/payments/[id]"
```

---

## Task 14: Admin UI primitives (Card, Button, Toaster, Table)

**Files:** Create `src/components/admin/AdminCard.tsx`, `AdminButton.tsx`, `AdminToaster.tsx`, `AdminTable.tsx`.

All four files in one task (small, related, one commit).

- [ ] **Step 1: `AdminCard.tsx` (RSC)**

```tsx
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

export function AdminCard({ children, className, title }: Props) {
  return (
    <section
      className={cn(
        "bg-white rounded-2xl border border-brand-blush shadow-petal-sm",
        className
      )}
    >
      {title && (
        <header className="px-6 py-4 border-b border-brand-blush">
          <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold">
            {title}
          </h2>
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: `AdminButton.tsx` (RSC)**

```tsx
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

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
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

const base =
  "inline-flex items-center justify-center rounded-full font-semibold cursor-pointer " +
  "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "text-white bg-brand-gradient shadow-petal-sm hover:-translate-y-0.5 hover:shadow-petal-md",
  secondary:
    "text-brand-pink bg-white border border-brand-pink hover:bg-brand-pink hover:text-white",
  danger:
    "text-red-600 bg-white border border-red-300 hover:bg-red-50",
  ghost:
    "text-brand-ink-muted bg-transparent hover:bg-brand-blush",
};

const sizes: Record<Size, string> = {
  sm: "text-[11px] px-3 py-1.5 tracking-wide",
  md: "text-xs px-5 py-2.5 tracking-wide uppercase",
};

export function AdminButton(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} onClick={props.onClick} className={cls}>
        {children}
      </Link>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonProps;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
```

- [ ] **Step 3: `AdminToaster.tsx` (Client)**

```tsx
"use client";

import { Toaster } from "sonner";

export function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!bg-white !text-brand-ink !border !border-brand-blush !shadow-petal-md !rounded-full",
          title: "!text-sm !font-semibold",
          description: "!text-xs !text-brand-ink-muted",
          success: "[&_[data-icon]]:!text-brand-pink-dark",
          error: "[&_[data-icon]]:!text-red-600",
        },
      }}
    />
  );
}
```

- [ ] **Step 4: `AdminTable.tsx` (RSC + a Client cell wrapper)**

```tsx
import { cn } from "@/lib/cn";

type Column<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  rowKey: (row: T) => string;
  className?: string;
};

/**
 * Desktop: real table. Mobile (< md): stacks each row into a card with
 * label/value pairs. Uses Tailwind responsive variants only.
 */
export function AdminTable<T>({
  rows, columns, emptyMessage = "Nothing here yet.", rowKey, className,
}: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className={cn("py-12 text-center text-sm text-brand-ink-muted", className)}>
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop */}
      <table className="hidden md:table w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.1em] text-brand-ink-muted">
          <tr className="border-b border-brand-blush">
            {columns.map((c) => (
              <th key={c.key} className={cn("py-3 px-3 font-semibold", c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b border-brand-blush/60 hover:bg-brand-cream">
              {columns.map((c) => (
                <td key={c.key} className={cn("py-3 px-3", c.className)}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Mobile */}
      <ul className="md:hidden divide-y divide-brand-blush">
        {rows.map((r) => (
          <li key={rowKey(r)} className="py-4 space-y-2">
            {columns.map((c) => (
              <div key={c.key} className="flex justify-between gap-3 text-sm">
                <span className="text-[10px] uppercase tracking-[0.15em] text-brand-ink-muted font-bold">
                  {c.label}
                </span>
                <span className="text-right">{c.render(r)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/components/admin/AdminCard.tsx src/components/admin/AdminButton.tsx src/components/admin/AdminToaster.tsx src/components/admin/AdminTable.tsx
git commit -m "feat: AdminCard, AdminButton, AdminToaster, AdminTable primitives"
```

---

## Task 15: Sidebar + mobile topbar

**Files:** Create `src/components/admin/AdminSidebar.tsx`, `AdminMobileTopbar.tsx`.

- [ ] **Step 1: Shared nav config**

Create `src/components/admin/adminNav.ts`:
```ts
export const adminNav = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/products", label: "Products", icon: "🌸" },
  { href: "/admin/categories", label: "Categories", icon: "▷" },
  { href: "/admin/content", label: "Content", icon: "📄" },
];
```

- [ ] **Step 2: `AdminSidebar.tsx` (Client)**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "./adminNav";
import { cn } from "@/lib/cn";

type Props = {
  adminEmail: string;
  pendingCount: number;
};

export function AdminSidebar({ adminEmail, pendingCount }: Props) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col md:w-[220px] md:shrink-0 md:h-screen md:sticky md:top-0 bg-white border-r border-brand-blush">
      <div className="px-5 pt-6 pb-4 border-b border-brand-blush">
        <span className="font-script text-3xl text-brand-pink leading-none">Maria · Admin</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {adminNav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const showBadge = item.href === "/admin/orders" && pendingCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer",
                active
                  ? "bg-brand-gradient text-white shadow-petal-sm"
                  : "text-brand-ink-muted hover:bg-brand-blush/50"
              )}
            >
              <span className="w-4 text-base leading-none">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-brand-blush text-brand-pink-dark px-2 py-0.5 rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-brand-blush text-xs space-y-2">
        <p className="text-brand-ink-muted truncate">{adminEmail}</p>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="text-brand-pink font-semibold cursor-pointer hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: `AdminMobileTopbar.tsx` (Client) — hamburger + drawer**

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { adminNav } from "./adminNav";
import { cn } from "@/lib/cn";

type Props = { adminEmail: string; pendingCount: number };

export function AdminMobileTopbar({ adminEmail, pendingCount }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-brand-blush bg-white">
        <span className="font-script text-2xl text-brand-pink leading-none">
          Maria · Admin
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="cursor-pointer h-9 w-9 rounded-full bg-brand-cream border border-brand-blush text-brand-pink inline-flex items-center justify-center"
        >
          ☰
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <m.div
              className="fixed inset-0 z-50 bg-brand-ink/30 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <m.aside
              role="dialog"
              aria-modal="true"
              aria-label="Admin menu"
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-brand-blush md:hidden flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="px-5 py-5 border-b border-brand-blush flex items-center justify-between">
                <span className="font-script text-2xl text-brand-pink">
                  Maria · Admin
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="cursor-pointer h-9 w-9 rounded-full bg-brand-cream border border-brand-blush text-brand-pink inline-flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {adminNav.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const showBadge =
                    item.href === "/admin/orders" && pendingCount > 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all cursor-pointer",
                        active
                          ? "bg-brand-gradient text-white"
                          : "text-brand-ink-muted hover:bg-brand-blush/50"
                      )}
                    >
                      <span className="w-4 text-base">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {showBadge && (
                        <span className="bg-brand-blush text-brand-pink-dark px-2 py-0.5 rounded-full text-[10px]">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-5 py-4 border-t border-brand-blush text-xs space-y-2">
                <p className="text-brand-ink-muted truncate">{adminEmail}</p>
                <form action="/api/admin/logout" method="post">
                  <button
                    type="submit"
                    className="text-brand-pink font-semibold cursor-pointer hover:underline"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 4: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/components/admin/AdminSidebar.tsx src/components/admin/AdminMobileTopbar.tsx src/components/admin/adminNav.ts
git commit -m "feat: AdminSidebar + AdminMobileTopbar with drawer"
```

---

## Task 16: Admin login page + authenticated layout

**Files:** Create `src/app/admin/login/page.tsx`, `src/components/admin/LoginForm.tsx`, `src/app/admin/(authenticated)/layout.tsx`.

- [ ] **Step 1: Login form (Client) — RHF + Zod**

Create `src/components/admin/LoginForm.tsx`:
```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validation/admin";
import { AdminButton } from "./AdminButton";

const fieldBase =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-3 text-sm text-brand-ink " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error ?? "Sign-in failed.");
        setSubmitting(false);
        return;
      }
      router.push(next);
    } catch {
      toast.error("Network error.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-semibold mb-2">
          Email
        </span>
        <input className={fieldBase} type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <span className="block mt-1 text-xs text-brand-pink">{errors.email.message}</span>
        )}
      </label>
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-semibold mb-2">
          Password
        </span>
        <input
          className={fieldBase}
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <span className="block mt-1 text-xs text-brand-pink">{errors.password.message}</span>
        )}
      </label>
      <AdminButton type="submit" disabled={submitting} className="w-full">
        {submitting ? "Signing in…" : "Sign in"}
      </AdminButton>
    </form>
  );
}
```

- [ ] **Step 2: Login page (RSC shell)**

Create `src/app/admin/login/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { AdminCard } from "@/components/admin/AdminCard";
import { LoginForm } from "@/components/admin/LoginForm";
import { AdminToaster } from "@/components/admin/AdminToaster";

export const metadata: Metadata = {
  title: "Admin · Sign in",
};

export default function AdminLoginPage() {
  return (
    <>
      <AdminToaster />
      <main className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Container className="max-w-md py-12">
          <div className="text-center mb-8">
            <ScriptHeading as="h1" align="center">Welcome back</ScriptHeading>
            <p className="mt-3 text-sm text-brand-ink-muted">Sign in to manage the boutique.</p>
          </div>
          <AdminCard>
            <LoginForm />
          </AdminCard>
        </Container>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Authenticated layout (RSC)**

Create `src/app/admin/(authenticated)/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminSession";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileTopbar } from "@/components/admin/AdminMobileTopbar";
import { AdminToaster } from "@/components/admin/AdminToaster";
import { getDb } from "@/lib/mongodb";

async function countPendingVerifications(): Promise<number> {
  try {
    const db = await getDb();
    return await db.collection("orders").countDocuments({ paymentStatus: "Verification Pending" });
  } catch {
    return 0;
  }
}

export default async function AdminAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const pendingCount = await countPendingVerifications();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-cream text-brand-ink">
      <AdminSidebar adminEmail={session.email} pendingCount={pendingCount} />
      <AdminMobileTopbar adminEmail={session.email} pendingCount={pendingCount} />
      <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      <AdminToaster />
    </div>
  );
}
```

- [ ] **Step 4: Smoke test**

```powershell
npm run dev
```
- Visit `/admin/login` → form renders.
- Type wrong creds → toast "Wrong email or password."
- Type right creds → redirect to `/admin` (404 page for now — dashboard is Task 17).
- Visit `/admin` directly → proxy redirects to `/admin/login`. ✓

Stop dev server.

- [ ] **Step 5: Commit**

```powershell
git add "src/app/admin/login/page.tsx" "src/app/admin/(authenticated)/layout.tsx" src/components/admin/LoginForm.tsx
git commit -m "feat: /admin/login page + authenticated layout with sidebar"
```

---


## Task 6: Catalog types + DB-doc → public-Product transform (TDD)

**Files:** Modify `src/types/product.ts`. Create `src/types/catalog.ts`, `src/lib/mapProductDoc.ts` + `.test.ts`.

The Phase 1 `Product` type (with `images: string[]`) stays — that's what storefront components consume. We add a separate `ProductDoc` for the DB shape.

- [ ] **Step 1: Add the DB doc types**

Create `src/types/catalog.ts`:
```ts
import type { ObjectId } from "mongodb";

export type ProductDoc = {
  _id: ObjectId;
  productId: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  images: ObjectId[];
  shortDescription: string;
  handmadeDetails: string[];
  stock: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryDoc = {
  _id: ObjectId;
  slug: string;
  name: string;
  description: string;
  image: ObjectId | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ImageDoc = {
  _id: ObjectId;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: Date;
};

export type ContentDoc = {
  _id: string; // "about" | "hero"
  body?: string;
  image?: ObjectId;
  fields?: Record<string, string>;
  updatedAt: Date;
};
```

- [ ] **Step 2: Write the transform test**

Create `src/lib/mapProductDoc.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { ObjectId } from "mongodb";
import { mapProductDoc, mapCategoryDoc } from "./mapProductDoc";
import type { ProductDoc, CategoryDoc } from "@/types/catalog";

const img1 = new ObjectId();
const img2 = new ObjectId();

const productDoc: ProductDoc = {
  _id: new ObjectId(),
  productId: "mc-p-001",
  slug: "rose-garden-bouquet",
  name: "Rose Garden Bouquet",
  category: "bouquets",
  price: 499,
  images: [img1, img2],
  shortDescription: "A dozen handmade pipe-cleaner roses.",
  handmadeDetails: ["12 roses", "Satin ribbon"],
  stock: 8,
  featured: true,
  createdAt: new Date("2026-04-02T10:00:00.000Z"),
  updatedAt: new Date("2026-04-02T10:00:00.000Z"),
};

describe("mapProductDoc", () => {
  it("turns image ObjectIds into /api/images/<hex> URLs", () => {
    const p = mapProductDoc(productDoc);
    expect(p.images).toEqual([
      `/api/images/${img1.toHexString()}`,
      `/api/images/${img2.toHexString()}`,
    ]);
  });
  it("preserves all scalar fields", () => {
    const p = mapProductDoc(productDoc);
    expect(p.id).toBe("mc-p-001");
    expect(p.slug).toBe("rose-garden-bouquet");
    expect(p.name).toBe("Rose Garden Bouquet");
    expect(p.category).toBe("bouquets");
    expect(p.price).toBe(499);
    expect(p.stock).toBe(8);
    expect(p.featured).toBe(true);
  });
  it("serializes createdAt as ISO", () => {
    expect(mapProductDoc(productDoc).createdAt).toBe(
      "2026-04-02T10:00:00.000Z"
    );
  });
  it("handles a missing-image product (empty array)", () => {
    const p = mapProductDoc({ ...productDoc, images: [] });
    expect(p.images).toEqual([]);
  });
});

describe("mapCategoryDoc", () => {
  it("turns image ObjectId into URL; null → empty string", () => {
    const id = new ObjectId();
    const cat: CategoryDoc = {
      _id: new ObjectId(),
      slug: "bouquets",
      name: "Handmade Bouquets",
      description: "Hand-tied bouquets.",
      image: id,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(mapCategoryDoc(cat).image).toBe(`/api/images/${id.toHexString()}`);
    expect(mapCategoryDoc({ ...cat, image: null }).image).toBe("");
  });
});
```

- [ ] **Step 3: Run, expect failure**

```powershell
npx vitest run mapProductDoc
```
Expected: FAIL.

- [ ] **Step 4: Implement `src/lib/mapProductDoc.ts`**

```ts
import type { Product, Category } from "@/types/product";
import type { ProductDoc, CategoryDoc } from "@/types/catalog";

export function mapProductDoc(doc: ProductDoc): Product {
  return {
    id: doc.productId,
    slug: doc.slug,
    name: doc.name,
    category: doc.category as Product["category"],
    price: doc.price,
    images: doc.images.map((id) => `/api/images/${id.toHexString()}`),
    shortDescription: doc.shortDescription,
    handmadeDetails: doc.handmadeDetails,
    stock: doc.stock,
    featured: doc.featured || undefined,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapCategoryDoc(doc: CategoryDoc): Category {
  return {
    slug: doc.slug as Category["slug"],
    name: doc.name,
    description: doc.description,
    image: doc.image ? `/api/images/${doc.image.toHexString()}` : "",
  };
}
```

- [ ] **Step 5: Run, expect pass**

```powershell
npx vitest run mapProductDoc
```
Expected: 5/5 PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/types/catalog.ts src/lib/mapProductDoc.ts src/lib/mapProductDoc.test.ts
git commit -m "feat: catalog DB types + ProductDoc/CategoryDoc → public transform"
```

---

## Task 7: `src/lib/catalog.ts` — DB-backed catalog data layer

**Files:** Create `src/lib/catalog.ts`.

No unit tests (touches DB). Verified end-to-end in Task 10's migration QA and Task 30.

- [ ] **Step 1: Write `src/lib/catalog.ts`**

```ts
import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { mapProductDoc, mapCategoryDoc } from "./mapProductDoc";
import type { Product, Category } from "@/types/product";
import type { ProductDoc, CategoryDoc } from "@/types/catalog";

async function productsCol() {
  return (await getDb()).collection<ProductDoc>("products");
}
async function categoriesCol() {
  return (await getDb()).collection<CategoryDoc>("categories");
}

export async function getAllProducts(): Promise<Product[]> {
  const col = await productsCol();
  const docs = await col.find({}).sort({ featured: -1, createdAt: -1 }).toArray();
  return docs.map(mapProductDoc);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const col = await productsCol();
  const doc = await col.findOne({ slug });
  return doc ? mapProductDoc(doc) : undefined;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const col = await productsCol();
  const docs = await col
    .find({ category: slug })
    .sort({ featured: -1, createdAt: -1 })
    .toArray();
  return docs.map(mapProductDoc);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const col = await productsCol();
  const docs = await col.find({ featured: true }).sort({ createdAt: -1 }).toArray();
  return docs.map(mapProductDoc);
}

export async function getRelatedProducts(
  productId: string,
  category: string,
  limit = 4
): Promise<Product[]> {
  const col = await productsCol();
  const docs = await col
    .find({ productId: { $ne: productId }, category })
    .limit(limit)
    .toArray();
  return docs.map(mapProductDoc);
}

export async function getAllCategories(): Promise<Category[]> {
  const col = await categoriesCol();
  const docs = await col.find({}).sort({ order: 1 }).toArray();
  return docs.map(mapCategoryDoc);
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | undefined> {
  const col = await categoriesCol();
  const doc = await col.findOne({ slug });
  return doc ? mapCategoryDoc(doc) : undefined;
}

/** Server-only helper for `createOrder` so repriceCart stays sync + pure. */
export async function loadProductMap(): Promise<Map<string, Product>> {
  const all = await getAllProducts();
  return new Map(all.map((p) => [p.id, p]));
}

/** Internal helpers exported for admin actions (Tasks 21+24). */
export async function getProductDocById(
  hexId: string
): Promise<ProductDoc | null> {
  if (!ObjectId.isValid(hexId)) return null;
  const col = await productsCol();
  return col.findOne({ _id: new ObjectId(hexId) });
}
export async function getCategoryDocById(
  hexId: string
): Promise<CategoryDoc | null> {
  if (!ObjectId.isValid(hexId)) return null;
  const col = await categoriesCol();
  return col.findOne({ _id: new ObjectId(hexId) });
}
```

- [ ] **Step 2: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/catalog.ts
git commit -m "feat: catalog.ts DB-backed data layer (Phase 1 signatures preserved)"
```

---

## Task 8: Content singletons (`about`, `hero`)

**Files:** Create `src/lib/content.ts`.

- [ ] **Step 1: Write `src/lib/content.ts`**

```ts
import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import type { ContentDoc } from "@/types/catalog";

async function col() {
  return (await getDb()).collection<ContentDoc>("content");
}

/** Public shape — image is a URL, never an ObjectId. */
export type AboutContent = {
  body: string;
  image: string | null;
  eyebrow: string;
};
export type HeroContent = {
  image: string | null;
  eyebrow: string;
  tagline: string;
  badgeLabel: string;
  badgeText: string;
};

function toUrl(id: ObjectId | string | undefined): string | null {
  if (!id) return null;
  const hex = typeof id === "string" ? id : id.toHexString();
  return `/api/images/${hex}`;
}

export async function getAboutContent(): Promise<AboutContent> {
  const doc = await (await col()).findOne({ _id: "about" });
  return {
    body: doc?.body ?? "",
    image: toUrl(doc?.image),
    eyebrow: doc?.fields?.eyebrow ?? "",
  };
}

export async function getHeroContent(): Promise<HeroContent> {
  const doc = await (await col()).findOne({ _id: "hero" });
  return {
    image: toUrl(doc?.image),
    eyebrow: doc?.fields?.eyebrow ?? "Est. Madurai · Handmade",
    tagline:
      doc?.fields?.tagline ??
      "Handmade flowers crafted with love — one petal at a time, made just for you.",
    badgeLabel: doc?.fields?.badgeLabel ?? "New Arrival",
    badgeText: doc?.fields?.badgeText ?? "Spring Bouquets",
  };
}

/** Admin-only write helpers (used by Task 26 actions). */
export async function upsertAboutContent(input: {
  body: string;
  image: string | null;
  eyebrow: string;
}): Promise<void> {
  const c = await col();
  await c.updateOne(
    { _id: "about" },
    {
      $set: {
        body: input.body,
        image: input.image ? new ObjectId(input.image) : undefined,
        fields: { eyebrow: input.eyebrow },
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
export async function upsertHeroContent(input: {
  image: string | null;
  eyebrow: string;
  tagline: string;
  badgeLabel: string;
  badgeText: string;
}): Promise<void> {
  const c = await col();
  await c.updateOne(
    { _id: "hero" },
    {
      $set: {
        image: input.image ? new ObjectId(input.image) : undefined,
        fields: {
          eyebrow: input.eyebrow,
          tagline: input.tagline,
          badgeLabel: input.badgeLabel,
          badgeText: input.badgeText,
        },
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
```

- [ ] **Step 2: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/content.ts
git commit -m "feat: content.ts (about + hero singletons) with sensible fallbacks"
```

---

## Task 9: Order/payment state machine (TDD)

**Files:** Create `src/lib/orderTransitions.ts` + `.test.ts`.

- [ ] **Step 1: Write the test**

Create `src/lib/orderTransitions.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  canTransitionPayment,
  canAdvanceOrder,
  canRevertOrder,
  nextOrderStatus,
  prevOrderStatus,
} from "./orderTransitions";

describe("payment transitions", () => {
  it("Verification Pending → Paid is allowed", () => {
    expect(canTransitionPayment("Verification Pending", "Paid")).toBe(true);
  });
  it("Verification Pending → Rejected is allowed", () => {
    expect(canTransitionPayment("Verification Pending", "Rejected")).toBe(true);
  });
  it("Pending → Paid is NOT allowed (must upload first)", () => {
    expect(canTransitionPayment("Pending", "Paid")).toBe(false);
  });
  it("Paid → Rejected is NOT allowed", () => {
    expect(canTransitionPayment("Paid", "Rejected")).toBe(false);
  });
});

describe("order status workflow", () => {
  it("can advance Pending → Processing → Shipped → Delivered", () => {
    expect(canAdvanceOrder("Pending")).toBe(true);
    expect(nextOrderStatus("Pending")).toBe("Processing");
    expect(nextOrderStatus("Processing")).toBe("Shipped");
    expect(nextOrderStatus("Shipped")).toBe("Delivered");
  });
  it("cannot advance past Delivered", () => {
    expect(canAdvanceOrder("Delivered")).toBe(false);
    expect(nextOrderStatus("Delivered")).toBeNull();
  });
  it("can revert anywhere except Pending", () => {
    expect(canRevertOrder("Pending")).toBe(false);
    expect(prevOrderStatus("Pending")).toBeNull();
    expect(prevOrderStatus("Processing")).toBe("Pending");
    expect(prevOrderStatus("Shipped")).toBe("Processing");
    expect(prevOrderStatus("Delivered")).toBe("Shipped");
  });
});
```

- [ ] **Step 2: Run, expect failure**

```powershell
npx vitest run orderTransitions
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/orderTransitions.ts`**

```ts
import type { OrderStatus, PaymentStatus } from "@/types/order";

const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
];

const PAYMENT_ALLOWED: Record<PaymentStatus, PaymentStatus[]> = {
  Pending: [],
  "Verification Pending": ["Paid", "Rejected"],
  Paid: [],
  Rejected: ["Paid"], // admin may correct a mistaken rejection
};

export function canTransitionPayment(
  from: PaymentStatus,
  to: PaymentStatus
): boolean {
  return PAYMENT_ALLOWED[from]?.includes(to) ?? false;
}

export function canAdvanceOrder(from: OrderStatus): boolean {
  return ORDER_STATUSES.indexOf(from) < ORDER_STATUSES.length - 1;
}
export function canRevertOrder(from: OrderStatus): boolean {
  return ORDER_STATUSES.indexOf(from) > 0;
}
export function nextOrderStatus(from: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUSES.indexOf(from);
  return idx < 0 || idx === ORDER_STATUSES.length - 1
    ? null
    : ORDER_STATUSES[idx + 1];
}
export function prevOrderStatus(from: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUSES.indexOf(from);
  return idx <= 0 ? null : ORDER_STATUSES[idx - 1];
}
```

> The `PaymentStatus` type currently doesn't include `"Rejected"`. Add it now (it was specified in §4 of the spec; this is the minimal type bump):
>
> Modify `src/types/order.ts` — change `PaymentStatus`:
> ```ts
> export type PaymentStatus = "Pending" | "Verification Pending" | "Paid" | "Rejected";
> ```
> Also add the `verification` sub-doc and `payment.utr?: string` is already there; here's the full update — find:
> ```ts
>   payment?: {
>     screenshotId: string;
>     utr?: string;
>     uploadedAt: string; // ISO
>   };
> ```
> Add a sibling:
> ```ts
>   verification?: {
>     verifiedAt?: string;
>     rejectedAt?: string;
>     notes?: string;
>   };
> ```

- [ ] **Step 4: Run, expect pass**

```powershell
npx vitest run orderTransitions
```
Expected: 7/7 PASS.

- [ ] **Step 5: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/orderTransitions.ts src/lib/orderTransitions.test.ts src/types/order.ts
git commit -m "feat: order/payment state machine with tests; PaymentStatus gains Rejected"
```

---

## Task 10: Catalog migration — `repriceCart` refactor + storefront imports + seed script + delete `src/data/`

**Files:** Modify `src/lib/repriceCart.ts` + `.test.ts`, `src/actions/createOrder.ts`, all storefront page files. Create `scripts/seedCatalog.ts`. Delete `src/data/products.ts` + `src/data/categories.ts`.

This task is the big one. Sub-steps grouped to minimize the diff stretch.

- [ ] **Step 1: Refactor `repriceCart` to take `products` as a parameter (sync stays sync)**

Edit `src/lib/repriceCart.ts`. Replace the file with:
```ts
import type { Product } from "@/types/product";
import type { OrderItem } from "@/types/order";

export type RepriceInput = { productId: string; quantity: number };

export type RepriceResult =
  | { ok: true; items: OrderItem[]; totalAmount: number }
  | { ok: false; error: string };

export function repriceCart(
  input: RepriceInput[],
  productMap: Map<string, Product>
): RepriceResult {
  if (input.length === 0) return { ok: false, error: "Your cart is empty." };
  if (input.length > 50)
    return { ok: false, error: "Too many items in cart." };

  const items: OrderItem[] = [];
  for (const line of input) {
    const product = productMap.get(line.productId);
    if (!product) return { ok: false, error: `Unknown product: ${line.productId}` };
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      return { ok: false, error: `Invalid quantity for ${product.name}.` };
    }
    if (product.stock <= 0) {
      return { ok: false, error: `${product.name} is sold out.` };
    }
    if (line.quantity > product.stock) {
      return {
        ok: false,
        error: `Only ${product.stock} of ${product.name} available.`,
      };
    }
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
      image: product.images[0] ?? "/Handmade-1.jpeg",
    });
  }
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { ok: true, items, totalAmount };
}
```

- [ ] **Step 2: Update `repriceCart.test.ts` to pass a product map**

Replace `src/lib/repriceCart.test.ts` with:
```ts
import { describe, it, expect } from "vitest";
import { repriceCart } from "./repriceCart";
import type { Product } from "@/types/product";

const catalog: Product[] = [
  {
    id: "mc-p-001",
    slug: "rose-garden-bouquet",
    name: "Rose Garden Bouquet",
    category: "bouquets",
    price: 499,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "",
    handmadeDetails: [],
    stock: 8,
    featured: true,
    createdAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "mc-p-012",
    slug: "blush-glow-candle",
    name: "Blush Glow Candle",
    category: "candle-floral",
    price: 849,
    images: ["/Handmade-1.jpeg"],
    shortDescription: "",
    handmadeDetails: [],
    stock: 0,
    createdAt: "2026-05-20T10:00:00.000Z",
  },
];
const map = new Map(catalog.map((p) => [p.id, p]));

describe("repriceCart", () => {
  it("rejects an empty cart", () => {
    expect(repriceCart([], map).ok).toBe(false);
  });
  it("prices a known in-stock product", () => {
    const r = repriceCart([{ productId: "mc-p-001", quantity: 2 }], map);
    expect(r).toEqual({
      ok: true,
      items: [
        {
          productId: "mc-p-001",
          name: "Rose Garden Bouquet",
          price: 499,
          quantity: 2,
          image: "/Handmade-1.jpeg",
        },
      ],
      totalAmount: 998,
    });
  });
  it("rejects unknown product", () => {
    expect(repriceCart([{ productId: "nope", quantity: 1 }], map).ok).toBe(false);
  });
  it("rejects sold-out", () => {
    expect(
      repriceCart([{ productId: "mc-p-012", quantity: 1 }], map).ok
    ).toBe(false);
  });
  it("rejects quantity < 1", () => {
    expect(
      repriceCart([{ productId: "mc-p-001", quantity: 0 }], map).ok
    ).toBe(false);
  });
  it("rejects quantity > stock", () => {
    expect(
      repriceCart([{ productId: "mc-p-001", quantity: 9 }], map).ok
    ).toBe(false);
  });
  it("rejects > 50 lines", () => {
    const lines = Array.from({ length: 51 }, () => ({
      productId: "mc-p-001",
      quantity: 1,
    }));
    expect(repriceCart(lines, map).ok).toBe(false);
  });
});
```

- [ ] **Step 3: Update `createOrder` action to load products from catalog**

Edit `src/actions/createOrder.ts`. Add at the top of imports:
```ts
import { loadProductMap } from "@/lib/catalog";
```
Then change the body's repriceCart call from:
```ts
  const priced = repriceCart(input.items ?? []);
```
to:
```ts
  const productMap = await loadProductMap();
  const priced = repriceCart(input.items ?? [], productMap);
```

- [ ] **Step 4: Verify tests pass**

```powershell
npx vitest run repriceCart
```
Expected: 7/7 PASS.

- [ ] **Step 5: Swap storefront imports**

For each of these files, change the import line and add `await` where needed:

**`src/app/(storefront)/page.tsx`** — change:
```ts
import { categories } from "@/data/categories";
import { getFeaturedProducts } from "@/data/products";
```
to:
```ts
import { getAllCategories, getFeaturedProducts } from "@/lib/catalog";
```
Then inside `HomePage`, change `const featured = getFeaturedProducts();` to `const featured = await getFeaturedProducts();`, and add `const categories = await getAllCategories();` near the top. The component is already async (it's an RSC page).

**`src/app/(storefront)/shop/page.tsx`** — change:
```ts
import { products } from "@/data/products";
import { categories } from "@/data/categories";
```
to:
```ts
import { getAllProducts, getAllCategories } from "@/lib/catalog";
```
Inside the async `ShopPage`, after `await searchParams`, add:
```ts
const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
```

**`src/app/(storefront)/shop/[slug]/page.tsx`** — change:
```ts
import {
  products,
  getProductBySlug,
  getRelatedProducts,
} from "@/data/products";
import { categories } from "@/data/categories";
```
to:
```ts
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  getAllCategories,
} from "@/lib/catalog";
```
Change `generateStaticParams` to:
```ts
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}
```
In `generateMetadata`, `await getProductBySlug(slug)`. In `ProductDetailPage`, `await getProductBySlug(slug)`, `await getRelatedProducts(...)`, `await getAllCategories()`.

**`src/components/product/ShopControls.tsx`** — currently imports `categories` from `@/data/categories`. Since this is a client component, it can't await server fetches. **Refactor:** make it accept `categories` as a prop:
```tsx
// Change the import:
// import { categories } from "@/data/categories";
import type { Category } from "@/types/product";

export function ShopControls({ categories }: { categories: Category[] }) {
  // ...rest unchanged
}
```
Then update `src/app/(storefront)/shop/page.tsx` and `src/app/admin/...` (later) to pass `categories` in.

- [ ] **Step 6: Write the opt-in seed script**

Create `scripts/seedCatalog.ts`:
```ts
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { ObjectId } from "mongodb";

async function main() {
  const wantSeed = process.argv.includes("--seed");
  if (!wantSeed) {
    console.log(
      "scripts/seedCatalog.ts: pass --seed to populate categories + products. Skipping."
    );
    return;
  }

  const { getDb } = await import("../src/lib/mongodb");
  const db = await getDb();

  // === Seed categories ===
  const categories = [
    { slug: "bouquets", name: "Handmade Bouquets",
      description: "Hand-tied bouquets crafted from pipe cleaner roses, lilies, and seasonal blooms.", order: 0 },
    { slug: "pipe-cleaner", name: "Pipe Cleaner Flowers",
      description: "Single-stem and small-cluster pipe cleaner flowers, perfect for gifting.", order: 1 },
    { slug: "flower-pots", name: "Decorative Flower Pots",
      description: "Miniature pots arranged with handmade blooms — a cheerful piece of forever-spring.", order: 2 },
    { slug: "gifts", name: "Floral Gifts",
      description: "Curated gift sets for birthdays, anniversaries, and just-because moments.", order: 3 },
    { slug: "candle-floral", name: "Candle Flower Designs",
      description: "Scented candles wrapped in handmade petals — a softer kind of glow.", order: 4 },
  ];
  for (const c of categories) {
    await db.collection("categories").updateOne(
      { slug: c.slug },
      {
        $setOnInsert: { ...c, image: null, createdAt: new Date(), updatedAt: new Date() },
      },
      { upsert: true }
    );
  }

  // === Seed products (no image references — admin re-uploads) ===
  const products: Array<{
    productId: string; slug: string; name: string; category: string;
    price: number; shortDescription: string; handmadeDetails: string[];
    stock: number; featured: boolean;
  }> = [
    { productId: "mc-p-001", slug: "rose-garden-bouquet", name: "Rose Garden Bouquet", category: "bouquets",
      price: 499, shortDescription: "A dozen handmade pipe-cleaner roses tied with satin ribbon.",
      handmadeDetails: ["12 pipe-cleaner roses in soft pinks", "Satin ribbon wrap, hand-tied", "Approx. 28cm tall · 18cm wide"],
      stock: 8, featured: true },
    { productId: "mc-p-002", slug: "blush-lily-bouquet", name: "Blush Lily Bouquet", category: "bouquets",
      price: 649, shortDescription: "Hand-shaped lilies in blush and ivory, gathered with kraft paper.",
      handmadeDetails: ["9 hand-shaped lilies", "Kraft paper wrap with twine", "Approx. 32cm tall"],
      stock: 5, featured: true },
    { productId: "mc-p-003", slug: "spring-meadow-bouquet", name: "Spring Meadow Bouquet", category: "bouquets",
      price: 899, shortDescription: "A wildflower-style mix of pipe cleaner blooms in soft pastels.",
      handmadeDetails: ["Mixed-bloom arrangement", "Pastel palette: blush, mint, butter", "Hand-tied with lace ribbon"],
      stock: 3, featured: false },
    { productId: "mc-p-004", slug: "single-stem-rose", name: "Single-Stem Rose", category: "pipe-cleaner",
      price: 99, shortDescription: "A single handcrafted pipe-cleaner rose — the perfect little gift.",
      handmadeDetails: ["Hand-shaped petals", "Approx. 22cm stem", "Choice of pink, red, or ivory (specify on order)"],
      stock: 24, featured: false },
    { productId: "mc-p-005", slug: "trio-of-tulips", name: "Trio of Tulips", category: "pipe-cleaner",
      price: 249, shortDescription: "Three handcrafted tulips, tied together with a delicate ribbon.",
      handmadeDetails: ["Three pipe-cleaner tulips", "Pastel colour mix", "Ribbon wrap"],
      stock: 12, featured: true },
    { productId: "mc-p-006", slug: "cottage-bloom-pot", name: "Cottage Bloom Pot", category: "flower-pots",
      price: 899, shortDescription: "A miniature ceramic pot brimming with handmade flowers.",
      handmadeDetails: ["Ceramic pot · approx. 10cm diameter", "Mixed pipe-cleaner blooms", "Ready to display"],
      stock: 4, featured: false },
    { productId: "mc-p-007", slug: "tiny-terrace-planter", name: "Tiny Terrace Planter", category: "flower-pots",
      price: 599, shortDescription: "A petite planter perfect for desks and bedside tables.",
      handmadeDetails: ["Hand-painted terracotta pot", "3 pipe-cleaner blooms", "Wipe-clean, no watering needed"],
      stock: 7, featured: false },
    { productId: "mc-p-008", slug: "love-note-gift-box", name: "Love Note Gift Box", category: "gifts",
      price: 749, shortDescription: "A gift box with a mini bouquet and handwritten love note.",
      handmadeDetails: ["Mini bouquet of 5 stems", "Handwritten note (specify wording on order)", "Branded gift box"],
      stock: 6, featured: true },
    { productId: "mc-p-009", slug: "anniversary-keepsake-set", name: "Anniversary Keepsake Set", category: "gifts",
      price: 1299, shortDescription: "A keepsake bouquet paired with a candle floral piece.",
      handmadeDetails: ["Handmade bouquet of 7 stems", "Matching candle floral piece", "Gift-ready presentation"],
      stock: 3, featured: false },
    { productId: "mc-p-010", slug: "birthday-blooms-set", name: "Birthday Blooms Set", category: "gifts",
      price: 599, shortDescription: "A bright handmade bouquet with a birthday tag.",
      handmadeDetails: ["Mixed-bloom mini bouquet", "Birthday card included", "Bright cheerful palette"],
      stock: 9, featured: false },
    { productId: "mc-p-011", slug: "pink-petal-candle", name: "Pink Petal Candle", category: "candle-floral",
      price: 699, shortDescription: "A scented candle wrapped in handmade rose petals.",
      handmadeDetails: ["Soy wax · rose scent", "Hand-shaped petal wrap", "Approx. 8cm tall"], stock: 5, featured: false },
    { productId: "mc-p-012", slug: "blush-glow-candle", name: "Blush Glow Candle", category: "candle-floral",
      price: 849, shortDescription: "A larger candle with a halo of handmade pink blooms.",
      handmadeDetails: ["Soy wax · jasmine scent", "Bloom halo arrangement", "Approx. 12cm tall"], stock: 0, featured: false },
  ];

  const now = new Date();
  for (const p of products) {
    await db.collection("products").updateOne(
      { productId: p.productId },
      {
        $setOnInsert: {
          ...p,
          images: [] as ObjectId[],
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true }
    );
  }

  // === Indexes ===
  await db.collection("products").createIndex({ slug: 1 }, { unique: true });
  await db.collection("products").createIndex({ productId: 1 }, { unique: true });
  await db.collection("products").createIndex({ category: 1 });
  await db.collection("products").createIndex({ featured: -1, createdAt: -1 });
  await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
  await db.collection("categories").createIndex({ order: 1 });
  await db.collection("images").createIndex({ createdAt: -1 });

  console.log("Catalog seeded + indexes created.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 7: Run the seed (or skip — user decides)**

If the user chose to seed:
```powershell
npx tsx scripts/seedCatalog.ts --seed
```
Expected: `Catalog seeded + indexes created.`

If the user chose blank start: skip this step.

- [ ] **Step 8: Delete `src/data/products.ts` and `src/data/categories.ts`**

```powershell
git rm src/data/products.ts src/data/categories.ts
```

- [ ] **Step 9: Type-check + lint + build**

```powershell
npx tsc --noEmit
node_modules/.bin/eslint .
npm run build
```
Expected: all clean. The build should still succeed (storefront pages are dynamic since they hit Mongo; catalog calls await safely).

If `tsc` complains about a Phase 1 file that still imports from `@/data/...`, grep and fix:
```powershell
grep -rn "@/data/products\|@/data/categories" src 2>$null
```
Expected: zero matches.

- [ ] **Step 10: Commit (one big migration commit — easier to revert than splitting)**

```powershell
git add -A
git commit -m "feat: migrate catalog to MongoDB via lib/catalog.ts; delete src/data/

repriceCart refactored to take a product map (sync stays sync).
createOrder fetches the map once. Storefront pages swap imports
+ add await. Opt-in seed script created. src/data/ deleted."
```

---

## Task 5: `requireAdminSession()` helper for server actions / route handlers

**Files:** Modify `src/lib/adminSession.ts` to add the server-side helper.

- [ ] **Step 1: Append to `src/lib/adminSession.ts`**

Add to the bottom of the file:
```ts
import { cookies } from "next/headers";

/**
 * Use inside server actions and protected route handlers. Reads the
 * session cookie, verifies the JWT, throws if invalid/missing.
 * Middleware (proxy.ts) is the perimeter; this is the inner ring.
 */
export async function requireAdminSession(): Promise<{ email: string }> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value ?? "";
  const session = await verifyAdminToken(token);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return { email: session.sub };
}

/** Non-throwing variant for layouts that want to render the admin email. */
export async function getAdminSession(): Promise<{ email: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value ?? "";
  const session = await verifyAdminToken(token);
  return session ? { email: session.sub } : null;
}
```

- [ ] **Step 2: Type-check + run existing tests**

```powershell
npx tsc --noEmit
npx vitest run adminSession
```
Expected: 0 TS errors. The existing 3 tests still pass (they don't touch `cookies()` so no DOM/Next-runtime needed).

- [ ] **Step 3: Commit**

```powershell
git add src/lib/adminSession.ts
git commit -m "feat: requireAdminSession / getAdminSession server helpers"
```

---

## Task 20: Product Zod schema + admin actions (TDD for schema)

**Files:** Create `src/lib/validation/product.ts` + `.test.ts`, `src/actions/productAdmin.ts`.

- [ ] **Step 1: Write the schema test**

Create `src/lib/validation/product.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { productSchema } from "./product";

const valid = {
  name: "Rose Garden Bouquet",
  slug: "rose-garden-bouquet",
  category: "bouquets",
  price: 499,
  stock: 8,
  featured: true,
  shortDescription: "A dozen handmade pipe-cleaner roses.",
  handmadeDetails: ["12 roses", "Satin ribbon"],
  images: [],
};

describe("productSchema", () => {
  it("accepts valid input", () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects empty name", () => {
    expect(productSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
  it("rejects non-kebab slug", () => {
    expect(productSchema.safeParse({ ...valid, slug: "Rose Bouquet" }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, slug: "rose_bouquet" }).success).toBe(false);
  });
  it("rejects negative price/stock", () => {
    expect(productSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, stock: -1 }).success).toBe(false);
  });
  it("accepts up to 6 image IDs", () => {
    const six = Array.from({ length: 6 }, () => "507f1f77bcf86cd799439011");
    expect(productSchema.safeParse({ ...valid, images: six }).success).toBe(true);
  });
  it("rejects 7+ images", () => {
    const seven = Array.from({ length: 7 }, () => "507f1f77bcf86cd799439011");
    expect(productSchema.safeParse({ ...valid, images: seven }).success).toBe(false);
  });
  it("rejects malformed ObjectId hex", () => {
    expect(
      productSchema.safeParse({ ...valid, images: ["nope"] }).success
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```powershell
npx vitest run validation/product
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/validation/product.ts`**

```ts
import { z } from "zod";

const objectIdHex = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid image reference.");

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case (lowercase, hyphens)."),
  category: z.string().trim().min(1, "Category is required."),
  price: z.number().int().min(0, "Price must be ≥ 0."),
  stock: z.number().int().min(0, "Stock must be ≥ 0."),
  featured: z.boolean().default(false),
  shortDescription: z.string().trim().min(1).max(200),
  handmadeDetails: z.array(z.string().trim().max(120)).max(10),
  images: z.array(objectIdHex).max(6, "Maximum of 6 images per product."),
});

export type ProductInput = z.infer<typeof productSchema>;
```

- [ ] **Step 4: Run, expect 7/7 PASS**

```powershell
npx vitest run validation/product
```

- [ ] **Step 5: Write the admin actions**

Create `src/actions/productAdmin.ts`:
```ts
"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/adminSession";
import { productSchema } from "@/lib/validation/product";
import type { ProductDoc } from "@/types/catalog";

type Result = { ok: true; id?: string } | { ok: false; error: string };

function generateProductId(): string {
  // mc-p-XXX with 4-digit zero-pad based on a timestamp tail. Not collision-proof
  // for parallel admin creates (which don't happen at one-admin scale).
  const tail = Date.now().toString().slice(-6);
  return `mc-p-${tail}`;
}

async function uniqueSlugCheck(slug: string, excludeId?: string): Promise<boolean> {
  const db = await getDb();
  const filter: Record<string, unknown> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new ObjectId(excludeId) };
  }
  const existing = await db.collection<ProductDoc>("products").findOne(filter);
  return !existing;
}

export async function createProduct(input: unknown): Promise<Result> {
  await requireAdminSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };
  if (!(await uniqueSlugCheck(parsed.data.slug))) {
    return { ok: false, error: "A product with that slug already exists." };
  }
  const db = await getDb();
  const now = new Date();
  const _id = new ObjectId();
  await db.collection<ProductDoc>("products").insertOne({
    _id,
    productId: generateProductId(),
    slug: parsed.data.slug,
    name: parsed.data.name,
    category: parsed.data.category,
    price: parsed.data.price,
    stock: parsed.data.stock,
    featured: parsed.data.featured,
    shortDescription: parsed.data.shortDescription,
    handmadeDetails: parsed.data.handmadeDetails,
    images: parsed.data.images.map((hex) => new ObjectId(hex)),
    createdAt: now,
    updatedAt: now,
  });
  return { ok: true, id: _id.toHexString() };
}

export async function updateProduct(id: string, input: unknown): Promise<Result> {
  await requireAdminSession();
  if (!ObjectId.isValid(id)) return { ok: false, error: "Invalid product id." };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };
  const db = await getDb();
  // Slug immutable post-create — ignore any client-sent slug change.
  const existing = await db
    .collection<ProductDoc>("products")
    .findOne({ _id: new ObjectId(id) });
  if (!existing) return { ok: false, error: "Product not found." };

  await db.collection<ProductDoc>("products").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        // slug: NOT updated — immutable
        name: parsed.data.name,
        category: parsed.data.category,
        price: parsed.data.price,
        stock: parsed.data.stock,
        featured: parsed.data.featured,
        shortDescription: parsed.data.shortDescription,
        handmadeDetails: parsed.data.handmadeDetails,
        images: parsed.data.images.map((hex) => new ObjectId(hex)),
        updatedAt: new Date(),
      },
    }
  );
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<Result> {
  await requireAdminSession();
  if (!ObjectId.isValid(id)) return { ok: false, error: "Invalid product id." };
  const db = await getDb();
  await db.collection<ProductDoc>("products").deleteOne({ _id: new ObjectId(id) });
  return { ok: true };
}
```

- [ ] **Step 6: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/validation/product.ts src/lib/validation/product.test.ts src/actions/productAdmin.ts
git commit -m "feat: productSchema + admin actions (create/update/delete) with tests"
```

---

## Task 21: MultiImagePicker component

**Files:** Create `src/components/admin/MultiImagePicker.tsx`.

A self-contained client component the product form uses. Each picked file is uploaded to `/api/admin/images`, returning an ObjectId hex string. The component stores an array of hex IDs; reorder via left/right arrow buttons; remove with ✕.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { AdminButton } from "./AdminButton";
import { cn } from "@/lib/cn";

type Props = {
  value: string[]; // ObjectId hex IDs
  onChange: (next: string[]) => void;
  max?: number;
};

export function MultiImagePicker({ value, onChange, max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (files: FileList) => {
    if (value.length + files.length > max) {
      toast.error(`Maximum ${max} images.`);
      return;
    }
    setUploading(true);
    const next = [...value];
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/images", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.id) {
          toast.error(json.error ?? `Upload failed for ${file.name}`);
          continue;
        }
        next.push(json.id);
      } catch {
        toast.error(`Upload failed for ${file.name}`);
      }
    }
    onChange(next);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const remove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((id, idx) => (
          <div key={id + idx} className="relative aspect-square rounded-xl overflow-hidden bg-brand-blush border border-brand-blush">
            <Image
              src={`/api/images/${id}`}
              alt={`Image ${idx + 1}`}
              fill
              sizes="120px"
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-1 bg-white/80 backdrop-blur">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="text-xs px-1 cursor-pointer disabled:opacity-30"
                aria-label="Move left"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-xs px-1 cursor-pointer text-red-600"
                aria-label="Remove"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === value.length - 1}
                className="text-xs px-1 cursor-pointer disabled:opacity-30"
                aria-label="Move right"
              >
                →
              </button>
            </div>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed border-brand-pink-soft bg-brand-blush/20",
              "flex flex-col items-center justify-center text-xs text-brand-ink-muted",
              "cursor-pointer hover:bg-brand-blush/30 transition-colors disabled:opacity-50"
            )}
          >
            <span className="text-2xl">+</span>
            <span className="mt-1">{uploading ? "Uploading…" : "Add image"}</span>
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-brand-ink-muted">
        {value.length}/{max} · JPG/PNG/WebP · ≤5MB each
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/components/admin/MultiImagePicker.tsx
git commit -m "feat: MultiImagePicker (upload, reorder, remove)"
```

---

## Task 22: Products list page

**Files:** Create `src/app/admin/(authenticated)/products/page.tsx`.

- [ ] **Step 1: Write the list page**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts, getAllCategories } from "@/lib/catalog";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminButton } from "@/components/admin/AdminButton";
import { formatPrice } from "@/lib/formatPrice";

export const metadata: Metadata = { title: "Admin · Products" };

export default async function AdminProductsList({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [allProducts, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  const filtered = allProducts.filter((p) => {
    if (sp.category && sp.category !== "all" && p.category !== sp.category) return false;
    if (sp.q && !p.name.toLowerCase().includes(sp.q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Products ({allProducts.length})</h1>
        <AdminButton href="/admin/products/new" size="sm">+ New Product</AdminButton>
      </header>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search by name…"
          className="rounded-full border border-brand-blush bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
        />
        <select
          name="category"
          defaultValue={sp.category ?? "all"}
          className="rounded-full border border-brand-blush bg-white px-4 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <AdminButton type="submit" variant="secondary" size="sm">Filter</AdminButton>
      </form>

      <AdminCard>
        <AdminTable
          rows={filtered}
          rowKey={(p) => p.id}
          emptyMessage="No products yet — add your first."
          columns={[
            { key: "thumb", label: "", render: (p) =>
                p.images[0] ? (
                  <div className="relative h-10 w-10 rounded overflow-hidden bg-brand-blush">
                    <Image src={p.images[0]} alt={p.name} fill sizes="40px" unoptimized className="object-cover" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded bg-brand-blush" />
                ),
              className: "w-16",
            },
            { key: "name", label: "Name", render: (p) => (
                <Link href={`/admin/products/${p.id}/edit`} className="font-semibold hover:text-brand-pink cursor-pointer">
                  {p.name}
                </Link>
            )},
            { key: "category", label: "Category", render: (p) => p.category },
            { key: "price", label: "Price", render: (p) => formatPrice(p.price), className: "tabular-nums" },
            { key: "stock", label: "Stock", render: (p) =>
                <span className={p.stock <= 0 ? "text-brand-pink font-bold" : ""}>{p.stock}</span>
            },
            { key: "featured", label: "Featured", render: (p) => (p.featured ? "★" : "") },
            { key: "actions", label: "", render: (p) => (
                <AdminButton href={`/admin/products/${p.id}/edit`} variant="ghost" size="sm">Edit</AdminButton>
            )},
          ]}
        />
      </AdminCard>
    </div>
  );
}
```

> **Note on `p.id`:** the public `Product.id` is the human `productId` (e.g. `mc-p-001`). The admin edit page however needs the MongoDB `_id` hex. We resolve this in Task 23 by looking up by `productId` instead, OR by adding a separate `_id` accessor. The simpler path: have the edit URL use `productId` and the action look up by `productId`. Refactor Task 23 to use that.

- [ ] **Step 2: Commit**

```powershell
npx tsc --noEmit
git add "src/app/admin/(authenticated)/products/page.tsx"
git commit -m "feat: admin products list with search + category filter"
```

---

## Task 23: Product create / edit / delete pages with MultiImagePicker

**Files:** Create `src/components/admin/ProductForm.tsx`, `src/app/admin/(authenticated)/products/new/page.tsx`, `src/app/admin/(authenticated)/products/[id]/edit/page.tsx`, `src/components/admin/DeleteProductButton.tsx`.

Note: `[id]` here is the public `productId` (e.g. `mc-p-001`) — we look up the doc by `productId`, then call actions using the doc's `_id`.

- [ ] **Step 1: ProductForm (Client)**

```tsx
"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { productSchema, type ProductInput } from "@/lib/validation/product";
import { createProduct, updateProduct } from "@/actions/productAdmin";
import { AdminButton } from "./AdminButton";
import { MultiImagePicker } from "./MultiImagePicker";
import type { Category } from "@/types/product";

const field =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

type Props = {
  categories: Category[];
  mode: "create" | "edit";
  productMongoId?: string; // hex _id for updates
  initial?: ProductInput & { slug: string };
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({ categories, mode, productMongoId, initial }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initial ?? {
      name: "",
      slug: "",
      category: categories[0]?.slug ?? "",
      price: 0,
      stock: 0,
      featured: false,
      shortDescription: "",
      handmadeDetails: [],
      images: [],
    },
  });

  const detailsArr = useFieldArray({ control, name: "handmadeDetails" as never });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    const res = isEdit && productMongoId
      ? await updateProduct(productMongoId, data)
      : await createProduct(data);
    if (res.ok) {
      toast.success(isEdit ? "Product saved" : "Product created");
      router.push("/admin/products");
    } else {
      toast.error(res.error);
      setSubmitting(false);
    }
  });

  const name = watch("name");
  // Auto-suggest slug on create when slug is blank.
  if (!isEdit && name && watch("slug") === "") {
    setValue("slug", slugify(name));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Name</span>
          <input className={field} {...register("name")} />
          {errors.name && <span className="text-xs text-brand-pink">{errors.name.message}</span>}
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">
            Slug {isEdit && <span className="text-brand-pink-dark">(permanent)</span>}
          </span>
          <input className={field} {...register("slug")} disabled={isEdit} />
          {errors.slug && <span className="text-xs text-brand-pink">{errors.slug.message}</span>}
          {isEdit && (
            <p className="mt-1 text-[10px] text-brand-ink-muted">
              Slugs are permanent — create a new entry to change the URL.
            </p>
          )}
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Category</span>
          <select className={field} {...register("category")}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Price (₹)</span>
          <input className={field} type="number" {...register("price", { valueAsNumber: true })} />
          {errors.price && <span className="text-xs text-brand-pink">{errors.price.message}</span>}
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Stock</span>
          <input className={field} type="number" {...register("stock", { valueAsNumber: true })} />
        </label>
        <label className="flex items-center gap-3 mt-7">
          <input type="checkbox" {...register("featured")} />
          <span className="text-sm">Featured on home</span>
        </label>
      </div>

      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Short description</span>
        <textarea className={field} rows={3} {...register("shortDescription")} />
        {errors.shortDescription && (
          <span className="text-xs text-brand-pink">{errors.shortDescription.message}</span>
        )}
      </label>

      <div>
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Handmade details</span>
        <div className="space-y-2">
          {detailsArr.fields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <input className={field} {...register(`handmadeDetails.${i}` as const)} />
              <AdminButton type="button" variant="ghost" size="sm" onClick={() => detailsArr.remove(i)}>✕</AdminButton>
            </div>
          ))}
          <AdminButton type="button" variant="secondary" size="sm" onClick={() => detailsArr.append("")}>+ Detail</AdminButton>
        </div>
      </div>

      <div>
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Images</span>
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <MultiImagePicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.images && <span className="text-xs text-brand-pink">{(errors.images as { message?: string }).message}</span>}
      </div>

      <div className="flex gap-3 pt-4 border-t border-brand-blush">
        <AdminButton type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save" : "Create Product"}
        </AdminButton>
        <AdminButton href="/admin/products" variant="ghost">Cancel</AdminButton>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Delete-product button (Client)**

Create `src/components/admin/DeleteProductButton.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/productAdmin";
import { AdminButton } from "./AdminButton";

export function DeleteProductButton({
  productMongoId,
  productName,
}: {
  productMongoId: string;
  productName: string;
}) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = typed.trim().toLowerCase() === productName.toLowerCase();

  const onConfirm = async () => {
    setSubmitting(true);
    const res = await deleteProduct(productMongoId);
    if (res.ok) {
      toast.success("Product deleted");
      router.push("/admin/products");
    } else {
      toast.error(res.error);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 p-4 border border-red-200 rounded-2xl bg-red-50/40 max-w-md">
      <p className="text-sm font-semibold text-red-700">Delete this product?</p>
      <p className="text-xs text-brand-ink-muted">
        Type <span className="font-mono">{productName}</span> to confirm.
      </p>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="w-full rounded border border-red-300 bg-white px-3 py-2 text-sm"
      />
      <AdminButton variant="danger" disabled={!canSubmit || submitting} onClick={onConfirm}>
        {submitting ? "Deleting…" : "Delete"}
      </AdminButton>
    </div>
  );
}
```

- [ ] **Step 3: New product page**

Create `src/app/admin/(authenticated)/products/new/page.tsx`:
```tsx
import type { Metadata } from "next";
import { getAllCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Admin · New Product" };

export default async function NewProductPage() {
  const categories = await getAllCategories();
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">New product</h1>
      <ProductForm categories={categories} mode="create" />
    </div>
  );
}
```

- [ ] **Step 4: Edit product page**

Create `src/app/admin/(authenticated)/products/[id]/edit/page.tsx`:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { getAllCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import type { ProductDoc } from "@/types/catalog";

export const metadata: Metadata = { title: "Admin · Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const doc = await db.collection<ProductDoc>("products").findOne({ productId: id });
  if (!doc) notFound();

  const categories = await getAllCategories();
  return (
    <div className="space-y-10 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold">Edit {doc.name}</h1>
        <p className="text-xs text-brand-ink-muted mt-1 font-mono">{doc.productId}</p>
      </header>
      <ProductForm
        categories={categories}
        mode="edit"
        productMongoId={doc._id.toHexString()}
        initial={{
          name: doc.name,
          slug: doc.slug,
          category: doc.category,
          price: doc.price,
          stock: doc.stock,
          featured: doc.featured,
          shortDescription: doc.shortDescription,
          handmadeDetails: doc.handmadeDetails,
          images: doc.images.map((id) => id.toHexString()),
        }}
      />
      <div className="pt-8 border-t border-brand-blush">
        <DeleteProductButton productMongoId={doc._id.toHexString()} productName={doc.name} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/components/admin/ProductForm.tsx src/components/admin/DeleteProductButton.tsx "src/app/admin/(authenticated)/products/new/page.tsx" "src/app/admin/(authenticated)/products/[id]/edit/page.tsx"
git commit -m "feat: product create/edit/delete admin pages with MultiImagePicker"
```

---

## Task 24: Category schema + admin actions

**Files:** Create `src/lib/validation/category.ts` + `.test.ts`, `src/actions/categoryAdmin.ts`.

- [ ] **Step 1: Schema test + impl (TDD)**

Create `src/lib/validation/category.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { categorySchema } from "./category";

const valid = {
  name: "Handmade Bouquets",
  slug: "bouquets",
  description: "Hand-tied.",
  image: null,
};

describe("categorySchema", () => {
  it("accepts valid", () => {
    expect(categorySchema.safeParse(valid).success).toBe(true);
  });
  it("rejects bad slug", () => {
    expect(categorySchema.safeParse({ ...valid, slug: "Bad Slug" }).success).toBe(false);
  });
  it("accepts an image ObjectId hex", () => {
    expect(
      categorySchema.safeParse({ ...valid, image: "507f1f77bcf86cd799439011" }).success
    ).toBe(true);
  });
});
```

Create `src/lib/validation/category.ts`:
```ts
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case."),
  description: z.string().trim().min(1).max(200),
  image: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
```

Run `npx vitest run validation/category` → 3/3 PASS.

- [ ] **Step 2: Actions (create / update / delete / reorder)**

Create `src/actions/categoryAdmin.ts`:
```ts
"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/adminSession";
import { categorySchema } from "@/lib/validation/category";
import type { CategoryDoc } from "@/types/catalog";

type Result = { ok: true; id?: string } | { ok: false; error: string };

async function uniqueSlugCheck(slug: string, excludeId?: string): Promise<boolean> {
  const db = await getDb();
  const filter: Record<string, unknown> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new ObjectId(excludeId) };
  }
  const existing = await db.collection<CategoryDoc>("categories").findOne(filter);
  return !existing;
}

export async function createCategory(input: unknown): Promise<Result> {
  await requireAdminSession();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  if (!(await uniqueSlugCheck(parsed.data.slug))) {
    return { ok: false, error: "Slug already exists." };
  }
  const db = await getDb();
  const now = new Date();
  const _id = new ObjectId();
  const count = await db.collection<CategoryDoc>("categories").countDocuments();
  await db.collection<CategoryDoc>("categories").insertOne({
    _id,
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description,
    image: parsed.data.image ? new ObjectId(parsed.data.image) : null,
    order: count,
    createdAt: now,
    updatedAt: now,
  });
  return { ok: true, id: _id.toHexString() };
}

export async function updateCategory(id: string, input: unknown): Promise<Result> {
  await requireAdminSession();
  if (!ObjectId.isValid(id)) return { ok: false, error: "Invalid id." };
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  const db = await getDb();
  await db.collection<CategoryDoc>("categories").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        // slug immutable
        name: parsed.data.name,
        description: parsed.data.description,
        image: parsed.data.image ? new ObjectId(parsed.data.image) : null,
        updatedAt: new Date(),
      },
    }
  );
  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<Result> {
  await requireAdminSession();
  if (!ObjectId.isValid(id)) return { ok: false, error: "Invalid id." };
  const db = await getDb();
  const cat = await db.collection<CategoryDoc>("categories").findOne({ _id: new ObjectId(id) });
  if (!cat) return { ok: false, error: "Category not found." };
  const inUse = await db.collection("products").countDocuments({ category: cat.slug });
  if (inUse > 0) return { ok: false, error: `Cannot delete — ${inUse} product(s) still use this category.` };
  await db.collection<CategoryDoc>("categories").deleteOne({ _id: new ObjectId(id) });
  return { ok: true };
}

export async function reorderCategories(orderedSlugs: string[]): Promise<Result> {
  await requireAdminSession();
  const db = await getDb();
  const ops = orderedSlugs.map((slug, idx) => ({
    updateOne: {
      filter: { slug },
      update: { $set: { order: idx, updatedAt: new Date() } },
    },
  }));
  if (ops.length === 0) return { ok: true };
  await db.collection<CategoryDoc>("categories").bulkWrite(ops);
  return { ok: true };
}
```

- [ ] **Step 3: Commit**

```powershell
npx tsc --noEmit
git add src/lib/validation/category.ts src/lib/validation/category.test.ts src/actions/categoryAdmin.ts
git commit -m "feat: categorySchema + admin actions (CRUD + reorder + in-use guard)"
```

---

## Task 25: Category list / new / edit pages

**Files:** Create `src/app/admin/(authenticated)/categories/{page,new,[id]/edit}/page.tsx`, `src/components/admin/CategoryForm.tsx`, `src/components/admin/CategoryReorderList.tsx`, `src/components/admin/ImagePicker.tsx`.

- [ ] **Step 1: Single-image picker (used by category + content forms)**

Create `src/components/admin/ImagePicker.tsx`:
```tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { AdminButton } from "./AdminButton";

type Props = {
  value: string | null;
  onChange: (next: string | null) => void;
};

export function ImagePicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (f: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/images", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.id) {
        toast.error(json.error ?? "Upload failed");
      } else {
        onChange(json.id);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      {value ? (
        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-brand-blush border border-brand-blush">
          <Image src={`/api/images/${value}`} alt="" fill sizes="96px" unoptimized className="object-cover" />
        </div>
      ) : (
        <div className="h-24 w-24 rounded-xl bg-brand-blush/40 flex items-center justify-center text-brand-ink-muted text-xs">
          No image
        </div>
      )}
      <div className="flex flex-col gap-2">
        <AdminButton type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
        </AdminButton>
        {value && (
          <AdminButton type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>Remove</AdminButton>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Reorder list (Client) — minimal HTML5 drag-and-drop**

Create `src/components/admin/CategoryReorderList.tsx`:
```tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { reorderCategories } from "@/actions/categoryAdmin";
import { AdminButton } from "./AdminButton";
import type { Category } from "@/types/product";

type Row = Category & { productCount: number; mongoId: string };

export function CategoryReorderList({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [pending, start] = useTransition();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const onDrop = (target: number) => {
    if (dragIdx === null || dragIdx === target) {
      setDragIdx(null);
      return;
    }
    const next = [...rows];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(target, 0, moved);
    setRows(next);
    setDragIdx(null);
    start(async () => {
      const res = await reorderCategories(next.map((r) => r.slug));
      if (res.ok) toast.success("Order saved");
      else toast.error(res.error);
    });
  };

  return (
    <ul className="divide-y divide-brand-blush">
      {rows.map((c, idx) => (
        <li
          key={c.slug}
          draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(idx)}
          className="flex items-center gap-4 py-3 cursor-grab active:cursor-grabbing"
        >
          <span className="text-brand-ink-muted">≡</span>
          {c.image ? (
            <div className="relative h-10 w-10 rounded overflow-hidden bg-brand-blush">
              <Image src={c.image} alt={c.name} fill sizes="40px" unoptimized className="object-cover" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded bg-brand-blush" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{c.name}</p>
            <p className="text-xs text-brand-ink-muted font-mono">{c.slug}</p>
          </div>
          <p className="text-xs text-brand-ink-muted">{c.productCount} prod.</p>
          <AdminButton href={`/admin/categories/${c.mongoId}/edit`} variant="ghost" size="sm">Edit</AdminButton>
        </li>
      ))}
      {pending && <li className="py-2 text-xs text-brand-ink-muted text-center">Saving order…</li>}
    </ul>
  );
}
```

- [ ] **Step 3: Categories list page**

Create `src/app/admin/(authenticated)/categories/page.tsx`:
```tsx
import type { Metadata } from "next";
import { getDb } from "@/lib/mongodb";
import { mapCategoryDoc } from "@/lib/mapProductDoc";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { CategoryReorderList } from "@/components/admin/CategoryReorderList";
import type { CategoryDoc } from "@/types/catalog";

export const metadata: Metadata = { title: "Admin · Categories" };

export default async function CategoriesListPage() {
  const db = await getDb();
  const docs = await db.collection<CategoryDoc>("categories").find({}).sort({ order: 1 }).toArray();
  const rows = await Promise.all(
    docs.map(async (d) => {
      const productCount = await db.collection("products").countDocuments({ category: d.slug });
      return { ...mapCategoryDoc(d), productCount, mongoId: d._id.toHexString() };
    })
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex items-end justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <AdminButton href="/admin/categories/new" size="sm">+ New Category</AdminButton>
      </header>

      <AdminCard>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-brand-ink-muted">No categories yet — add your first.</p>
        ) : (
          <CategoryReorderList initial={rows} />
        )}
      </AdminCard>
    </div>
  );
}
```

- [ ] **Step 4: Category form (Client)**

Create `src/components/admin/CategoryForm.tsx`:
```tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { categorySchema, type CategoryInput } from "@/lib/validation/category";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categoryAdmin";
import { AdminButton } from "./AdminButton";
import { ImagePicker } from "./ImagePicker";

const field =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

type Props = {
  mode: "create" | "edit";
  mongoId?: string;
  initial?: CategoryInput;
};

export function CategoryForm({ mode, mongoId, initial }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initial ?? { name: "", slug: "", description: "", image: null },
  });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    const res = isEdit && mongoId
      ? await updateCategory(mongoId, data)
      : await createCategory(data);
    if (res.ok) {
      toast.success(isEdit ? "Category saved" : "Category created");
      router.push("/admin/categories");
    } else {
      toast.error(res.error);
      setSubmitting(false);
    }
  });

  const onDelete = async () => {
    if (!mongoId) return;
    if (!confirm("Delete this category?")) return;
    setDeleting(true);
    const res = await deleteCategory(mongoId);
    if (res.ok) {
      toast.success("Category deleted");
      router.push("/admin/categories");
    } else {
      toast.error(res.error);
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Name</span>
        <input className={field} {...register("name")} />
        {errors.name && <span className="text-xs text-brand-pink">{errors.name.message}</span>}
      </label>
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">
          Slug {isEdit && <span className="text-brand-pink-dark">(permanent)</span>}
        </span>
        <input className={field} {...register("slug")} disabled={isEdit} />
        {errors.slug && <span className="text-xs text-brand-pink">{errors.slug.message}</span>}
      </label>
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Description</span>
        <textarea className={field} rows={3} {...register("description")} />
        {errors.description && <span className="text-xs text-brand-pink">{errors.description.message}</span>}
      </label>
      <div>
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Image</span>
        <Controller
          control={control}
          name="image"
          render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div className="flex gap-3 pt-4 border-t border-brand-blush">
        <AdminButton type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save" : "Create"}
        </AdminButton>
        <AdminButton href="/admin/categories" variant="ghost">Cancel</AdminButton>
        {isEdit && (
          <AdminButton type="button" variant="danger" onClick={onDelete} disabled={deleting} className="ml-auto">
            {deleting ? "Deleting…" : "Delete"}
          </AdminButton>
        )}
      </div>
    </form>
  );
}
```

- [ ] **Step 5: New + edit pages**

Create `src/app/admin/(authenticated)/categories/new/page.tsx`:
```tsx
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata = { title: "Admin · New Category" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">New category</h1>
      <CategoryForm mode="create" />
    </div>
  );
}
```

Create `src/app/admin/(authenticated)/categories/[id]/edit/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { CategoryDoc } from "@/types/catalog";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata = { title: "Admin · Edit Category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();
  const db = await getDb();
  const doc = await db.collection<CategoryDoc>("categories").findOne({ _id: new ObjectId(id) });
  if (!doc) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Edit {doc.name}</h1>
      <CategoryForm
        mode="edit"
        mongoId={id}
        initial={{
          name: doc.name,
          slug: doc.slug,
          description: doc.description,
          image: doc.image ? doc.image.toHexString() : null,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 6: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/components/admin/ImagePicker.tsx src/components/admin/CategoryReorderList.tsx src/components/admin/CategoryForm.tsx "src/app/admin/(authenticated)/categories/page.tsx" "src/app/admin/(authenticated)/categories/new/page.tsx" "src/app/admin/(authenticated)/categories/[id]/edit/page.tsx"
git commit -m "feat: admin categories — list (reorder), new, edit pages"
```

---

## Task 26: Content hub + About + Hero editors

**Files:** Create `src/lib/validation/content.ts` + `.test.ts`, `src/actions/contentAdmin.ts`, `src/app/admin/(authenticated)/content/{page,about,hero}/page.tsx`, `src/components/admin/{AboutEditor,HeroEditor,MarkdownPreview}.tsx`.

- [ ] **Step 1: Schema + tests**

Create `src/lib/validation/content.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { aboutSchema, heroSchema } from "./content";

describe("aboutSchema", () => {
  it("accepts valid", () => {
    expect(aboutSchema.safeParse({ body: "## Hello", image: null, eyebrow: "Our Story" }).success).toBe(true);
  });
  it("rejects empty body", () => {
    expect(aboutSchema.safeParse({ body: "", image: null, eyebrow: "" }).success).toBe(false);
  });
});
describe("heroSchema", () => {
  it("accepts valid", () => {
    expect(heroSchema.safeParse({
      image: null, eyebrow: "X", tagline: "T", badgeLabel: "L", badgeText: "B",
    }).success).toBe(true);
  });
  it("rejects empty tagline", () => {
    expect(heroSchema.safeParse({
      image: null, eyebrow: "X", tagline: "", badgeLabel: "L", badgeText: "B",
    }).success).toBe(false);
  });
});
```

Create `src/lib/validation/content.ts`:
```ts
import { z } from "zod";

const objectIdOrNull = z.string().regex(/^[a-f\d]{24}$/i).nullable();

export const aboutSchema = z.object({
  body: z.string().trim().min(1, "Body is required.").max(10_000),
  image: objectIdOrNull,
  eyebrow: z.string().trim().max(80),
});
export type AboutInput = z.infer<typeof aboutSchema>;

export const heroSchema = z.object({
  image: objectIdOrNull,
  eyebrow: z.string().trim().min(1).max(80),
  tagline: z.string().trim().min(1).max(200),
  badgeLabel: z.string().trim().max(40),
  badgeText: z.string().trim().max(40),
});
export type HeroInput = z.infer<typeof heroSchema>;
```

Run: `npx vitest run validation/content` → 4/4 PASS.

- [ ] **Step 2: Content actions**

Create `src/actions/contentAdmin.ts`:
```ts
"use server";

import { requireAdminSession } from "@/lib/adminSession";
import { aboutSchema, heroSchema } from "@/lib/validation/content";
import { upsertAboutContent, upsertHeroContent } from "@/lib/content";

type Result = { ok: true } | { ok: false; error: string };

export async function updateAboutContent(input: unknown): Promise<Result> {
  await requireAdminSession();
  const parsed = aboutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  await upsertAboutContent(parsed.data);
  return { ok: true };
}

export async function updateHeroContent(input: unknown): Promise<Result> {
  await requireAdminSession();
  const parsed = heroSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  await upsertHeroContent(parsed.data);
  return { ok: true };
}
```

- [ ] **Step 3: Markdown preview (Client)**

Create `src/components/admin/MarkdownPreview.tsx`:
```tsx
"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownPreview({ body }: { body: string }) {
  return (
    <div className="prose prose-sm max-w-none text-brand-ink prose-headings:font-script prose-headings:text-brand-pink">
      <ReactMarkdown>{body || "_Nothing yet._"}</ReactMarkdown>
    </div>
  );
}
```

> If Tailwind's `prose` requires `@tailwindcss/typography`, install it:
> ```powershell
> npm install -D @tailwindcss/typography
> ```
> Then add `@plugin "@tailwindcss/typography";` to `src/app/globals.css` directly after `@import "tailwindcss";`. Re-run dev server.

- [ ] **Step 4: About editor (Client)**

Create `src/components/admin/AboutEditor.tsx`:
```tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { aboutSchema, type AboutInput } from "@/lib/validation/content";
import { updateAboutContent } from "@/actions/contentAdmin";
import { AdminButton } from "./AdminButton";
import { ImagePicker } from "./ImagePicker";
import { MarkdownPreview } from "./MarkdownPreview";

const field =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

export function AboutEditor({ initial }: { initial: AboutInput }) {
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<AboutInput>({
    resolver: zodResolver(aboutSchema),
    defaultValues: initial,
  });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    const res = await updateAboutContent(data);
    if (res.ok) toast.success("Saved");
    else toast.error(res.error);
    setSubmitting(false);
  });

  const body = watch("body");

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Eyebrow</span>
        <input className={field} {...register("eyebrow")} />
      </label>
      <div>
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Image</span>
        <Controller control={control} name="image" render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} />} />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold">Body (Markdown)</span>
          <AdminButton type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}>
            {preview ? "Edit" : "Preview"}
          </AdminButton>
        </div>
        {preview ? (
          <div className="rounded-xl border border-brand-blush bg-white p-5 min-h-[16rem]">
            <MarkdownPreview body={body} />
          </div>
        ) : (
          <textarea className={`${field} font-mono`} rows={16} {...register("body")} />
        )}
        {errors.body && <span className="text-xs text-brand-pink">{errors.body.message}</span>}
      </div>
      <AdminButton type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</AdminButton>
    </form>
  );
}
```

- [ ] **Step 5: Hero editor (Client)**

Create `src/components/admin/HeroEditor.tsx`:
```tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { heroSchema, type HeroInput } from "@/lib/validation/content";
import { updateHeroContent } from "@/actions/contentAdmin";
import { AdminButton } from "./AdminButton";
import { ImagePicker } from "./ImagePicker";

const field =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

export function HeroEditor({ initial }: { initial: HeroInput }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, watch } = useForm<HeroInput>({
    resolver: zodResolver(heroSchema),
    defaultValues: initial,
  });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    const res = await updateHeroContent(data);
    if (res.ok) toast.success("Saved");
    else toast.error(res.error);
    setSubmitting(false);
  });

  const v = watch();

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <div>
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Hero image</span>
          <Controller control={control} name="image" render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} />} />
        </div>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Eyebrow</span>
          <input className={field} {...register("eyebrow")} />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Tagline</span>
          <textarea className={field} rows={2} {...register("tagline")} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Badge label</span>
            <input className={field} {...register("badgeLabel")} />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Badge text</span>
            <input className={field} {...register("badgeText")} />
          </label>
        </div>
        <AdminButton type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</AdminButton>
      </div>
      <div className="bg-brand-cream border border-brand-blush rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand-ink-muted font-bold mb-3">Preview</p>
        <div className="relative aspect-square rounded-xl overflow-hidden bg-brand-blush">
          {v.image ? (
            <Image src={`/api/images/${v.image}`} alt="" fill sizes="400px" unoptimized className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-brand-ink-muted text-xs">No image</div>
          )}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-2xl px-3 py-2 flex items-center gap-2 shadow-petal-md">
            <div className="h-7 w-7 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm">✿</div>
            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-brand-pink-dark font-bold">{v.badgeLabel}</p>
              <p className="text-xs font-semibold">{v.badgeText}</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted font-bold">{v.eyebrow}</p>
        <p className="mt-3 text-sm text-brand-ink-muted leading-relaxed">{v.tagline}</p>
      </div>
    </form>
  );
}
```

- [ ] **Step 6: Content hub + About + Hero pages**

Create `src/app/admin/(authenticated)/content/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";

export const metadata: Metadata = { title: "Admin · Content" };

export default function ContentHubPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Content</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminCard>
          <h2 className="font-script text-2xl text-brand-pink">About page</h2>
          <p className="mt-2 text-sm text-brand-ink-muted">Edit the page copy, image, and eyebrow.</p>
          <Link href="/admin/content/about" className="mt-4 inline-block text-brand-pink font-semibold cursor-pointer">Edit →</Link>
        </AdminCard>
        <AdminCard>
          <h2 className="font-script text-2xl text-brand-pink">Hero</h2>
          <p className="mt-2 text-sm text-brand-ink-muted">Swap the right-side image and edit the eyebrow, tagline, and badge.</p>
          <Link href="/admin/content/hero" className="mt-4 inline-block text-brand-pink font-semibold cursor-pointer">Edit →</Link>
        </AdminCard>
      </div>
    </div>
  );
}
```

Create `src/app/admin/(authenticated)/content/about/page.tsx`:
```tsx
import { getAboutContent } from "@/lib/content";
import { AboutEditor } from "@/components/admin/AboutEditor";

export const metadata = { title: "Admin · About" };

export default async function AboutPage() {
  const c = await getAboutContent();
  // ImagePicker expects ObjectId hex, but getAboutContent returns the URL.
  // Strip back to hex for the form's initial value.
  const imageHex =
    c.image && c.image.startsWith("/api/images/") ? c.image.replace("/api/images/", "") : null;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">About page</h1>
      <AboutEditor initial={{ body: c.body, image: imageHex, eyebrow: c.eyebrow }} />
    </div>
  );
}
```

Create `src/app/admin/(authenticated)/content/hero/page.tsx`:
```tsx
import { getHeroContent } from "@/lib/content";
import { HeroEditor } from "@/components/admin/HeroEditor";

export const metadata = { title: "Admin · Hero" };

export default async function HeroEditorPage() {
  const h = await getHeroContent();
  const imageHex =
    h.image && h.image.startsWith("/api/images/") ? h.image.replace("/api/images/", "") : null;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hero</h1>
      <HeroEditor initial={{
        image: imageHex,
        eyebrow: h.eyebrow,
        tagline: h.tagline,
        badgeLabel: h.badgeLabel,
        badgeText: h.badgeText,
      }} />
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```powershell
npx tsc --noEmit
git add src/lib/validation/content.ts src/lib/validation/content.test.ts src/actions/contentAdmin.ts src/components/admin/MarkdownPreview.tsx src/components/admin/AboutEditor.tsx src/components/admin/HeroEditor.tsx "src/app/admin/(authenticated)/content/page.tsx" "src/app/admin/(authenticated)/content/about/page.tsx" "src/app/admin/(authenticated)/content/hero/page.tsx"
git commit -m "feat: content hub + About + Hero editors (Markdown + image)"
```

---

## Task 27: Storefront reads About + Hero from `content`; empty states everywhere

**Files:** Modify `src/app/(storefront)/page.tsx`, `src/app/(storefront)/about/page.tsx`, `src/app/(storefront)/shop/page.tsx`.

- [ ] **Step 1: Home Hero — read from content**

Edit `src/app/(storefront)/page.tsx`. Add at the top:
```ts
import { getHeroContent } from "@/lib/content";
```
Inside `HomePage`, add:
```ts
const hero = await getHeroContent();
```
Replace the hardcoded hero strings:
- The eyebrow text becomes `{hero.eyebrow}`
- The script "Maria Creations" heading stays (that's the brand name, not editable in Phase 3)
- The tagline `<p>` becomes `{hero.tagline}`
- The `<Image src="/Handmade-1.jpeg" ...>` becomes `<Image src={hero.image ?? "/Handmade-1.jpeg"} ...>` with `unoptimized` if the URL starts with `/api/images/` to avoid the optimizer trying to fetch through itself (or set `images.remotePatterns` in `next.config.ts` — simpler to use `unoptimized`):
```tsx
<Image
  src={hero.image ?? "/Handmade-1.jpeg"}
  alt="Handmade pipe-cleaner bouquet by Maria Creations"
  fill
  priority
  sizes="(max-width: 1024px) 100vw, 50vw"
  unoptimized={hero.image?.startsWith("/api/images/") ?? false}
  className="object-cover"
/>
```
- The badge texts: `{hero.badgeLabel}` and `{hero.badgeText}`.

Add empty-state guards. Find the Featured Bouquets `<section>` and wrap with:
```tsx
{featured.length > 0 && (
  <>
    <SectionDivider />
    {/* existing featured section */}
  </>
)}
```
Find the "Shop by Category" section and wrap similarly with `{categories.length > 0 && ...}`.

- [ ] **Step 2: About page — read from content**

Edit `src/app/(storefront)/about/page.tsx`. Replace the hardcoded body paragraphs with:
```tsx
import { getAboutContent } from "@/lib/content";
import { MarkdownView } from "@/components/storefront/MarkdownView";
// ...
const c = await getAboutContent();
// later in JSX:
<div className="max-w-3xl">
  <p className="text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted mb-3 font-semibold">
    {c.eyebrow || "Our Story"}
  </p>
  <ScriptHeading as="h1">A boutique made by hand</ScriptHeading>
  <div className="mt-6 prose prose-sm max-w-none text-brand-ink-muted">
    <MarkdownView body={c.body} />
  </div>
</div>
```
Replace the "Maria in the studio" image source with `c.image ?? "/Handmade-2.jpeg"` and add `unoptimized` for `/api/images/` URLs.

Create `src/components/storefront/MarkdownView.tsx`:
```tsx
import ReactMarkdown from "react-markdown";

export function MarkdownView({ body }: { body: string }) {
  return <ReactMarkdown>{body}</ReactMarkdown>;
}
```

- [ ] **Step 3: Shop empty state**

Edit `src/app/(storefront)/shop/page.tsx`. After awaiting the products + categories, add:
```tsx
if (products.length === 0) {
  return (
    <Container className="py-20 text-center">
      <ScriptHeading as="h1" align="center">Coming soon</ScriptHeading>
      <p className="mt-4 text-brand-ink-muted">
        We&apos;re putting our first flowers together — check back soon 🌸
      </p>
      <Link href="/" className="mt-6 inline-block text-brand-pink font-semibold cursor-pointer hover:underline">
        Back to home
      </Link>
    </Container>
  );
}
```
(Import `Link` from `next/link` if not already.)

For category-filtered shop (`/shop?category=X` with 0 results), the existing "Empty meadow" copy already covers this.

- [ ] **Step 4: Build, smoke-test, commit**

```powershell
npx tsc --noEmit
node_modules/.bin/eslint .
npm run build
```
All clean. Then:
```powershell
git add -A
git commit -m "feat: Home + About read from content collection; empty states wired"
```

---

## Task 28: Sonner toast system + audit wiring

**Files:** Create `src/components/storefront/StorefrontToaster.tsx`. Modify `src/app/(storefront)/layout.tsx`, `src/app/checkout/page.tsx`, `src/app/checkout/[orderId]/page.tsx`, `src/app/checkout/[orderId]/done/page.tsx`, `src/components/product/ProductCard.tsx`, `src/components/checkout/PaymentUpload.tsx`, `src/components/checkout/CheckoutForm.tsx`.

- [ ] **Step 1: `StorefrontToaster.tsx` (Client)**

```tsx
"use client";

import { Toaster } from "sonner";

export function StorefrontToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "!bg-white !text-brand-ink !border !border-brand-blush !shadow-petal-md !rounded-full",
          title: "!text-sm !font-semibold",
        },
      }}
    />
  );
}
```

- [ ] **Step 2: Mount in storefront + checkout layouts**

In `src/app/(storefront)/layout.tsx`, add `<StorefrontToaster />` as a sibling at the end of the JSX (before the closing fragment/wrapper).

In `src/app/checkout/page.tsx`, `[orderId]/page.tsx`, and `[orderId]/done/page.tsx`, do the same — these pages render their own chrome, so each needs its own `<StorefrontToaster />`.

- [ ] **Step 3: Wire toasts into ProductCard**

Edit `src/components/product/ProductCard.tsx`. Add `import { toast } from "sonner";` at top. Replace the `handleAdd` body:
```ts
  const handleAdd = () => {
    try {
      add(product.id);
      openCart();
      toast.success("Added to cart");
    } catch {
      toast.error("Couldn't add — try again");
    }
  };
```
And add toasts to wishlist toggle — change the heart button's onClick:
```ts
onClick={() => {
  toggleWish(product.id);
  toast.success(isWished ? "Removed from wishlist" : "Saved to wishlist");
}}
```

- [ ] **Step 4: Wire toasts into CheckoutForm**

Edit `src/components/checkout/CheckoutForm.tsx`. Replace the `else` branch in `onSubmit` (where it currently sets `submitError`) with:
```ts
} else {
  toast.error(result.error);
}
```
Remove the `submitError` state and the related JSX. Add `import { toast } from "sonner";`.

- [ ] **Step 5: Wire toasts into PaymentUpload**

Edit `src/components/checkout/PaymentUpload.tsx`. Add `import { toast } from "sonner";`. In the `onSubmit` function, replace the inline error setters with:
- On 409 / 200 success: `toast.success("Payment proof submitted")` before redirect.
- On other error responses: `toast.error(json.error ?? "Upload failed — please try again")` (keep the inline `setError` too for field context).
- On network error: keep inline.

- [ ] **Step 6: Cart drawer Remove**

Edit `src/components/layout/CartDrawer.tsx`. In the Remove button's onClick:
```ts
onClick={() => { remove(l.productId); toast.success("Removed"); }}
```
Add `import { toast } from "sonner";`.

- [ ] **Step 7: Build + smoke test**

```powershell
npx tsc --noEmit
node_modules/.bin/eslint .
npm run dev
```
- Add to cart → toast appears.
- Heart click → toast.
- Remove from cart drawer → toast.
- Submit bad checkout → toast error.

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m "feat: sonner toasts on cart, wishlist, checkout, payment upload"
```

---

## Task 29: Cursor-pointer audit

**Files:** Modify any `*.tsx` in `src/` with interactive elements missing `cursor-pointer`.

- [ ] **Step 1: Run the audit grep**

```powershell
grep -rn "onClick" src/components src/app 2>$null | grep -v "cursor-pointer" | head -40
```
Each result is an interactive element to check. The Phase 1 + Phase 2 polish work already covered most components. Spot-check these and add `cursor-pointer` to any class strings that lack it:
- `src/app/(storefront)/contact/page.tsx` — the external link arrows
- `src/app/admin/*` — any inline `<button>` not using `AdminButton`
- Storefront empty-state CTAs
- Any new `<Link>` whose container styling makes it look button-like

(Most modern browsers default `<a>` and `<button>` to pointer cursor; the explicit class is a safety net for `<div onClick=...>` patterns and for components that override the default cursor via Tailwind.)

- [ ] **Step 2: Commit**

```powershell
git add -A
git commit -m "style: cursor-pointer audit pass"
```

---

## Task 30: Final QA

**Files:** none new — verification only.

- [ ] **Step 1: Full test suite**

```powershell
npx vitest run
```
Expected: all green. Tally: 42 prior + adminSession 3 + loginSchema 3 + mapProductDoc 5 + orderTransitions 7 + productSchema 7 + categorySchema 3 + contentSchemas 4 + isAllowedProductImage 2 = **76 tests**.

- [ ] **Step 2: Type-check + lint**

```powershell
npx tsc --noEmit
node_modules/.bin/eslint .
```
Expected: 0 errors / 0 warnings.

- [ ] **Step 3: Production build**

```powershell
npm run build
```
Expected: build succeeds; admin and api routes show as dynamic.

- [ ] **Step 4: End-to-end manual flow**

With `.env.local` complete + Atlas reachable + `npm run dev`:

1. `/admin/login` → wrong creds → toast.
2. Right creds → redirect to `/admin` dashboard.
3. Sidebar links work; mobile drawer opens via hamburger at narrow widths.
4. **Categories:** create 2 categories; reorder via drag; cannot delete a category that has products.
5. **Products:** create 2 products with images (4MB JPG attempts → 5MB cap rejects 6MB but accepts 4MB); edit one; verify slug is read-only on edit; delete one via typed-name confirm.
6. Storefront `/shop` shows the live products; click into one — gallery + details render.
7. **Content:** edit About body + image; visit `/about` — copy + image update. Edit Hero badge text; visit `/` — badge updates; image swaps.
8. Place a customer order; verify it appears under `/admin/orders` with the right status.
9. Mark Paid + advance to Shipped; verify the `paymentStatus` and `orderStatus` in Atlas.
10. Sign out from sidebar → returns to `/admin/login`. Direct `/admin/products` hit → bounces back to login.

- [ ] **Step 5: Final commit**

```powershell
git commit --allow-empty -m "chore: Phase 3 admin panel + content management complete

All 30 plan tasks done. 76 unit tests green, build passes, end-to-end
flow verified against Atlas.

Spec: docs/superpowers/specs/2026-05-30-admin-panel-and-content-design.md"
```

---

## Coverage cross-check (self-review)

| Spec section | Implemented in |
|---|---|
| jose + bcryptjs + sonner + react-markdown deps | Task 1 |
| Env vars + hash helper | Task 1 |
| adminSession sign/verify | Tasks 2 + 5 |
| Proxy gating `/admin/*` | Task 4 |
| Login + logout + rate limit | Task 3 |
| ProductDoc / CategoryDoc / ImageDoc / ContentDoc | Task 6 |
| Catalog data layer | Task 7 |
| Content singletons | Task 8 |
| Order/payment state machine + `Rejected` | Task 9 |
| `repriceCart` refactor + `src/data/` delete + seed script | Task 10 |
| Image upload validator (5MB) + saveImage + GET /api/images/[id] | Task 11 |
| Admin upload route | Task 12 |
| Admin-gated payment screenshot serve | Task 13 |
| AdminCard / Button / Toaster / Table | Task 14 |
| Sidebar + mobile drawer | Task 15 |
| Login page + authenticated layout | Task 16 |
| Dashboard | Task 17 |
| Orders list + filters | Task 18 |
| Order detail + verify/status actions | Task 19 |
| productSchema + actions | Task 20 |
| MultiImagePicker | Task 21 |
| Products list | Task 22 |
| Product new/edit/delete pages | Task 23 |
| categorySchema + actions (CRUD + reorder + in-use guard) | Task 24 |
| Categories list/new/edit + reorder UI | Task 25 |
| Content hub / About / Hero editors | Task 26 |
| Storefront reads About + Hero; empty states on Home + Shop | Task 27 |
| sonner toasts on cart / wishlist / checkout / payment | Task 28 |
| cursor-pointer audit | Task 29 |
| Build + lint + tests clean + E2E | Task 30 |

