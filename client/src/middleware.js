import { NextResponse } from "next/server";

import { REFRESH_COOKIE } from "@/lib/auth/cookies";

/** Public paths. Everything else under /[slug]/... needs a session. */
const PUBLIC_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/discover"];

const APP_SECTIONS = ["community", "posts", "classroom", "calendar", "members", "dashboard", "settings"];

function isAppRoute(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  // /[slug]/<section>/... — the bare /[slug] is the public landing page.
  return segments.length >= 2 && APP_SECTIONS.includes(segments[1]);
}

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (!isAppRoute(pathname)) return NextResponse.next();

  // The refresh cookie is the long-lived one; a missing access cookie only
  // means it aged out, and the API layer renews it.
  if (request.cookies.get(REFRESH_COOKIE)?.value) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
