import { create } from "zustand";
import { useRouter } from "next/navigation";

function toSlug(name) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 40);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${suffix}`;
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
    const { name, iconPreview } = get();
    set({ status: "submitting" });
    await new Promise((r) => setTimeout(r, 1500));
    const slug = toSlug(name);
    
    // Add to session store so it appears in the navigation rail immediately
    const { addCommunity } = require("@/store/useSessionStore").useSessionStore.getState();
    addCommunity({ slug, name, iconUrl: iconPreview });

    set({ status: "done", slug });
    return slug;
  },

  reset() {
    set({
      step: 1, name: "", description: "", category: "education",
      visibility: "PUBLIC", iconFile: null, iconPreview: null,
      coverFile: null, coverPreview: null, pricingModel: "FREE",
      price: "", billingInterval: "MONTHLY", trialDays: "",
      slug: null, status: "idle",
    });
  },
}));
