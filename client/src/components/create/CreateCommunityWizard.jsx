"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, ArrowLeft, ArrowRight, Loader2, Globe, Lock, CreditCard } from "lucide-react";
import { useCreateStore } from "@/store/useCreateStore";

const CATEGORIES = [
  "Education", "Business", "Health & Fitness", "Tech", "Creative Arts",
  "Music", "Gaming", "Finance", "Sports", "Lifestyle", "Other",
];

const STEP_LABELS = ["Basics", "Branding", "Pricing", "Review"];

/* ─── Step indicator ─── */
function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold transition-colors ${
                done ? "bg-ink text-ground" : active ? "bg-ink text-ground ring-4 ring-ink/20" : "bg-sand-200 text-sand-500"
              }`}>
                {done ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={`text-[11px] font-semibold hidden sm:block ${active ? "text-ink" : "text-sand-500"}`}>{label}</span>
            </div>
            {i < total - 1 && (
              <div className={`h-[2px] w-12 sm:w-20 mx-1 mb-4 transition-colors ${done ? "bg-ink" : "bg-sand-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1: Basics ─── */
function StepBasics() {
  const { name, description, category, visibility, set } = useCreateStore();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="field-label">Community name <span className="text-alert">*</span></label>
        <input
          value={name}
          onChange={e => set({ name: e.target.value })}
          placeholder="e.g. Remote Jobs HQ"
          className="input"
        />
      </div>

      <div>
        <label className="field-label">Description</label>
        <textarea
          value={description}
          onChange={e => set({ description: e.target.value })}
          placeholder="Tell people what your community is about..."
          rows={4}
          className="input"
        />
      </div>

      <div>
        <label className="field-label">Category</label>
        <select
          value={category}
          onChange={e => set({ category: e.target.value })}
          className="input bg-sand-100"
        >
          {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="field-label mb-2">Visibility</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "PUBLIC", icon: Globe, label: "Public", desc: "Anyone can find and preview it" },
            { value: "PRIVATE", icon: Lock, label: "Private", desc: "Invite-only, hidden from discovery" },
          ].map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              onClick={() => set({ visibility: value })}
              className={`flex flex-col items-start gap-1 p-4 border-2 rounded-xl text-left transition-all ${
                visibility === value ? "border-ink bg-surface" : "border-divider bg-ground hover:border-sand-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-ink" />
                <span className="font-bold text-ink text-sm">{label}</span>
              </div>
              <span className="text-[12px] text-sand-700">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Branding ─── */
function ImageDropZone({ label, preview, onFile, hint }) {
  const ref = useRef(null);
  return (
    <div>
      <label className="field-label mb-1.5">{label}</label>
      <div
        onClick={() => ref.current?.click()}
        className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
          preview ? "border-divider bg-sand-100 h-[140px]" : "border-divider hover:border-sand-400 bg-sand-100 h-[140px]"
        }`}
      >
        <input type="file" accept="image/*" className="hidden" ref={ref} onChange={e => onFile(e.target.files?.[0])} />
        {preview ? (
          <img src={preview} alt="" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <>
            <Upload className="w-6 h-6 text-sand-500 mb-2" />
            <span className="text-sm text-sand-700">Click to upload</span>
            {hint && <span className="text-xs text-sand-500 mt-1">{hint}</span>}
          </>
        )}
      </div>
    </div>
  );
}

function StepBranding() {
  const { iconPreview, coverPreview, setIcon, setCover } = useCreateStore();
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-sand-600">These images help members recognise your community instantly. You can always change them later.</p>
      <ImageDropZone label="Community icon" preview={iconPreview} onFile={setIcon} hint="Square image, at least 256×256px" />
      <ImageDropZone label="Cover banner" preview={coverPreview} onFile={setCover} hint="Recommended: 1600×400px" />
    </div>
  );
}

/* ─── Step 3: Pricing ─── */
function StepPricing() {
  const { pricingModel, price, billingInterval, trialDays, set } = useCreateStore();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="field-label mb-2">Pricing model</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "FREE", label: "Free", desc: "Open to everyone at no cost" },
            { value: "PAID", label: "Paid", desc: "Charge a monthly or yearly fee" },
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => set({ pricingModel: value })}
              className={`flex flex-col items-start gap-1 p-4 border-2 rounded-xl text-left transition-all ${
                pricingModel === value ? "border-ink bg-surface" : "border-divider bg-ground hover:border-sand-400"
              }`}
            >
              <span className="font-bold text-ink text-sm">{label}</span>
              <span className="text-[12px] text-sand-700">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {pricingModel === "PAID" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label mb-1.5">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-500 font-medium">$</span>
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={e => set({ price: e.target.value })}
                  placeholder="29"
                  className="input pl-8"
                />
              </div>
            </div>
            <div>
              <label className="field-label mb-1.5">Billed</label>
              <select
                value={billingInterval}
                onChange={e => set({ billingInterval: e.target.value })}
                className="input"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="field-label mb-1.5">Free trial (days)</label>
            <input
              type="number"
              min="0"
              value={trialDays}
              onChange={e => set({ trialDays: e.target.value })}
              placeholder="0 = no trial"
              className="input"
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Step 4: Review ─── */
function StepReview() {
  const { name, description, category, visibility, iconPreview, coverPreview, pricingModel, price, billingInterval, trialDays } = useCreateStore();

  const rows = [
    { label: "Name", value: name || "—" },
    { label: "Description", value: description || "—" },
    { label: "Category", value: category },
    { label: "Visibility", value: visibility },
    { label: "Pricing", value: pricingModel === "FREE" ? "Free" : `$${price}/${billingInterval.toLowerCase()}${trialDays ? ` · ${trialDays}-day trial` : ""}` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-sand-600">Review everything before launching. You can always change these settings later.</p>

      {/* Icon + Cover preview */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl border border-divider bg-sand-100 overflow-hidden shrink-0 flex items-center justify-center">
          {iconPreview ? <img src={iconPreview} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-sand-400">{name?.[0]?.toUpperCase() || "?"}</span>}
        </div>
        {coverPreview && (
          <div className="flex-1 h-14 rounded-xl overflow-hidden border border-divider">
            <img src={coverPreview} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        {!coverPreview && <div className="flex-1 h-14 rounded-xl bg-sand-100 border border-divider" />}
      </div>

      <div className="divide-y divide-divider border border-divider rounded-xl overflow-hidden">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-start gap-4 px-5 py-3.5 bg-ground">
            <span className="text-sm font-semibold text-sand-600 w-24 shrink-0">{label}</span>
            <span className="text-sm text-ink break-words flex-1">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Wizard ─── */
export default function CreateCommunityWizard() {
  const router = useRouter();
  const { step, totalSteps, name, pricingModel, price, status, nextStep, prevStep, launch, reset } = useCreateStore();

  const stepValid = () => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 3 && pricingModel === "PAID") return price && Number(price) > 0;
    return true;
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      nextStep();
    } else {
      const slug = await launch();
      reset();
      router.push(`/${slug}/community`);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-ground">
      {/* Minimal wizard header — no GlobalNavbar on this standalone page */}
      <div className="bg-surface border-b border-divider px-6 h-14 flex items-center justify-between shrink-0">
        <span className="font-display font-extrabold text-lg text-ink tracking-tight">skhooler</span>
        <button
          onClick={() => router.push("/discover")}
          className="btn btn-ghost text-sm"
        >
          Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-[560px]">
          {/* Step indicator */}
          <div className="flex justify-center mb-10">
            <StepIndicator current={step} total={totalSteps} />
          </div>

          {/* Card */}
          <div className="bg-surface border border-divider rounded-2xl shadow-soft p-8">
            <h2 className="text-2xl font-bold text-ink mb-1">
              {step === 1 && "Tell us about your community"}
              {step === 2 && "Add your branding"}
              {step === 3 && "Set up pricing"}
              {step === 4 && "Ready to launch?"}
            </h2>
            <p className="text-sm text-sand-600 mb-7">
              {step === 1 && "A clear name and description help people find and understand your community."}
              {step === 2 && "Upload an icon and cover image — or skip and add them later."}
              {step === 3 && "Choose how you want to monetise your community."}
              {step === 4 && "Check the details below, then click Launch to go live."}
            </p>

            {step === 1 && <StepBasics />}
            {step === 2 && <StepBranding />}
            {step === 3 && <StepPricing />}
            {step === 4 && <StepReview />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="btn btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={!stepValid() || status === "submitting"}
              className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Launching...</>
              ) : step < totalSteps ? (
                <>Next <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Launch community 🚀</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
