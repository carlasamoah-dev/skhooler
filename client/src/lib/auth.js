const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

let refreshPromise = null;

export async function refreshTokens() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Refresh failed");

      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return data.data;
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (typeof window !== "undefined") {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        if (!window.location.pathname.startsWith("/discover")) {
          window.location.href = `/discover?next=${next}`;
        } else {
          window.location.href = "/discover";
        }
      }
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Backend shape: { success: false, error: { code, message } }
    const message =
      errorData?.error?.message ||
      errorData?.message ||
      "An error occurred";
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return response.json();
};

export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(response);
  
  if (data.data && data.data.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }
  
  return { user: data.data.user, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken };
}

export async function register({ email, password, firstName, lastName }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
  const data = await handleResponse(response);
  
  if (data.data && data.data.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }
  
  return { user: data.data.user, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken };
}

export async function forgotPassword({ email }) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
}

export async function resetPassword({ token, password }) {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword: password }),
  });
  return handleResponse(response);
}

export async function verifyEmail({ token }) {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return handleResponse(response);
}

export async function resendVerification({ email }) {
  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
}

export async function me(retry = true) {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (response.status === 401 && retry) {
    try {
      await refreshTokens();
      return me(false); // retry once without endless loops
    } catch (e) {
      // Refresh failed, throw the original error or let it fail
    }
  }

  const data = await handleResponse(response);
  const user = data.data;
  const communities = user.groupMemberships?.map(m => m.group) || [];
  delete user.groupMemberships; // Don't keep communities inside user object
  return { user, communities };
}

export async function logout() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return { ok: true };
}
