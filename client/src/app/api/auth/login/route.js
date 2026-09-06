import { NextResponse } from "next/server";

import * as backend from "@/lib/auth/backend";
import { errorResponse } from "@/lib/auth/respond";
import { setSessionCookies } from "@/lib/auth/cookies";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const result = await backend.login(body);
  if (!result.ok) return errorResponse(result);

  await setSessionCookies(result.data);
  // Only the user is returned; the tokens stay in httpOnly cookies.
  return NextResponse.json({ user: result.data.user });
}
