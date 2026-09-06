/**
 * The auth backend, server side only. Every function returns the shape the real
 * Express API returns, so pointing these at `process.env.BACKEND_URL` is the
 * only change needed to go live.
 *
 * Runs on the server, never in the browser, so tokens never reach client code.
 */
import { session as mockSession } from "@/lib/mocks";

const MIN_PASSWORD = 8;

/** Mirrors the backend's authLimiter: a burst of attempts per identifier. */
const ATTEMPT_LIMIT = 5;
const ATTEMPT_WINDOW_MS = 60_000;
const attempts = new Map();

function rateLimited(key) {
  const now = Date.now();
  const hits = (attempts.get(key) ?? []).filter((t) => now - t < ATTEMPT_WINDOW_MS);
  hits.push(now);
  attempts.set(key, hits);
  return hits.length > ATTEMPT_LIMIT;
}

const ok = (data) => ({ ok: true, status: 200, data });
const fail = (status, message, fieldErrors) => ({ ok: false, status, message, fieldErrors });

function issue(user) {
  return {
    user,
    accessToken: `mock.access.${user.id}.${Date.now()}`,
    refreshToken: `mock.refresh.${user.id}`,
  };
}

export async function login({ email, password }) {
  if (rateLimited(`login:${email}`)) return fail(429);
  if (!password || password.length < MIN_PASSWORD) {
    return fail(400, undefined, { password: `Password must be at least ${MIN_PASSWORD} characters.` });
  }
  // The mock accepts the seeded account; anything else is a wrong credential.
  if (email?.toLowerCase() !== mockSession.user.email) {
    return fail(401, "That email and password do not match.");
  }
  return ok(issue(mockSession.user));
}

export async function register({ email, password, firstName, lastName }) {
  if (rateLimited(`register:${email}`)) return fail(429);
  if (!password || password.length < MIN_PASSWORD) {
    return fail(400, undefined, { password: `Password must be at least ${MIN_PASSWORD} characters.` });
  }
  if (email?.toLowerCase() === mockSession.user.email) {
    return fail(409, undefined, { email: "An account with that email already exists." });
  }
  return ok(issue({ ...mockSession.user, email, firstName, lastName, isEmailVerified: false }));
}

export async function refresh({ refreshToken }) {
  if (!refreshToken?.startsWith("mock.refresh.")) return fail(401, "Your session has expired.");
  return ok(issue(mockSession.user));
}

export async function me({ accessToken }) {
  if (!accessToken?.startsWith("mock.access.")) return fail(401, "Your session has expired.");
  return ok({ user: mockSession.user });
}

export async function logout() {
  return ok({});
}

export async function forgotPassword({ email }) {
  if (rateLimited(`forgot:${email}`)) return fail(429);
  // Always reports success, so the endpoint cannot be used to discover accounts.
  return ok({});
}

export async function resetPassword({ token, password }) {
  if (rateLimited(`reset:${token}`)) return fail(429);
  if (!password || password.length < MIN_PASSWORD) {
    return fail(400, undefined, { password: `Password must be at least ${MIN_PASSWORD} characters.` });
  }
  if (!token || token === "expired") return fail(400, "That reset link has expired. Request a new one.");
  return ok({});
}

export async function verifyEmail({ token }) {
  if (!token || token === "expired") return fail(400, "That verification link has expired.");
  return ok({});
}

export async function resendVerification({ email }) {
  if (rateLimited(`resend:${email}`)) return fail(429);
  return ok({});
}
