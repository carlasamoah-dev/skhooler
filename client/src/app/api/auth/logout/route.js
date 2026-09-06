import { NextResponse } from "next/server";

import * as backend from "@/lib/auth/backend";
import { clearSessionCookies, readSessionCookies } from "@/lib/auth/cookies";

export async function POST() {
  const { accessToken } = await readSessionCookies();
  await backend.logout({ accessToken });
  await clearSessionCookies();
  return NextResponse.json({ ok: true });
}
