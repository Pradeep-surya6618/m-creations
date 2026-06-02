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
