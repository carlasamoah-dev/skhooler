"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { addTier, deleteTier, renameTier, updatePricing } from "@/lib/api";
import { Button, Input, RadioCard, SegmentedControl, StatusDot } from "@/components/ui";
import Panel from "./Panel";

const INTERVALS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

const TIER_TONES = ["brand", "sage", "neutral"];

export default function PricingPanel({ group, tiers, onTiers, onSaved }) {
  const [formError, setFormError] = useState(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      pricingModel: group.pricingModel ?? "FREE",
      price: group.price ?? "",
      billingInterval: group.billingInterval ?? "MONTHLY",
      trialDays: group.trialDays ?? "",
    },
  });

  const pricingModel = useWatch({ control, name: "pricingModel" });

  const submit = async (values) => {
    setFormError(null);
    setSaved(false);
    try {
      const updated = await updatePricing({
        pricingModel: values.pricingModel,
        price: values.price === "" ? null : Number(values.price),
        billingInterval: values.billingInterval || null,
        trialDays: values.trialDays === "" ? null : Number(values.trialDays),
      });
      onSaved?.(updated);
      setSaved(true);
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <>
      <Panel
        title="Pricing"
        onSubmit={handleSubmit(submit)}
        action={
          <Button type="submit" loading={isSubmitting}>
            {saved ? "Saved" : "Save pricing"}
          </Button>
        }
      >
        {formError ? (
          <p role="alert" className="text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">
            {formError}
          </p>
        ) : null}

        <Controller
          name="pricingModel"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RadioCard
                name="pricingModel"
                value="FREE"
                label="Free"
                description="Anyone approved can join at no cost."
                checked={field.value === "FREE"}
                onChange={field.onChange}
              />
              <RadioCard
                name="pricingModel"
                value="PAID"
                label="Paid"
                description="One price, billed monthly or yearly."
                checked={field.value === "PAID"}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {pricingModel === "PAID" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <Input label="Price" type="number" min="1" step="1" {...register("price")} />
              <div>
                <p className="field-label">Billing</p>
                <Controller
                  name="billingInterval"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      label="Billing interval"
                      options={INTERVALS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <Input label="Free trial (days)" type="number" min="0" step="1" {...register("trialDays")} />
            </div>
            <p className="text-meta text-sand-700">
              Checkout is running against the test payment endpoint — no live charges yet.
            </p>
          </>
        ) : null}
      </Panel>

      <TiersCard tiers={tiers} onTiers={onTiers} />
    </>
  );
}

function TiersCard({ tiers, onTiers }) {
  const [adding, setAdding] = useState("");

  return (
    <Panel
      title="Member tiers"
      action={
        <div className="flex items-center gap-2">
          <Input
            aria-label="New tier name"
            placeholder="Tier name"
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            className="min-h-[38px] w-[160px]"
          />
          <Button
            disabled={!adding.trim()}
            onClick={async () => {
              await addTier(adding.trim());
              setAdding("");
              onTiers?.();
            }}
          >
            Add tier
          </Button>
        </div>
      }
    >
      <p className="text-body text-sand-800">
        Tiers are access labels, not prices. Assign a member to a tier, then lock courses and events to it.
      </p>

      <ul className="flex flex-col gap-2">
        {tiers.map((tier, index) => (
          <li key={tier.id} className="bg-sand-100 rounded-inner px-5 py-4 flex flex-wrap items-center gap-3">
            <StatusDot tone={TIER_TONES[index % TIER_TONES.length]} label={tier.name} />
            <p className="text-meta text-sand-700">
              {`${tier.memberCount.toLocaleString("en-GB")} members · ${tier.lockedContent}`}
            </p>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const name = window.prompt("Rename tier", tier.name);
                  if (name?.trim()) {
                    await renameTier(tier.id, name.trim());
                    onTiers?.();
                  }
                }}
              >
                Rename
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await deleteTier(tier.id);
                  onTiers?.();
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
