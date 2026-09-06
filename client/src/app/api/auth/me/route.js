import { NextResponse } from "next/server";

import * as backend from "@/lib/auth/backend";
import { clearSessionCookies, readSessionCookies, setSessionCookies } from "@/lib/auth/cookies";

/**
 * Who is signed in. An absent session is a 200 with a null user, not an error:
 * every anonymous page load calls this, and a 401 there is console noise rather
 * than information. A live refresh cookie is spent here, so the caller never
 * has to orchestrate a retry.
 */
export async function GET() {
  const { accessToken, refreshToken } = await readSessionCookies();

  const current = await backend.me({ accessToken });
  if (current.ok) return NextResponse.json({ user: current.data.user });

  if (!refreshToken) return NextResponse.json({ user: null });

  const renewed = await backend.refresh({ refreshToken });
  if (!renewed.ok) {
    await clearSessionCookies();
    return NextResponse.json({ user: null });
  }

  await setSessionCookies(renewed.data);
  return NextResponse.json({ user: renewed.data.user });
}
