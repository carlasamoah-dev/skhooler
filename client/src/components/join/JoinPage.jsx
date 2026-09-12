"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, CreditCard, Check, Loader2, ChevronLeft, Users, BookOpen, Calendar, MessageSquare } from "lucide-react";

// Mock community data — in production this comes from params/API
const MOCK_COMMUNITY = {
  name: "Remote Jobs HQ",
  description: "Hand-checked remote job leads every weekday, a full application course, and a room of people who have already made the jump.",
  iconUrl: null,
  memberCount: 4182,
  pricingModel: "PAID",
  price: 19,
  billingInterval: "MONTHLY",
  trialDays: 14,
  tiers: [
    { id: "t1", name: "Standard", price: 19, features: ["Full community access", "Job leads feed", "All courses", "Weekly events"] },
    { id: "t2", name: "VIP", price: 49, features: ["Everything in Standard", "Private coaching calls", "Resume reviews", "Direct Slack access"] },
  ],
};

const BENEFITS = [
  { icon: MessageSquare, label: "Community feed with daily job leads" },
  { icon: BookOpen, label: "6 full courses, 60+ lessons" },
  { icon: Calendar, label: "Weekly live events & AMAs" },
  { icon: Users, label: "4,182 members worldwide" },
];

function CardInput({ label, placeholder, type = "text", maxLength, className = "" }) {
  const [value, setValue] = useState("");
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="field-label !mb-0">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="input"
      />
    </div>
  );
}

export default function JoinPage({ slug }) {
  const router = useRouter();
  const community = MOCK_COMMUNITY;
  const [selectedTierId, setSelectedTierId] = useState(community.tiers[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [trialEndDate, setTrialEndDate] = useState("");
  
  useEffect(() => {
    const formatted = new Date(Date.now() + community.trialDays * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrialEndDate(formatted);
  }, [community.trialDays]);

  const selectedTier = community.tiers.find(t => t.id === selectedTierId);
  const hasTrial = community.trialDays > 0;
  const ctaLabel = hasTrial ? `Start ${community.trialDays}-day free trial` : "Join now";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => router.push(`/${slug}/community`), 1500);
  };

  if (success) {
    return (
      <div className="flex flex-col flex-1 h-full items-center justify-center p-6 bg-ground">
        <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-ground" />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-2">Welcome to {community.name}!</h2>
        <p className="text-sand-600 text-center">Taking you inside…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-ground">
      {/* Minimal top bar */}
      <div className="bg-surface border-b border-divider px-6 py-4 flex items-center gap-4 shrink-0">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-bold text-sand-500 hover:text-ink transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-base font-bold text-ink">{community.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-[1000px] mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8 items-start">

          {/* LEFT — Order summary */}
          <div className="flex flex-col gap-6">
            {/* Community card */}
            <div className="bg-surface border border-divider rounded-2xl p-6 flex items-center gap-4 shadow-soft">
              <div className="w-16 h-16 rounded-xl bg-ink flex items-center justify-center shrink-0 text-ground text-2xl font-extrabold">
                {community.iconUrl ? <img src={community.iconUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : community.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">{community.name}</h2>
                <p className="text-sm text-sand-600 mt-0.5">{community.memberCount.toLocaleString()} members</p>
              </div>
            </div>

            {/* Tier picker */}
            {community.tiers.length > 1 && (
              <div>
                <h3 className="text-sm font-bold text-sand-700 mb-3 uppercase tracking-wide">Choose your plan</h3>
                <div className="flex flex-col gap-3">
                  {community.tiers.map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`flex items-start justify-between p-5 border-2 rounded-xl text-left transition-all ${
                        selectedTierId === tier.id ? "border-ink bg-surface" : "border-divider bg-surface hover:border-sand-400"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedTierId === tier.id ? "border-ink bg-ink" : "border-sand-300"}`}>
                            {selectedTierId === tier.id && <div className="w-2 h-2 rounded-full bg-ground" />}
                          </div>
                          <span className="font-bold text-ink">{tier.name}</span>
                        </div>
                        <ul className="ml-6 space-y-1">
                          {tier.features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-sm text-sand-700">
                              <Check className="w-3.5 h-3.5 text-sand-500 shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-xl font-extrabold text-ink">${tier.price}</span>
                        <span className="text-sm text-sand-500">/mo</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* What's included */}
            <div>
              <h3 className="text-sm font-bold text-sand-700 mb-3 uppercase tracking-wide">What&apos;s included</h3>
              <div className="bg-surface border border-divider rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-soft">
                {BENEFITS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-ink">
                    <div className="w-8 h-8 rounded-lg bg-sand-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-sand-600" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing summary */}
            <div className="bg-ink text-ground rounded-2xl p-5 shadow-soft">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium opacity-80">{selectedTier?.name} membership</span>
                <span className="font-bold">${selectedTier?.price}/mo</span>
              </div>
              {hasTrial && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium opacity-80">Due today</span>
                  <span className="font-bold text-[#4ade80]">$0.00</span>
                </div>
              )}
              {hasTrial && (
                <p className="text-xs opacity-60 mt-3 border-t border-white/20 pt-3">
                  Your {community.trialDays}-day free trial starts now. You&apos;ll be charged ${selectedTier?.price}/mo on{" "}
                  {trialEndDate}.
                  Cancel anytime.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT — Payment form */}
          <div className="bg-surface border border-divider rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-sand-500" />
              <h3 className="font-bold text-ink">Payment details</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <CardInput label="Full name" placeholder="Jonathan Ndayele" />
              <CardInput label="Email address" placeholder="you@example.com" type="email" />

              <div className="flex flex-col gap-1.5">
                <label className="field-label !mb-0">Card number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="input pr-12 tracking-widest"
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CardInput label="Expiry" placeholder="MM / YY" maxLength={7} />
                <CardInput label="CVC" placeholder="•••" type="password" maxLength={4} />
              </div>

              <div className="mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-brand hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-ground font-bold text-[15px] rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    ctaLabel
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[12px] text-sand-500 pt-1">
                <Shield className="w-3.5 h-3.5" />
                Secured by 256-bit TLS encryption · Cancel anytime
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
