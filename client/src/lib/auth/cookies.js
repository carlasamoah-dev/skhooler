import { cookies } from "next/headers";

export const ACCESS_COOKIE = "skh_at";
export const REFRESH_COOKIE = "skh_rt";

const ACCESS_MAX_AGE = 15 * 60; // matches the backend's short access token
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

const BASE = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

/** Tokens are written here and nowhere else, so no browser script can read them. */
export async function setSessionCookies({ accessToken, refreshToken }) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, accessToken, { ...BASE, maxAge: ACCESS_MAX_AGE });
  if (refreshToken) jar.set(REFRESH_COOKIE, refreshToken, { ...BASE, maxAge: REFRESH_MAX_AGE });
}

export async function clearSessionCookies() {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, "", { ...BASE, maxAge: 0 });
  jar.set(REFRESH_COOKIE, "", { ...BASE, maxAge: 0 });
}

export async function readSessionCookies() {
  const jar = await cookies();
  return {
    accessToken: jar.get(ACCESS_COOKIE)?.value ?? null,
    refreshToken: jar.get(REFRESH_COOKIE)?.value ?? null,
  };
}
