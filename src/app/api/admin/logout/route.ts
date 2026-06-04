import { SESSION_COOKIE_NAME } from "@/lib/adminSession";

export async function POST() {
  // Match the login route: Secure only in production so dev-over-HTTP works
  // for LAN testing. The cookie being cleared must use the same flags it
  // was set with or browsers refuse to clear it.
  const isProd = process.env.NODE_ENV === "production";
  const cookieFlags = ["Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (isProd) cookieFlags.splice(1, 0, "Secure");

  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; ${cookieFlags.join("; ")}`
  );
  headers.append("Location", "/admin/login");
  return new Response(null, { status: 303, headers });
}
