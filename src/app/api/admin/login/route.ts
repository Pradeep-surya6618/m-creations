import { compare } from "bcryptjs";
import { loginSchema } from "@/lib/validation/admin";
import {
  signAdminToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/adminSession";

// In-memory rate limit: 3 failures per IP per 10 minutes.
const failuresByIp = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 3;

function bumpFailure(ip: string): boolean {
  const now = Date.now();
  const arr = (failuresByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  failuresByIp.set(ip, arr);
  // Return is intentionally unused — the gate is the >= MAX_FAILURES check
  // at the top of POST, which runs BEFORE bcrypt.
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
