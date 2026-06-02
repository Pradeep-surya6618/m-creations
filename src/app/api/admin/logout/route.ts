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
