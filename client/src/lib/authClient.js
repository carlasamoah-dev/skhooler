/**
 * Browser side of auth. Every call goes to this app's own /api/auth routes,
 * which hold the tokens in httpOnly cookies; nothing here ever sees a token.
 */

export class AuthError extends Error {
  constructor(status, message, fieldErrors) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.fieldErrors = fieldErrors ?? null;
    this.isRateLimit = status === 429;
  }
}

async function call(path, { method = "POST", body } = {}) {
  let response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AuthError(0, "Could not reach the server. Check your connection.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new AuthError(response.status, data.message, data.fieldErrors);
  return data;
}

export const login = (body) => call("login", { body });
export const register = (body) => call("register", { body });
export const logout = () => call("logout");
export const refresh = () => call("refresh");
export const forgotPassword = (body) => call("forgot-password", { body });
export const resetPassword = (body) => call("reset-password", { body });
export const verifyEmail = (body) => call("verify-email", { body });
export const resendVerification = (body) => call("resend-verification", { body });

/**
 * Current user, or `{ user: null }` when nobody is signed in. The route renews
 * an aged-out access cookie itself, so there is no retry to do here.
 */
export const fetchMe = () => call("me", { method: "GET" });
