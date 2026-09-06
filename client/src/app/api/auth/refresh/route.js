import { NextResponse } from "next/server";

import * as backend from "@/lib/auth/backend";
import { errorResponse } from "@/lib/auth/respond";
import { clearSessionCookies, readSessionCookies, setSessionCookies } from "@/lib/auth/cookies";

export async function POST() {
  const { refreshToken } = await readSessionCookies();
  const result = await backend.refresh({ refreshToken });

  if (!result.ok) {
    // A refresh token that no longer works is worse than none: drop it.
    await clearSessionCookies();
    return errorResponse(result);
  }

  await setSessionCookies(result.data);
  return NextResponse.json({ user: result.data.user });
}
