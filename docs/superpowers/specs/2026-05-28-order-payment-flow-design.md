# Maria Creations — Phase 2: Order + Payment Flow

**Date:** 2026-05-28
**Status:** Approved design (pre-implementation)
**Scope:** Phase 2 of 4. Builds on the Phase 1 storefront foundation. Phase 3 (Admin Panel) and Phase 4 (Polish & Ops) follow.
**Phase 1 spec:** [`2026-05-26-storefront-foundation-design.md`](./2026-05-26-storefront-foundation-design.md)

---

## 1. Purpose

Turn the browseable Phase 1 storefront into one that takes real orders. A customer fills a checkout form, an order is persisted to MongoDB with a human-friendly `MC####` ID, they pay via a dynamically-generated UPI QR (amount pre-filled), upload a payment screenshot, and land on a confirmation screen. Payment is then manually verified by the admin in Phase 3.

No payment gateway (Razorpay/Stripe), no COD — UPI QR + screenshot proof + manual verification, exactly as the brand brief requires.

---

## 2. Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Database | MongoDB Atlas (connection string provided by user) |
| Screenshot storage | In MongoDB, separate `payments` collection, ≤ 2MB, served via route handler |
| GPay QR | Dynamic UPI QR with amount pre-filled (per order) |
| Address capture | Structured fields (Name, Phone, Line1, Line2?, City, State, Pincode) |
| Shipping | Free — total = cart subtotal |
| Order IDs | Sequential `MC1001+` via atomic counter |
| UTR field | Optional, alongside the required screenshot |
| Post-upload | Confirmation screen only (no WhatsApp link, no public status page) |
| Cart clearing | After successful screenshot upload |
| Payment page layout | Two-panel: "1 · Pay via UPI" | "2 · Confirm payment" |
| Product catalog | Stays in `src/data/` for Phase 2 (migrate to Mongo in Phase 3) |

---

## 3. Architecture & Stack

### New dependencies
- **`mongodb`** — official driver, no ODM (schema is simple; an ODM adds ceremony).
- **`react-hook-form`** + **`zod`** + **`@hookform/resolvers`** — checkout form state + validation; one Zod schema shared client + server.
- **`qrcode`** — server-side UPI QR generation to a data-URL.

### Data flow
- **Order creation** → a **Next.js Server Action** (`createOrder`). The checkout form calls it directly. It validates with Zod, **re-prices items server-side from the catalog**, reserves an order number via the atomic counter, inserts the order, returns `{ orderId }`.
- **Screenshot upload** → a **Route Handler** `POST /api/orders/[orderId]/payment` (handles `multipart/form-data`). Validates size/type, stores bytes in `payments`, links to the order, flips `paymentStatus → "Verification Pending"`.
- **Serving a screenshot** → `GET /api/payments/[id]` streams the stored bytes with the correct `Content-Type` (for the Phase 3 admin).
- **QR generation** → on the payment page (server component): build the `upi://` string, render the QR inline.

### MongoDB connection
`src/lib/mongodb.ts` — singleton `MongoClient` whose connection promise is cached on `globalThis` so Next.js HMR in dev doesn't exhaust the connection pool (the standard Next.js + Mongo pattern). Exports `getDb()`.

### Environment variables
In `.env.local` (documented in `.env.example`):
- `MONGODB_URI` — Atlas connection string (server-only, no `NEXT_PUBLIC_`)
- `MONGODB_DB` — database name (e.g. `maria_creations`)
- `NEXT_PUBLIC_UPI_ID` — payee UPI ID for the QR (e.g. `maria@oksbi`)
- `NEXT_PUBLIC_UPI_NAME` — payee display name (e.g. `Maria Creations`)

### Next.js 16 reading rule
Per `AGENTS.md`, this Next version has breaking changes vs. training data. Before writing code that touches a Next API, read the matching doc under `node_modules/next/dist/docs/`:
- `01-app/01-getting-started/07-mutating-data.md` (or the Server Actions reference) — before `createOrder`
- `01-app/01-getting-started/15-route-handlers.md` — before the upload + serve handlers
- `01-app/03-api-reference/03-file-conventions/route.md` — route handler `params` Promise shape
- Confirm `params` is a `Promise` in route handlers too (same as pages), and the Server Action `"use server"` conventions.

---

## 4. Data Model

Database `maria_creations`, three collections.

### `orders`
```ts
type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered";
type PaymentStatus = "Pending" | "Verification Pending" | "Paid";

type CustomerInfo = {
  name: string;
  phone: string;          // 10 digits
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;        // 6 digits
};

type OrderItem = {
  productId: string;      // "mc-p-001"
  name: string;           // snapshot at order time
  price: number;          // snapshot (₹, whole rupees)
  quantity: number;
  image: string;          // snapshot of primary image path
};

type OrderDoc = {
  _id: ObjectId;
  orderId: string;        // "MC1024" — unique, human-facing
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;    // = Σ(price × qty); shipping free
  paymentStatus: PaymentStatus;   // starts "Pending"
  orderStatus: OrderStatus;       // starts "Pending"
  payment?: {
    screenshotId: ObjectId;       // → payments._id
    utr?: string;
    uploadedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
};
```
**Items are snapshotted** — name/price/image copied in at order time so historical orders stay correct when the catalog changes later.

### `payments`
```ts
type PaymentDoc = {
  _id: ObjectId;
  orderId: string;        // "MC1024" (denormalized for lookup)
  data: Binary;           // BSON BinData — the image bytes
  contentType: string;    // "image/jpeg" | "image/png" | "image/webp"
  size: number;           // bytes, enforced ≤ 2 * 1024 * 1024
  uploadedAt: Date;
};
```
A ≤2MB image is far under Mongo's 16MB document cap, so plain `BinData` is fine — no GridFS.

### `counters`
```ts
type CounterDoc = {
  _id: string;            // "orderId"
  seq: number;            // running count of orders issued
};
```
`findOneAndUpdate({ _id: "orderId" }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after" })`. On a non-existent doc, MongoDB's upsert + `$inc` creates `seq: 0` then increments → the **first** call returns `seq: 1`, the second `seq: 2`, etc. The display ID is then `formatOrderId(seq) = "MC" + (1000 + seq)`, so the first order is **`MC1001`**, the second `MC1002`, … No manual seeding step required — the `1000` base lives only in the formatter. Atomic, so concurrent checkouts can't collide.

### Indexes
- `orders`: unique on `orderId`; index on `createdAt` (Phase 3 admin sort).
- `payments`: index on `orderId`.

---

## 5. Checkout Flow & Routes

All checkout routes live **outside** the `(storefront)` route group (like the Phase 1 stub) and mount Navbar + Footer + MotionProvider themselves.

```
/checkout                  → checkout FORM (replaces the Phase 1 stub)
/checkout/[orderId]        → payment page (two-panel QR + upload)
/checkout/[orderId]/done   → confirmation screen
```

### Step 1 — `/checkout` (form)
- Server shell + client `<CheckoutForm>` (React Hook Form + zodResolver).
- Structured address fields; `<OrderSummary>` (cart line items joined with catalog data + grand total; "Free shipping" note).
- **Empty-cart guard:** empty cart → "Your cart is empty 🌸 → Browse the Shop" instead of the form.
- Submit → `createOrder` server action with `{ customer, items: [{productId, quantity}] }`. Prices computed server-side. Success → `redirect('/checkout/[orderId]')`.

### Step 2 — `/checkout/[orderId]` (payment, two-panel)
- Server component: `await params`, look up order. Missing → `notFound()`.
- If `paymentStatus` is already `Verification Pending`/`Paid` → `redirect('/checkout/[orderId]/done')` (no re-upload).
- **Panel 1 "Pay via UPI":** server-generated QR from `upi://pay?pa=<UPI_ID>&pn=<UPI_NAME>&am=<total>&tn=<orderId>&cu=INR`; amount in large type; copyable UPI ID; 2-line scan steps; subtle "amount pre-filled, please don't change it" note.
- **Panel 2 "Confirm payment":** `<PaymentUpload>` — image picker (≤2MB, type-checked client-side, with preview), optional UTR text field, submit. Posts `multipart/form-data` to the upload route.
- On success → clear cart (Zustand) → `router.push('/checkout/[orderId]/done')`.

### Step 3 — `/checkout/[orderId]/done` (confirmation)
- Server component: look up order; show "Thank you for your order 🌸 / Order MC1024 / payment proof received, we'll verify shortly" + order summary (items + total) + **masked** delivery info (name + city only) + "Continue shopping" → `/shop`.
- No WhatsApp link, no public status lookup.

---

## 6. Payment Page & Upload Mechanics

### UPI QR (server-side)
- Deep link: `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&tn=${orderId}&cu=INR`.
- `qrcode` → data-URL (PNG) rendered inline in the server component (no client JS to draw it).
- Beside it: amount, copyable UPI ID (`<CopyableUpiId>`), scan steps.

### Upload — client (`<PaymentUpload>`)
1. Accept `image/jpeg,image/png,image/webp`.
2. On select: validate type + size ≤ 2MB immediately; show thumbnail preview + filename; inline error if invalid.
3. Optional UTR text field (trimmed; format hint only).
4. Submit → `FormData` (`file` + optional `utr`) → `POST /api/orders/[orderId]/payment`.
5. Loading state; submit disabled until a valid file is chosen and while submitting.

### Upload — server (`POST /api/orders/[orderId]/payment`)
1. `await params` → `orderId`.
2. Look up order. Missing → 404. Already `Verification Pending`/`Paid` → 409 (idempotency).
3. Read file from `formData`. **Re-validate size + content-type server-side.** Invalid → 400 + clear message.
4. Insert into `payments` (`{ orderId, data, contentType, size, uploadedAt }`).
5. Update order: `payment.screenshotId/utr/uploadedAt`, `paymentStatus → "Verification Pending"`, bump `updatedAt`.
6. Return `{ ok: true }`. Failures → structured JSON error.

### Serving screenshots (`GET /api/payments/[id]`)
Streams `data` with its `contentType`. Unguessable ObjectId for Phase 2; Phase 3 gates it behind admin auth. Used by the Phase 3 admin via `<img src="/api/payments/{id}">`.

### Customer-visible errors
- File too big / wrong type → inline message under the upload zone.
- Network/server error → "Something went wrong uploading your screenshot — please try again", file stays selected.
- Order already submitted (e.g. Back button) → redirect to `/done` rather than error.

---

## 7. File & Component Breakdown

`RSC` server component · `C` client · `SA` server action · `RH` route handler.

### `src/lib/`
| File | Notes |
|---|---|
| `mongodb.ts` | Singleton `MongoClient` cached on `globalThis`; exports `getDb()`. Server-only. |
| `orders.ts` | `createOrderDoc`, `getOrderByOrderId`, `markPaymentUploaded`. |
| `counter.ts` | `nextOrderId()` — atomic `$inc`, formats `MC####`. |
| `payments.ts` | `savePaymentScreenshot`, `getPaymentById`. |
| `upi.ts` | `buildUpiUri(...)`, `generateQrDataUrl(...)` (wraps `qrcode`). |
| `validation/checkout.ts` | Shared Zod `checkoutSchema`. |

### `src/types/order.ts`
`OrderDoc`, `OrderStatus`, `PaymentStatus`, `CustomerInfo`, `OrderItem`, and a public `Order` shape (no raw `_id`/`Binary`) returned to pages.

### `src/actions/createOrder.ts` (`SA`)
`"use server"`. Input: customer fields + `[{ productId, quantity }]`. Re-prices from catalog, validates with `checkoutSchema`, stock-checks, `nextOrderId()` + `createOrderDoc`. Returns `{ orderId }` or field errors.

### Route handlers
- `src/app/api/orders/[orderId]/payment/route.ts` (`RH`, `POST`) — multipart upload.
- `src/app/api/payments/[id]/route.ts` (`RH`, `GET`) — stream screenshot.

### `src/app/checkout/` (outside `(storefront)`)
| File | Type | Notes |
|---|---|---|
| `page.tsx` | RSC | Form shell (Navbar/Footer/MotionProvider + `<CheckoutForm>`). Replaces Phase 1 stub. |
| `[orderId]/page.tsx` | RSC | Payment page; QR + `<PaymentUpload>`; redirect guards. |
| `[orderId]/done/page.tsx` | RSC | Confirmation screen. |

### `src/components/checkout/`
| File | Type | Notes |
|---|---|---|
| `CheckoutForm.tsx` | C | RHF + zodResolver; reads cart; calls `createOrder`; field errors. |
| `OrderSummary.tsx` | C | Cart line items + total (reuses `ProductPrice`). Used on form + done. |
| `PaymentUpload.tsx` | C | File picker + preview + size/type guard + UTR + submit; clears cart + redirects. |
| `UpiQr.tsx` | RSC | QR + amount + copyable UPI ID. |
| `CopyableUpiId.tsx` | C | "Tap to copy" wrapper. |

**Deleted:** `src/components/checkout/CheckoutPreview.tsx` (Phase 1 stub helper — superseded by `OrderSummary`).

**Boundary discipline:** `mongodb.ts` and data-access modules are server-only. Client components reach the server only via the `createOrder` action and the upload route.

---

## 8. Validation, Security & Testing

### Validation (defense in depth)
- `checkoutSchema` runs client-side (instant feedback) and server-side (authoritative). Rules: name non-empty ≤80 chars; phone `^[6-9]\d{9}$`; address line 1 required; city/state required; pincode `^\d{6}$`; line 2 optional; UTR optional.
- **Prices never trusted from client** — action receives only `productId` + `quantity`, looks up real price, computes `totalAmount`.
- **Stock check** at order time — out-of-stock item (`stock <= 0`) → reject with a clear error.
- Upload route re-validates file type + size server-side regardless of client checks.

### Security
- `orderId` is sequential/guessable → payment + done pages **mask PII** (show name + city only; never full address/phone on these URLs). Full details live in the Phase 3 admin behind auth. The buyer already knows their own info; masking prevents leaking it to URL enumeration.
- Screenshot endpoint uses unguessable ObjectId; Phase 3 adds admin-auth gating.
- `MONGODB_URI` is server-only (no `NEXT_PUBLIC_`), never in the client bundle.
- Server action + route handlers wrap DB calls in try/catch; return structured errors, no stack traces to the client.

### Testing (TDD for pure logic)
Unit tests (Vitest, Node env — no DB hit):
- `formatOrderId(seq)`: `formatOrderId(1) → "MC1001"`, `formatOrderId(24) → "MC1024"`.
- Total computation / re-pricing from `[{productId, quantity}]` (mock catalog).
- `checkoutSchema` accept/reject cases (valid order; bad phone; bad pincode; missing required).
- `buildUpiUri(...)` produces the correct encoded string.
- Upload validation helper (`isAllowedImage(type, size)`): accepts jpeg/png/webp ≤2MB, rejects oversized + wrong type.

DB-touching code (`orders.ts`, `counter.ts`, `payments.ts`, route handlers) is verified by running the dev server against the real Atlas connection and exercising the flow manually — no mocked-DB tests in Phase 2.

---

## 9. Scope Boundary

### ✅ In Phase 2
MongoDB connection + `orders`/`payments`/`counters` (+ indexes); atomic `MC####` generator; `createOrder` server action (Zod, server re-pricing, stock check); real `/checkout` form (structured fields, summary, empty-cart guard) replacing the stub; `/checkout/[orderId]` two-panel payment page (dynamic UPI QR + screenshot upload + optional UTR); `POST /api/orders/[orderId]/payment` (multipart, ≤2MB, server re-validation, status → Verification Pending); `GET /api/payments/[id]`; `/checkout/[orderId]/done` confirmation (masked PII); cart clears after upload; `qrcode`/`react-hook-form`/`zod`/`mongodb` deps; new env vars; unit tests for pure logic; build + lint + type-check clean.

### ❌ Deferred to Phase 3 (Admin Panel)
Admin auth, dashboard, viewing orders, viewing payment screenshots, manual payment verification (`Verification Pending → Paid`), order-status updates (`Pending → Processing → Shipped → Delivered`), product CRUD, catalog migration to MongoDB.

### ❌ Deferred to Phase 4 (Polish & Ops)
Email/WhatsApp notifications, public order-status lookup page, real Instagram feed, contact form, deployment config.

### User-supplied dependencies before implementation
1. `MONGODB_URI` (Atlas connection string) + `MONGODB_DB` name → `.env.local`.
2. `NEXT_PUBLIC_UPI_ID` (e.g. `maria@oksbi`) + `NEXT_PUBLIC_UPI_NAME` (e.g. `Maria Creations`) → `.env.local`.

---

## 10. Open Questions

None at design time — all decisions captured in §2. New questions surfaced during implementation should be raised to the user before being silently resolved.
