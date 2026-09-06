import { NextResponse } from "next/server";

import * as backend from "@/lib/auth/backend";
import { errorResponse } from "@/lib/auth/respond";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const result = await backend.resetPassword(body);
  if (!result.ok) return errorResponse(result);
  return NextResponse.json({ ok: true });
}
