"use client";

import { useState } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import Panel from "./Panel";

const CATEGORIES = ["Education", "Technology", "Business", "Health", "Lifestyle", "Arts"];

export default function DiscoveryPanel({ group, onSaved }) {
  const [listed, setListed] = useState(group?.visibility === "PUBLIC");
  const [category, setCategory] = useState("Technology");
  const [keywords, setKeywords] = useState("remote work, careers, software");
  const [busy, setBusy] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600)); // Mock save
    setBusy(false);
    onSaved?.();
  };

  return (
    <>
      <Panel
        title="Discovery & Ranking"
        onSubmit={handleSave}
        action={<Button type="submit" loading={busy}>Save changes</Button>}
      >
        <p className="text-[13px] text-sand-700">
          Control how your community appears in the global Skhooler directory.
        </p>

        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id="listed"
            checked={listed}
            onChange={(e) => setListed(e.target.checked)}
            className="w-4 h-4 rounded border-divider text-ink focus:ring-ink"
          />
          <label htmlFor="listed" className="text-[15px] font-semibold text-ink">
            List in Discover directory
          </label>
        </div>

        <Select
          label="Primary category"
          value={category}
          onChange={setCategory}
          options={CATEGORIES.map(c => ({ value: c, label: c }))}
          disabled={!listed}
        />

        <Input
          label="Search keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g. fitness, diet, coaching"
          disabled={!listed}
        />
        <p className="text-[12px] text-sand-500 -mt-3">Separate keywords with commas.</p>
      </Panel>
    </>
  );
}
