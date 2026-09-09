/**
 * Mock auth helpers — no backend required.
 * All functions simulate success with a short delay.
 * Replace with real API calls when the backend is wired up.
 */

const DELAY = 500;
const wait = (ms = DELAY) => new Promise((r) => setTimeout(r, ms));

export async function login({ email, password } = {}) {
  await wait();
  if (!email || !password) throw Object.assign(new Error("Email and password are required."), { fieldErrors: null });
  return { user: { id: "mock-1", email, firstName: "Jonathan", lastName: "Ndayele" } };
}

export async function register({ email, password, firstName, lastName } = {}) {
  await wait();
  if (!email || !password) throw Object.assign(new Error("All fields are required."), { fieldErrors: null });
  return { user: { id: "mock-1", email, firstName: firstName ?? "User", lastName: lastName ?? "" } };
}

export async function forgotPassword({ email } = {}) {
  await wait();
  console.info(`[mock] Reset link would be sent to: ${email}`);
  return { ok: true };
}

export async function resetPassword({ token, password } = {}) {
  await wait();
  console.info(`[mock] Password reset for token: ${token}`);
  return { ok: true };
}

export async function verifyEmail({ token } = {}) {
  await wait();
  console.info(`[mock] Email verified for token: ${token}`);
  return { ok: true };
}

export async function resendVerification({ email } = {}) {
  await wait();
  console.info(`[mock] Verification resent to: ${email}`);
  return { ok: true };
}

export async function me() {
  await wait();
  // Return the mock session user
  return { 
    user: { 
      id: "mock-1", 
      email: "jonathan@skhooler.com", 
      firstName: "Jonathan", 
      lastName: "Ndayele", 
      username: "jonathan-ndayele",
      location: "Accra, Ghana",
      avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=64&h=64&fit=crop" 
    } 
  };
}

export async function logout() {
  await wait();
  return { ok: true };
}

