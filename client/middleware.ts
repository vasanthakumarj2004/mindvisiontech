import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware that protects all /admin/* routes (except /admin/login).
 * Checks for the admin_token cookie set by the API on login.
 * The token is NOT verified here (no JWT secret in the edge runtime) —
 * the API validates it on every request. This is just a UX redirect gate.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public admin routes (no auth needed)
  if (pathname === "/admin/login") return NextResponse.next();

  // Protected admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token");
    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
