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
