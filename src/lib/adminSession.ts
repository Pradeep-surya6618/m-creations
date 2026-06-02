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
