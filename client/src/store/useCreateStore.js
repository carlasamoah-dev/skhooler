import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
}

async function authFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || "Something went wrong";
    throw new Error(msg);
  }
  return data.data;
}

/**
 * Upload a single File to Supabase Storage via a backend-issued signed URL.
 * Returns the public URL of the uploaded file, or null if no file provided.
 */
async function uploadImage(file, bucket) {
  if (!file) return null;

  // 1. Get signed URL from backend
  const { signedUrl, publicUrl } = await authFetch("/upload/signed-url", {
    method: "POST",
    body: JSON.stringify({
      bucket,
      filename: file.name,
      contentType: file.type,
    }),
  });

  // 2. PUT the file directly to Supabase Storage
  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload image to storage");
  }

  return publicUrl;
}

export const useCreateStore = create((set, get) => ({
  step: 1,
  totalSteps: 4,

  // Step 1 — Basics
  name: "",
  description: "",
  category: "education",
  visibility: "PUBLIC",

  // Step 2 — Branding
  iconFile: null,
  iconPreview: null,
  coverFile: null,
  coverPreview: null,

  // Step 3 — Pricing
  pricingModel: "FREE",
  price: "",
  billingInterval: "MONTHLY",
  trialDays: "",

  // Final state
  slug: null,
  status: "idle", // idle | submitting | done | error
  error: null,

  set: (patch) => set(patch),

  nextStep() {
    const { step, totalSteps } = get();
    if (step < totalSteps) set({ step: step + 1 });
  },

  prevStep() {
    const { step } = get();
    if (step > 1) set({ step: step - 1 });
  },

  setIcon(file) {
    const url = file ? URL.createObjectURL(file) : null;
    set({ iconFile: file, iconPreview: url });
  },

  setCover(file) {
    const url = file ? URL.createObjectURL(file) : null;
    set({ coverFile: file, coverPreview: url });
  },

  async launch() {
    const {
      name, description, category, visibility,
      iconFile, coverFile,
      pricingModel, price, billingInterval, trialDays,
    } = get();

    set({ status: "submitting", error: null });

    try {
      // 1. Upload images in parallel (returns null if no file)
      const [iconUrl, coverUrl] = await Promise.all([
        uploadImage(iconFile, "community-icons"),
        uploadImage(coverFile, "community-covers"),
      ]);

      // 2. Build payload — map frontend category to backend tags array
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
        tags: category ? [category] : [],
        iconUrl,
        coverUrl,
        pricingModel,
        ...(pricingModel === "PAID" && {
          price: Number(price),
          billingInterval,
          trialDays: trialDays ? Number(trialDays) : 0,
        }),
      };

      // 3. Create the group on the backend
      const group = await authFetch("/groups", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // 4. Add community to session store so it appears in the sidebar immediately
      const { useSessionStore } = await import("@/store/useSessionStore");
      useSessionStore.getState().addCommunity({
        slug: group.slug,
        name: group.name,
        iconUrl: group.iconUrl ?? null,
      });

      set({ status: "done", slug: group.slug });
      return group.slug;
    } catch (err) {
      set({ status: "error", error: err.message });
      throw err;
    }
  },

  reset() {
    set({
      step: 1, name: "", description: "", category: "education",
      visibility: "PUBLIC", iconFile: null, iconPreview: null,
      coverFile: null, coverPreview: null, pricingModel: "FREE",
      price: "", billingInterval: "MONTHLY", trialDays: "",
      slug: null, status: "idle", error: null,
    });
  },
}));
