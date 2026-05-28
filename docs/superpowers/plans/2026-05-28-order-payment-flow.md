# Order + Payment Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [`docs/superpowers/specs/2026-05-28-order-payment-flow-design.md`](../specs/2026-05-28-order-payment-flow-design.md)

**Goal:** Let customers place an order (persisted to MongoDB with an `MC####` ID), pay via a dynamic UPI QR, and upload a payment screenshot for manual verification.

**Architecture:** Order creation runs through a Zod-validated Next.js Server Action that re-prices items server-side and reserves an atomic order number. The payment page renders a per-order UPI QR (amount pre-filled) and a screenshot uploader that POSTs multipart data to a Route Handler, which stores the image bytes in a MongoDB `payments` collection and flips the order's `paymentStatus`. Catalog stays in `src/data/` this phase.

**Tech Stack:** Next.js 16.2.6 · React 19 · MongoDB (official driver) · `react-hook-form` + `zod` + `@hookform/resolvers` · `qrcode` · Vitest (pure-logic tests).

**Test discipline:** TDD for pure logic (`formatOrderId`, `repriceCart`, `checkoutSchema`, `buildUpiUri`, `isAllowedImage`). DB-touching code (connection, counter, orders/payments data access, route handlers) is verified by running the dev server against the real Atlas connection and walking the flow — no mocked-DB tests.

**Commit cadence:** One commit per task. Conventional prefixes.

**Next.js 16 reading rule:** Each task touching a Next API reads the matching `node_modules/next/dist/docs/` page first. Confirmed facts to rely on:
- Route handler signature: `export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> })` — **await `params`**.
- Return JSON via `Response.json(obj, { status })`; return binary via `new Response(buffer, { headers: { "Content-Type": ... } })`.
- Server Action: file starts with `"use server"`; async functions; may take a typed object argument; `redirect()` from `next/navigation` works but we instead **return `{ orderId }` and let the client `router.push`** (cleaner with React Hook Form).

**Prerequisite env (user provides before Task 2 runs end-to-end):** `MONGODB_URI`, `MONGODB_DB`, `NEXT_PUBLIC_UPI_ID`, `NEXT_PUBLIC_UPI_NAME` in `.env.local`.

---

## File Structure

### Config (modified)
- `package.json` — add deps
- `.env.example` / `.env.local` — add the four new vars

### Library (new) — `src/lib/`
- `mongodb.ts` — singleton client + `getDb()` + typed collection getters
- `counter.ts` — `nextOrderId()` (atomic) + re-exports `formatOrderId`
- `formatOrderId.ts` + `formatOrderId.test.ts` — pure ID formatter
- `repriceCart.ts` + `repriceCart.test.ts` — server-side re-pricing from catalog
- `upi.ts` + `upi.test.ts` — `buildUpiUri` (tested) + `generateQrDataUrl` (DB-free, but wraps `qrcode`)
- `upload.ts` + `upload.test.ts` — `isAllowedImage`, `MAX_UPLOAD_BYTES`, `ALLOWED_IMAGE_TYPES`
- `validation/checkout.ts` + `validation/checkout.test.ts` — Zod `checkoutSchema`
- `orders.ts` — `createOrderDoc`, `getOrderByOrderId`, `markPaymentUploaded`
- `payments.ts` — `savePaymentScreenshot`, `getPaymentById`

### Types (new)
- `src/types/order.ts`

### Server action (new)
- `src/actions/createOrder.ts`

### Route handlers (new)
- `src/app/api/orders/[orderId]/payment/route.ts` — `POST`
- `src/app/api/payments/[id]/route.ts` — `GET`

### Routes (new/replaced) — `src/app/checkout/`
- `page.tsx` — checkout form (replaces Phase 1 stub)
- `[orderId]/page.tsx` — payment page
- `[orderId]/done/page.tsx` — confirmation

### Components (new) — `src/components/checkout/`
- `CheckoutForm.tsx`, `OrderSummary.tsx`, `PaymentUpload.tsx`, `UpiQr.tsx`, `CopyableUpiId.tsx`
- **delete** `CheckoutPreview.tsx`

### Scripts (new)
- `scripts/createIndexes.ts` — one-time index creation

---

## Task 1: Install dependencies + env vars

**Files:** Modify `package.json`, `.env.example`, `.env.local`

- [ ] **Step 1: Install runtime deps**

```powershell
npm install mongodb react-hook-form zod @hookform/resolvers qrcode
```
Expected: installs cleanly.

- [ ] **Step 2: Install qrcode types (dev)**

```powershell
npm install -D @types/qrcode
```

- [ ] **Step 3: Append new vars to `.env.example`**

Add these lines to `.env.example`:
```
# MongoDB Atlas
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=maria_creations

# UPI payee for the dynamic QR
NEXT_PUBLIC_UPI_ID=maria@oksbi
NEXT_PUBLIC_UPI_NAME=Maria Creations
```

- [ ] **Step 4: Append real values to `.env.local`**

Add the same keys to `.env.local` with the user's real connection string + UPI details. (`.env.local` is gitignored.)

- [ ] **Step 5: Verify install + existing tests still pass**

```powershell
npx vitest run
```
Expected: the existing 23 tests still pass.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json .env.example
git commit -m "chore: add mongodb, react-hook-form, zod, qrcode for Phase 2"
```

---

## Task 2: MongoDB connection singleton

**Files:** Create `src/lib/mongodb.ts`

- [ ] **Step 1: Read the Next data-mutation doc (for the global-cache rationale) — optional skim**

Skim `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md` (first 60 lines) to confirm there's no Next-specific DB helper expected; we use the raw driver.

- [ ] **Step 2: Write `src/lib/mongodb.ts`**

```ts
import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "maria_creations";

if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to .env.local.");
}

// Cache the client promise across HMR reloads in dev so we don't exhaust
// the Atlas connection pool. In prod a single module instance is reused.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

const clientPromise: Promise<MongoClient> =
  globalForMongo._mongoClientPromise ??
  (globalForMongo._mongoClientPromise = new MongoClient(uri).connect());

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
```

- [ ] **Step 3: Type-check**

```powershell
npx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 4: Commit**

```powershell
git add src/lib/mongodb.ts
git commit -m "feat: MongoDB connection singleton (HMR-safe getDb)"
```

---

## Task 3: Order types

**Files:** Create `src/types/order.ts`

- [ ] **Step 1: Write `src/types/order.ts`**

```ts
export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered";
export type PaymentStatus = "Pending" | "Verification Pending" | "Paid";

export type CustomerInfo = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

/** Shape stored in MongoDB (without the driver's ObjectId typing here). */
export type OrderRecord = {
  orderId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  payment?: {
    screenshotId: string;
    utr?: string;
    uploadedAt: string; // ISO
  };
  createdAt: string; // ISO
  updatedAt: string; // ISO
};
```

- [ ] **Step 2: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/types/order.ts
git commit -m "feat: order/payment types"
```

---

## Task 4: formatOrderId + repriceCart (TDD)

**Files:** Create `src/lib/formatOrderId.ts` + `.test.ts`, `src/lib/repriceCart.ts` + `.test.ts`

- [ ] **Step 1: Write `src/lib/formatOrderId.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { formatOrderId } from "./formatOrderId";

describe("formatOrderId", () => {
  it("offsets the sequence by 1000 so the first order is MC1001", () => {
    expect(formatOrderId(1)).toBe("MC1001");
    expect(formatOrderId(24)).toBe("MC1024");
    expect(formatOrderId(1000)).toBe("MC2000");
  });
});
```

- [ ] **Step 2: Run, expect failure**

```powershell
npx vitest run formatOrderId
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/formatOrderId.ts`**

```ts
export function formatOrderId(seq: number): string {
  return `MC${1000 + seq}`;
}
```

- [ ] **Step 4: Run, expect pass**

```powershell
npx vitest run formatOrderId
```
Expected: PASS.

- [ ] **Step 5: Write `src/lib/repriceCart.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { repriceCart } from "./repriceCart";

describe("repriceCart", () => {
  it("rejects an empty cart", () => {
    const r = repriceCart([]);
    expect(r.ok).toBe(false);
  });
  it("prices a known in-stock product from the catalog", () => {
    // mc-p-001 Rose Garden Bouquet @ 499, stock 8
    const r = repriceCart([{ productId: "mc-p-001", quantity: 2 }]);
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
  it("rejects an unknown product id", () => {
    const r = repriceCart([{ productId: "nope", quantity: 1 }]);
    expect(r.ok).toBe(false);
  });
  it("rejects a sold-out product (mc-p-012 has stock 0)", () => {
    const r = repriceCart([{ productId: "mc-p-012", quantity: 1 }]);
    expect(r.ok).toBe(false);
  });
  it("rejects quantity < 1", () => {
    const r = repriceCart([{ productId: "mc-p-001", quantity: 0 }]);
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 6: Run, expect failure**

```powershell
npx vitest run repriceCart
```
Expected: FAIL — module not found.

- [ ] **Step 7: Implement `src/lib/repriceCart.ts`**

```ts
import { products } from "@/data/products";
import type { OrderItem } from "@/types/order";

export type RepriceInput = { productId: string; quantity: number };

export type RepriceResult =
  | { ok: true; items: OrderItem[]; totalAmount: number }
  | { ok: false; error: string };

export function repriceCart(input: RepriceInput[]): RepriceResult {
  if (input.length === 0) return { ok: false, error: "Your cart is empty." };

  const items: OrderItem[] = [];
  for (const line of input) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) return { ok: false, error: `Unknown product: ${line.productId}` };
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      return { ok: false, error: `Invalid quantity for ${product.name}.` };
    }
    if (product.stock <= 0) {
      return { ok: false, error: `${product.name} is sold out.` };
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

- [ ] **Step 8: Run, expect pass**

```powershell
npx vitest run repriceCart
```
Expected: 5/5 PASS.

- [ ] **Step 9: Commit**

```powershell
git add src/lib/formatOrderId.ts src/lib/formatOrderId.test.ts src/lib/repriceCart.ts src/lib/repriceCart.test.ts
git commit -m "feat: formatOrderId + repriceCart pure helpers with tests"
```

---

## Task 5: checkoutSchema + upload validation (TDD)

**Files:** Create `src/lib/validation/checkout.ts` + `.test.ts`, `src/lib/upload.ts` + `.test.ts`

- [ ] **Step 1: Write `src/lib/validation/checkout.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { checkoutSchema } from "./checkout";

const valid = {
  name: "Surya",
  phone: "9876543210",
  addressLine1: "12 Flower St",
  city: "Madurai",
  state: "Tamil Nadu",
  pincode: "625001",
};

describe("checkoutSchema", () => {
  it("accepts a valid address", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });
  it("accepts an optional empty addressLine2", () => {
    expect(checkoutSchema.safeParse({ ...valid, addressLine2: "" }).success).toBe(true);
  });
  it("rejects a bad phone", () => {
    expect(checkoutSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, phone: "1234567890" }).success).toBe(false);
  });
  it("rejects a bad pincode", () => {
    expect(checkoutSchema.safeParse({ ...valid, pincode: "12" }).success).toBe(false);
  });
  it("rejects a missing name", () => {
    expect(checkoutSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```powershell
npx vitest run validation/checkout
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/validation/checkout.ts`**

```ts
import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  addressLine1: z.string().trim().min(1, "Address is required").max(120),
  addressLine2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(60),
  state: z.string().trim().min(1, "State is required").max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
```

- [ ] **Step 4: Run, expect pass**

```powershell
npx vitest run validation/checkout
```
Expected: 5/5 PASS.

- [ ] **Step 5: Write `src/lib/upload.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { isAllowedImage, MAX_UPLOAD_BYTES } from "./upload";

describe("isAllowedImage", () => {
  it("accepts a jpeg under the limit", () => {
    expect(isAllowedImage("image/jpeg", 1_000_000).ok).toBe(true);
  });
  it("accepts png and webp", () => {
    expect(isAllowedImage("image/png", 500).ok).toBe(true);
    expect(isAllowedImage("image/webp", 500).ok).toBe(true);
  });
  it("rejects a non-image type", () => {
    expect(isAllowedImage("application/pdf", 500).ok).toBe(false);
  });
  it("rejects a file over 2MB", () => {
    expect(isAllowedImage("image/jpeg", MAX_UPLOAD_BYTES + 1).ok).toBe(false);
  });
  it("rejects an empty file", () => {
    expect(isAllowedImage("image/jpeg", 0).ok).toBe(false);
  });
});
```

- [ ] **Step 6: Run, expect failure**

```powershell
npx vitest run upload
```
Expected: FAIL.

- [ ] **Step 7: Implement `src/lib/upload.ts`**

```ts
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function isAllowedImage(type: string, size: number): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(type)) {
    return { ok: false, error: "Please upload a JPG, PNG, or WebP image." };
  }
  if (size <= 0) {
    return { ok: false, error: "The file appears to be empty." };
  }
  if (size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Image must be 2MB or smaller." };
  }
  return { ok: true };
}
```

- [ ] **Step 8: Run, expect pass**

```powershell
npx vitest run upload
```
Expected: 5/5 PASS.

- [ ] **Step 9: Commit**

```powershell
git add src/lib/validation/checkout.ts src/lib/validation/checkout.test.ts src/lib/upload.ts src/lib/upload.test.ts
git commit -m "feat: checkout Zod schema + image upload validation with tests"
```

---

## Task 6: UPI helpers (TDD for builder)

**Files:** Create `src/lib/upi.ts` + `src/lib/upi.test.ts`

- [ ] **Step 1: Write `src/lib/upi.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { buildUpiUri } from "./upi";

describe("buildUpiUri", () => {
  it("builds a UPI deep link with encoded params", () => {
    const uri = buildUpiUri({
      payeeId: "maria@oksbi",
      payeeName: "Maria Creations",
      amount: 499,
      note: "MC1024",
    });
    expect(uri).toBe(
      "upi://pay?pa=maria%40oksbi&pn=Maria%20Creations&am=499&tn=MC1024&cu=INR"
    );
  });
});
```

- [ ] **Step 2: Run, expect failure**

```powershell
npx vitest run upi
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/upi.ts`**

```ts
import QRCode from "qrcode";

export type UpiParams = {
  payeeId: string;
  payeeName: string;
  amount: number;
  note: string;
};

export function buildUpiUri({ payeeId, payeeName, amount, note }: UpiParams): string {
  const parts = [
    `pa=${encodeURIComponent(payeeId)}`,
    `pn=${encodeURIComponent(payeeName)}`,
    `am=${encodeURIComponent(String(amount))}`,
    `tn=${encodeURIComponent(note)}`,
    `cu=INR`,
  ];
  return `upi://pay?${parts.join("&")}`;
}

/** Render the UPI URI to a PNG data-URL (server-side). */
export async function generateQrDataUrl(upiUri: string): Promise<string> {
  return QRCode.toDataURL(upiUri, {
    width: 320,
    margin: 1,
    color: { dark: "#2a1620", light: "#ffffff" },
  });
}
```

- [ ] **Step 4: Run, expect pass**

```powershell
npx vitest run upi
```
Expected: PASS. (Only `buildUpiUri` is tested; `generateQrDataUrl` is exercised on the payment page.)

- [ ] **Step 5: Run the full suite to confirm nothing regressed**

```powershell
npx vitest run
```
Expected: all green (23 prior + formatOrderId 1 + repriceCart 5 + checkout 5 + upload 5 + upi 1).

- [ ] **Step 6: Commit**

```powershell
git add src/lib/upi.ts src/lib/upi.test.ts
git commit -m "feat: UPI deep-link builder + QR data-url generator"
```

---

## Task 7: Atomic order-number counter

**Files:** Create `src/lib/counter.ts`

No unit test (touches the DB); verified during the Task 18 end-to-end run.

- [ ] **Step 1: Write `src/lib/counter.ts`**

```ts
import { getDb } from "./mongodb";
import { formatOrderId } from "./formatOrderId";

/**
 * Atomically increments the order sequence and returns the formatted
 * order id (MC1001, MC1002, ...). Upsert + $inc means the first call
 * returns seq=1 -> "MC1001". Concurrency-safe.
 */
export async function nextOrderId(): Promise<string> {
  const db = await getDb();
  const result = await db.collection<{ _id: string; seq: number }>("counters").findOneAndUpdate(
    { _id: "orderId" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const seq = result?.seq ?? 1;
  return formatOrderId(seq);
}
```

- [ ] **Step 2: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/counter.ts
git commit -m "feat: atomic MC#### order-id counter"
```

---

## Task 8: Orders data access

**Files:** Create `src/lib/orders.ts`

- [ ] **Step 1: Write `src/lib/orders.ts`**

```ts
import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import type { CustomerInfo, OrderItem, OrderRecord } from "@/types/order";

type OrderDoc = Omit<OrderRecord, "createdAt" | "updatedAt" | "payment"> & {
  createdAt: Date;
  updatedAt: Date;
  payment?: { screenshotId: ObjectId; utr?: string; uploadedAt: Date };
};

async function collection() {
  const db = await getDb();
  return db.collection<OrderDoc>("orders");
}

export async function createOrderDoc(input: {
  orderId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
}): Promise<void> {
  const col = await collection();
  const now = new Date();
  await col.insertOne({
    orderId: input.orderId,
    customer: input.customer,
    items: input.items,
    totalAmount: input.totalAmount,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    createdAt: now,
    updatedAt: now,
  });
}

function toRecord(doc: OrderDoc): OrderRecord {
  return {
    orderId: doc.orderId,
    customer: doc.customer,
    items: doc.items,
    totalAmount: doc.totalAmount,
    paymentStatus: doc.paymentStatus,
    orderStatus: doc.orderStatus,
    payment: doc.payment
      ? {
          screenshotId: doc.payment.screenshotId.toHexString(),
          utr: doc.payment.utr,
          uploadedAt: doc.payment.uploadedAt.toISOString(),
        }
      : undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getOrderByOrderId(orderId: string): Promise<OrderRecord | null> {
  const col = await collection();
  const doc = await col.findOne({ orderId });
  return doc ? toRecord(doc) : null;
}

export async function markPaymentUploaded(args: {
  orderId: string;
  screenshotId: ObjectId;
  utr?: string;
}): Promise<void> {
  const col = await collection();
  const now = new Date();
  await col.updateOne(
    { orderId: args.orderId },
    {
      $set: {
        payment: { screenshotId: args.screenshotId, utr: args.utr, uploadedAt: now },
        paymentStatus: "Verification Pending",
        updatedAt: now,
      },
    }
  );
}
```

- [ ] **Step 2: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/orders.ts
git commit -m "feat: orders data access (create, get, markPaymentUploaded)"
```

---

## Task 9: Payments data access

**Files:** Create `src/lib/payments.ts`

- [ ] **Step 1: Write `src/lib/payments.ts`**

```ts
import { Binary, ObjectId } from "mongodb";
import { getDb } from "./mongodb";

type PaymentDoc = {
  _id: ObjectId;
  orderId: string;
  data: Binary;
  contentType: string;
  size: number;
  uploadedAt: Date;
};

async function collection() {
  const db = await getDb();
  return db.collection<PaymentDoc>("payments");
}

export async function savePaymentScreenshot(args: {
  orderId: string;
  bytes: Buffer;
  contentType: string;
}): Promise<ObjectId> {
  const col = await collection();
  const _id = new ObjectId();
  await col.insertOne({
    _id,
    orderId: args.orderId,
    data: new Binary(args.bytes),
    contentType: args.contentType,
    size: args.bytes.length,
    uploadedAt: new Date(),
  });
  return _id;
}

export async function getPaymentById(
  id: string
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await collection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return { bytes: Buffer.from(doc.data.buffer), contentType: doc.contentType };
}
```

- [ ] **Step 2: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/lib/payments.ts
git commit -m "feat: payments data access (save + get screenshot bytes)"
```

---

## Task 10: createOrder server action

**Files:** Create `src/actions/createOrder.ts`

- [ ] **Step 1: Read the Server Actions doc**

Read `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md` (first ~120 lines). Confirm: file-level `"use server"`, async functions, may receive a typed object, reachable via POST so must self-validate.

- [ ] **Step 2: Write `src/actions/createOrder.ts`**

```ts
"use server";

import { checkoutSchema } from "@/lib/validation/checkout";
import { repriceCart, type RepriceInput } from "@/lib/repriceCart";
import { nextOrderId } from "@/lib/counter";
import { createOrderDoc } from "@/lib/orders";
import type { CustomerInfo } from "@/types/order";

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createOrder(input: {
  customer: unknown;
  items: RepriceInput[];
}): Promise<CreateOrderResult> {
  // 1. Validate customer (authoritative — never trust the client).
  const parsed = checkoutSchema.safeParse(input.customer);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  // 2. Re-price items from the catalog server-side.
  const priced = repriceCart(input.items ?? []);
  if (!priced.ok) {
    return { ok: false, error: priced.error };
  }

  // 3. Reserve an order id + persist.
  try {
    const orderId = await nextOrderId();
    const customer: CustomerInfo = {
      name: parsed.data.name,
      phone: parsed.data.phone,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2 || undefined,
      city: parsed.data.city,
      state: parsed.data.state,
      pincode: parsed.data.pincode,
    };
    await createOrderDoc({
      orderId,
      customer,
      items: priced.items,
      totalAmount: priced.totalAmount,
    });
    return { ok: true, orderId };
  } catch (err) {
    console.error("createOrder failed:", err);
    return { ok: false, error: "Could not place your order. Please try again." };
  }
}
```

- [ ] **Step 3: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/actions/createOrder.ts
git commit -m "feat: createOrder server action (validate, reprice, persist)"
```

---

## Task 11: OrderSummary, CopyableUpiId, UpiQr components

**Files:** Create `src/components/checkout/OrderSummary.tsx`, `CopyableUpiId.tsx`, `UpiQr.tsx`

- [ ] **Step 1: OrderSummary (Client)**

Write `src/components/checkout/OrderSummary.tsx`:
```tsx
"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useCartStore } from "@/store/cart";
import { products } from "@/data/products";
import { ProductPrice } from "@/components/product/ProductPrice";

export function OrderSummary() {
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

  return (
    <div className="bg-white/85 rounded-2xl p-6 shadow-petal-sm border border-white/60">
      <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold mb-5">
        Order Summary
      </h2>
      <ul className="divide-y divide-brand-blush">
        {lineItems.map((l) => (
          <li key={l.productId} className="flex gap-3 py-3">
            <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-brand-blush">
              <Image
                src={l.product.images[0] ?? "/Handmade-1.jpeg"}
                alt={l.product.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-brand-ink leading-tight">{l.product.name}</p>
                <p className="text-xs text-brand-ink-muted">Qty {l.quantity}</p>
              </div>
              <ProductPrice amount={l.product.price * l.quantity} size="sm" />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 pt-4 border-t border-brand-blush space-y-2">
        <div className="flex justify-between text-sm text-brand-ink-muted">
          <span>Subtotal</span>
          <ProductPrice amount={subtotal} size="sm" />
        </div>
        <div className="flex justify-between text-sm text-brand-ink-muted">
          <span>Shipping</span>
          <span className="font-semibold text-brand-pink">Free</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-brand-blush">
          <span className="text-sm uppercase tracking-[0.15em] text-brand-ink-muted">Total</span>
          <ProductPrice amount={subtotal} size="lg" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: CopyableUpiId (Client)**

Write `src/components/checkout/CopyableUpiId.tsx`:
```tsx
"use client";

import { useState } from "react";

export function CopyableUpiId({ upiId }: { upiId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable; silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border border-brand-blush bg-white px-4 py-2 text-sm font-semibold text-brand-ink-muted cursor-pointer hover:border-brand-pink transition-colors"
      aria-label={`Copy UPI ID ${upiId}`}
    >
      <span>{upiId}</span>
      <span className="text-brand-pink text-xs">{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
}
```

- [ ] **Step 3: UpiQr (RSC)**

Write `src/components/checkout/UpiQr.tsx`:
```tsx
import Image from "next/image";
import { buildUpiUri, generateQrDataUrl } from "@/lib/upi";
import { ProductPrice } from "@/components/product/ProductPrice";
import { CopyableUpiId } from "./CopyableUpiId";

type Props = { amount: number; orderId: string };

export async function UpiQr({ amount, orderId }: Props) {
  const upiId = process.env.NEXT_PUBLIC_UPI_ID ?? "";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME ?? "Maria Creations";
  const uri = buildUpiUri({ payeeId: upiId, payeeName: upiName, amount, note: orderId });
  const qr = await generateQrDataUrl(uri);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-48 w-48 rounded-2xl overflow-hidden border-4 border-white shadow-petal-md bg-white">
        {/* qrcode data-url is a trusted, locally-generated PNG */}
        <Image src={qr} alt={`UPI QR for order ${orderId}`} fill sizes="192px" unoptimized />
      </div>
      <div className="mt-4">
        <ProductPrice amount={amount} size="lg" />
      </div>
      {upiId && (
        <div className="mt-3">
          <CopyableUpiId upiId={upiId} />
        </div>
      )}
      <ul className="mt-4 text-left text-xs text-brand-ink-muted space-y-1">
        <li className="flex gap-2"><span className="text-brand-pink">✿</span> Scan with any UPI app (GPay, PhonePe, Paytm)</li>
        <li className="flex gap-2"><span className="text-brand-pink">✿</span> Amount is pre-filled — please don&apos;t change it</li>
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/components/checkout/OrderSummary.tsx src/components/checkout/CopyableUpiId.tsx src/components/checkout/UpiQr.tsx
git commit -m "feat: OrderSummary, CopyableUpiId, UpiQr checkout components"
```

---

## Task 12: CheckoutForm component

**Files:** Create `src/components/checkout/CheckoutForm.tsx`

- [ ] **Step 1: Write `src/components/checkout/CheckoutForm.tsx`**

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/checkout";
import { createOrder } from "@/actions/createOrder";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";

const fieldBase =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-3 text-sm text-brand-ink " +
  "placeholder:text-brand-ink-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema) });

  const onSubmit = async (data: CheckoutInput) => {
    setSubmitError(null);
    const result = await createOrder({
      customer: data,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    if (result.ok) {
      router.push(`/checkout/${result.orderId}`);
    } else {
      setSubmitError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Full Name" error={errors.name?.message}>
        <input className={fieldBase} placeholder="Your name" {...register("name")} />
      </Field>
      <Field label="Phone" error={errors.phone?.message}>
        <input className={fieldBase} inputMode="numeric" placeholder="10-digit mobile number" {...register("phone")} />
      </Field>
      <Field label="Address Line 1" error={errors.addressLine1?.message}>
        <input className={fieldBase} placeholder="House no., street" {...register("addressLine1")} />
      </Field>
      <Field label="Address Line 2 (optional)" error={errors.addressLine2?.message}>
        <input className={fieldBase} placeholder="Area, landmark" {...register("addressLine2")} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" error={errors.city?.message}>
          <input className={fieldBase} placeholder="City" {...register("city")} />
        </Field>
        <Field label="State" error={errors.state?.message}>
          <input className={fieldBase} placeholder="State" {...register("state")} />
        </Field>
      </div>
      <Field label="Pincode" error={errors.pincode?.message}>
        <input className={fieldBase} inputMode="numeric" placeholder="6-digit pincode" {...register("pincode")} />
      </Field>

      {submitError && (
        <p className="text-sm text-brand-pink font-semibold" role="alert">{submitError}</p>
      )}

      <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Placing order…" : "Place Order"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-semibold mb-2">
        {label}
      </span>
      {children}
      {error && <span className="block mt-1 text-xs text-brand-pink">{error}</span>}
    </label>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```powershell
npx tsc --noEmit
git add src/components/checkout/CheckoutForm.tsx
git commit -m "feat: CheckoutForm (RHF + zod, calls createOrder)"
```

---

## Task 13: /checkout page (replace stub, delete CheckoutPreview)

**Files:** Modify `src/app/checkout/page.tsx`; delete `src/components/checkout/CheckoutPreview.tsx`

- [ ] **Step 1: Replace `src/app/checkout/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CheckoutEmptyGuard } from "@/components/checkout/CheckoutEmptyGuard";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details to place your handmade flower order.",
};

export default function CheckoutPage() {
  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1">
        <Container className="py-12 lg:py-16">
          <ScriptHeading as="h1">Checkout</ScriptHeading>
          <CheckoutEmptyGuard>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 items-start">
              <CheckoutForm />
              <div className="lg:sticky lg:top-28">
                <OrderSummary />
              </div>
            </div>
          </CheckoutEmptyGuard>
        </Container>
      </main>
      <Footer />
      <CartDrawer />
    </MotionProvider>
  );
}
```

- [ ] **Step 2: Create `src/components/checkout/CheckoutEmptyGuard.tsx` (Client)**

The empty-cart check must be client-side (cart lives in localStorage). Write it:
```tsx
"use client";

import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";

export function CheckoutEmptyGuard({ children }: { children: React.ReactNode }) {
  const count = useCartStore((s) => s.items.length);

  if (count === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-script text-5xl text-brand-pink mb-3">Your cart is empty</p>
        <p className="text-sm text-brand-ink-muted mb-8">
          Add a few flowers before checking out 🌸
        </p>
        <Button href="/shop" variant="gradient" size="lg">Browse the Shop</Button>
      </div>
    );
  }
  return <>{children}</>;
}
```

- [ ] **Step 3: Delete the Phase 1 stub helper**

```powershell
git rm src/components/checkout/CheckoutPreview.tsx
```

- [ ] **Step 4: Verify**

Start dev server. With items in the cart visit `/checkout` → form + summary render. Empty the cart → "Your cart is empty" state. Submitting a valid form should create an order and redirect to `/checkout/MC100X` (which 404s until Task 16 — that's expected at this point; confirm the redirect URL is correct and the order appears in Atlas).

- [ ] **Step 5: Type-check + lint + commit**

```powershell
npx tsc --noEmit
node_modules/.bin/eslint .
git add src/app/checkout/page.tsx src/components/checkout/CheckoutEmptyGuard.tsx
git commit -m "feat: checkout form page with empty-cart guard (replaces stub)"
```

---

## Task 14: Payment + screenshot-serve route handlers

**Files:** Create `src/app/api/orders/[orderId]/payment/route.ts`, `src/app/api/payments/[id]/route.ts`

- [ ] **Step 1: Read the route-handlers doc**

Read `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` (first ~120 lines) and `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` (first ~90 lines). Confirm: `params` is a Promise; `Response.json(obj, { status })`; binary via `new Response(buffer, { headers })`.

- [ ] **Step 2: Write `src/app/api/orders/[orderId]/payment/route.ts`**

```ts
import { getOrderByOrderId, markPaymentUploaded } from "@/lib/orders";
import { savePaymentScreenshot } from "@/lib/payments";
import { isAllowedImage } from "@/lib/upload";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const order = await getOrderByOrderId(orderId);
  if (!order) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.paymentStatus !== "Pending") {
    return Response.json({ error: "Payment already submitted." }, { status: 409 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const utrRaw = formData.get("utr");
  const utr = typeof utrRaw === "string" && utrRaw.trim() !== "" ? utrRaw.trim() : undefined;

  if (!(file instanceof File)) {
    return Response.json({ error: "No screenshot provided." }, { status: 400 });
  }

  const check = isAllowedImage(file.type, file.size);
  if (!check.ok) {
    return Response.json({ error: check.error }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const screenshotId = await savePaymentScreenshot({
      orderId,
      bytes,
      contentType: file.type,
    });
    await markPaymentUploaded({ orderId, screenshotId, utr });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("payment upload failed:", err);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
```

- [ ] **Step 3: Write `src/app/api/payments/[id]/route.ts`**

```ts
import { getPaymentById } from "@/lib/payments";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payment = await getPaymentById(id);
  if (!payment) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(new Uint8Array(payment.bytes), {
    headers: {
      "Content-Type": payment.contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
```

- [ ] **Step 4: Type-check + commit**

```powershell
npx tsc --noEmit
git add "src/app/api/orders/[orderId]/payment/route.ts" "src/app/api/payments/[id]/route.ts"
git commit -m "feat: payment upload + screenshot serve route handlers"
```

---

## Task 15: PaymentUpload component

**Files:** Create `src/components/checkout/PaymentUpload.tsx`

- [ ] **Step 1: Write `src/components/checkout/PaymentUpload.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAllowedImage } from "@/lib/upload";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";

export function PaymentUpload({ orderId }: { orderId: string }) {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clear);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [utr, setUtr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onPick = (f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    const check = isAllowedImage(f.type, f.size);
    if (!check.ok) {
      setError(check.error);
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (utr.trim()) fd.append("utr", utr.trim());
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          router.push(`/checkout/${orderId}/done`);
          return;
        }
        setError(json.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/checkout/${orderId}/done`);
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full cursor-pointer rounded-2xl border-2 border-dashed border-brand-pink-soft bg-brand-blush/20 px-4 py-8 text-center text-brand-ink-muted hover:bg-brand-blush/30 transition-colors"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Payment screenshot preview" className="mx-auto max-h-48 rounded-xl" />
        ) : (
          <>
            <span className="block text-3xl mb-2">📷</span>
            <span className="text-sm font-semibold">Tap to upload payment screenshot</span>
            <span className="block text-xs mt-1">JPG / PNG / WebP · max 2MB</span>
          </>
        )}
      </button>
      {file && <p className="mt-2 text-xs text-brand-ink-muted truncate">{file.name}</p>}

      <input
        value={utr}
        onChange={(e) => setUtr(e.target.value)}
        placeholder="UTR / transaction no. (optional)"
        className="mt-4 w-full rounded-full border border-brand-blush bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
      />

      {error && <p className="mt-3 text-sm text-brand-pink font-semibold" role="alert">{error}</p>}

      <Button
        type="button"
        variant="gradient"
        size="lg"
        onClick={onSubmit}
        disabled={!file || submitting}
        className="mt-4 w-full"
      >
        {submitting ? "Submitting…" : "Submit Payment Proof"}
      </Button>
    </div>
  );
}
```

> Note: a raw `<img>` is used for the local `URL.createObjectURL` preview (next/image can't optimize blob URLs); the `eslint-disable` is intentional and scoped to that one line.

- [ ] **Step 2: Type-check + lint + commit**

```powershell
npx tsc --noEmit
node_modules/.bin/eslint .
git add src/components/checkout/PaymentUpload.tsx
git commit -m "feat: PaymentUpload (client validate, multipart POST, clear cart)"
```

---

## Task 16: /checkout/[orderId] payment page

**Files:** Create `src/app/checkout/[orderId]/page.tsx`

- [ ] **Step 1: Write `src/app/checkout/[orderId]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { UpiQr } from "@/components/checkout/UpiQr";
import { PaymentUpload } from "@/components/checkout/PaymentUpload";
import { getOrderByOrderId } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Complete Payment",
};

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderByOrderId(orderId);
  if (!order) notFound();
  if (order.paymentStatus !== "Pending") {
    redirect(`/checkout/${orderId}/done`);
  }

  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1">
        <Container className="py-12 lg:py-16 max-w-4xl">
          <div className="text-center mb-10">
            <ScriptHeading as="h1" align="center">Thank you 🌸</ScriptHeading>
            <p className="mt-3 inline-block rounded-full bg-brand-pink-dark text-white text-xs font-bold tracking-[0.1em] px-4 py-1.5">
              ORDER {order.orderId}
            </p>
            <p className="mt-4 text-sm text-brand-ink-muted max-w-md mx-auto">
              Please complete payment using the QR code and upload your payment screenshot to confirm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <section className="bg-white border border-brand-blush rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-brand-pink-dark font-bold mb-5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-pink text-white text-[10px]">1</span>
                Pay via UPI
              </div>
              <UpiQr amount={order.totalAmount} orderId={order.orderId} />
            </section>

            <section className="bg-white border border-brand-blush rounded-2xl p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-brand-pink-dark font-bold mb-5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-pink text-white text-[10px]">2</span>
                Confirm payment
              </div>
              <PaymentUpload orderId={order.orderId} />
            </section>
          </div>
        </Container>
      </main>
      <Footer />
      <CartDrawer />
    </MotionProvider>
  );
}
```

- [ ] **Step 2: Verify in browser**

Place a fresh order via `/checkout`. On redirect to `/checkout/MC100X`: QR renders (scannable, amount matches), upload zone works. Upload a small JPG → redirects to `/done` (404 until Task 17 — confirm the order's `paymentStatus` flipped to "Verification Pending" in Atlas and the `payments` doc exists). Revisit the payment URL → it should now redirect to `/done`.

- [ ] **Step 3: Type-check + lint + commit**

```powershell
npx tsc --noEmit
node_modules/.bin/eslint .
git add "src/app/checkout/[orderId]/page.tsx"
git commit -m "feat: two-panel payment page (UPI QR + screenshot upload)"
```

---

## Task 17: /checkout/[orderId]/done confirmation page

**Files:** Create `src/app/checkout/[orderId]/done/page.tsx`

- [ ] **Step 1: Write `src/app/checkout/[orderId]/done/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getOrderByOrderId } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Order Received",
};

export default async function OrderDonePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderByOrderId(orderId);
  if (!order) notFound();

  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1">
        <Container className="py-12 lg:py-20 max-w-2xl">
          <div className="text-center">
            <ScriptHeading as="h1" align="center" ornament>Order received 🌸</ScriptHeading>
            <p className="mt-4 inline-block rounded-full bg-brand-pink-dark text-white text-xs font-bold tracking-[0.1em] px-4 py-1.5">
              ORDER {order.orderId}
            </p>
            <p className="mt-6 text-base text-brand-ink-muted leading-relaxed">
              Thank you, {order.customer.name.split(" ")[0]}! We&apos;ve received your payment proof and
              will verify it shortly. Your handmade flowers are on their way to being made just for you.
            </p>
          </div>

          <div className="mt-10 bg-white/85 rounded-2xl p-6 shadow-petal-sm border border-white/60">
            <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold mb-5">Your Order</h2>
            <ul className="divide-y divide-brand-blush">
              {order.items.map((item) => (
                <li key={item.productId} className="flex gap-3 py-3">
                  <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-brand-blush">
                    <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-brand-ink leading-tight">{item.name}</p>
                      <p className="text-xs text-brand-ink-muted">Qty {item.quantity}</p>
                    </div>
                    <ProductPrice amount={item.price * item.quantity} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-brand-blush flex justify-between items-center">
              <span className="text-sm uppercase tracking-[0.15em] text-brand-ink-muted">Total Paid</span>
              <ProductPrice amount={order.totalAmount} size="lg" />
            </div>
            {/* Masked delivery info — full address lives in the admin (Phase 3) */}
            <p className="mt-5 pt-4 border-t border-brand-blush text-xs text-brand-ink-muted">
              Delivering to {order.customer.name} · {order.customer.city}
            </p>
          </div>

          <div className="mt-10 text-center">
            <Button href="/shop" variant="gradient" size="lg">Continue shopping</Button>
          </div>
        </Container>
      </main>
      <Footer />
    </MotionProvider>
  );
}
```

- [ ] **Step 2: Verify in browser**

After uploading a screenshot you should land here: order ID, item summary, total, masked "Delivering to <Name> · <City>", "Continue shopping". Confirm full address/phone are NOT shown.

- [ ] **Step 3: Type-check + lint + commit**

```powershell
npx tsc --noEmit
node_modules/.bin/eslint .
git add "src/app/checkout/[orderId]/done/page.tsx"
git commit -m "feat: order confirmation page (masked PII)"
```

---

## Task 18: Indexes + final QA

**Files:** Create `scripts/createIndexes.ts`

- [ ] **Step 0: Install the script runner + dotenv (dev deps)**

```powershell
npm install -D tsx dotenv
```
(`tsx` runs the TS script directly; `dotenv` loads `.env.local` since a standalone script — unlike Next — doesn't auto-load it.)

- [ ] **Step 1: Write `scripts/createIndexes.ts`**

The script loads `.env.local` itself (first line, before importing `mongodb.ts`, because that module reads `process.env.MONGODB_URI` at import time):
```ts
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "../src/lib/mongodb";

async function main() {
  const db = await getDb();
  await db.collection("orders").createIndex({ orderId: 1 }, { unique: true });
  await db.collection("orders").createIndex({ createdAt: -1 });
  await db.collection("payments").createIndex({ orderId: 1 });
  console.log("Indexes created.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```
> Note: the `dotenv` `config()` call must run **before** the `import { getDb }` line executes its module-level env read. Because ES module imports are hoisted, use a dynamic import for `getDb` if the static import resolves env too early:
> ```ts
> import { config } from "dotenv";
> config({ path: ".env.local" });
> const { getDb } = await import("../src/lib/mongodb");
> ```
> Use the dynamic-import form to be safe.

- [ ] **Step 2: Run the index script**

```powershell
npx tsx scripts/createIndexes.ts
```
Expected: `Indexes created.` If it errors with "MONGODB_URI is not set", the dotenv load isn't running before the mongodb import — switch to the dynamic-import form shown above.

- [ ] **Step 3: Full unit-test run**

```powershell
npx vitest run
```
Expected: all green (23 prior + 1 + 5 + 5 + 5 + 1 = 40 tests).

- [ ] **Step 4: Production build**

```powershell
npm run build
```
Expected: build succeeds. Watch for: server/client boundary errors (the `mongodb` import must never reach a client component — it should only be in `mongodb.ts`, data-access libs, the action, route handlers, and async server components). If the build complains about `mongodb` in the client bundle, find the offending `"use client"` file importing a server-only lib and fix the boundary.

- [ ] **Step 5: Type-check + lint**

```powershell
npx tsc --noEmit
node_modules/.bin/eslint .
```
Expected: both clean.

- [ ] **Step 6: End-to-end manual flow against Atlas**

With `npm run dev` and real env vars:
1. Add items to cart → `/checkout`.
2. Submit with an invalid phone → inline error, no order created.
3. Submit valid details → order doc appears in Atlas `orders` (paymentStatus "Pending"), redirect to `/checkout/MC100X`.
4. QR scans to a UPI app with the right amount + note `MC100X`.
5. Upload a 3MB image → rejected client-side with "2MB or smaller".
6. Upload a valid <2MB JPG → `payments` doc created, order flips to "Verification Pending", cart clears, lands on `/done`.
7. Revisit `/checkout/MC100X` → redirects to `/done` (no re-upload).
8. Hit `/api/payments/<screenshotId>` → the image streams back.
9. Visit `/checkout/MC9999` (nonexistent) → 404.

- [ ] **Step 7: Commit**

```powershell
git add scripts/createIndexes.ts package.json package-lock.json
git commit -m "chore: Phase 2 indexes + final QA

Order + payment flow complete. Unit tests green, build passes,
end-to-end order → UPI QR → screenshot upload → confirmation
verified against Atlas.

Spec: docs/superpowers/specs/2026-05-28-order-payment-flow-design.md"
```

---

## Coverage cross-check (self-review)

| Spec section | Implemented in |
|---|---|
| Deps (mongodb, RHF, zod, qrcode) | Task 1 |
| Env vars | Task 1 |
| MongoDB connection singleton | Task 2 |
| Order/payment/counter types | Task 3 |
| `orders`/`payments`/`counters` collections | Tasks 7, 8, 9 |
| Atomic MC#### generator | Tasks 4 (format) + 7 (counter) |
| Snapshotted items + total | Task 4 (repriceCart) + 8 |
| createOrder server action (validate, reprice, persist) | Task 10 |
| Checkout form (structured fields, summary, empty guard) | Tasks 11, 12, 13 |
| Dynamic UPI QR (amount pre-filled) | Tasks 6, 11 |
| Two-panel payment page | Task 16 |
| Screenshot upload (≤2MB, type, server re-validate, status flip) | Tasks 5, 14, 15 |
| Serve screenshot endpoint | Task 14 |
| Confirmation page (masked PII) | Task 17 |
| Cart clears after upload | Task 15 |
| Idempotency (already-submitted guards) | Tasks 14 (409) + 16 (redirect) |
| Validation defense-in-depth | Tasks 5 (schema) + 10 (server) + 14 (server) |
| Prices never trusted from client | Task 10 (repriceCart server-side) |
| Stock check | Task 4 |
| Indexes | Task 18 |
| Delete Phase 1 CheckoutPreview | Task 13 |
| Unit tests for pure logic | Tasks 4, 5, 6 |
| Build + lint + type-check clean | Task 18 |
