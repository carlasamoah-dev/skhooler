"use client";

import { useState } from "react";

import { saveQuestions } from "@/lib/api";
import { Button, Checkbox, Input, EmptyState } from "@/components/ui";
import { Lock } from "lucide-react";
import Panel from "./Panel";

const MAX = 3;

export default function JoinQuestionsPanel({ slug, group, questions, onSaved }) {
  if (!group?.requireJoinQuestions) {
    return (
      <EmptyState
        icon={Lock}
        title="Join Questions are turned off"
        body="This setting has been turned off. Please go to the General tab to turn it on if you want to require users to answer questions when joining."
      />
    );
  }
  // Always render three slots; empty ones are dropped on save.
  const [rows, setRows] = useState(() =>
    Array.from({ length: MAX }, (_, i) => questions[i] ?? { question: "", isRequired: false }),
  );
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const update = (index, patch) => {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setSaved(false);
  };

  return (
    <Panel
      title="Join questions"
      action={
        <Button
          loading={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const kept = rows.filter((r) => r.question.trim());
              await saveQuestions(slug, kept);
              await onSaved?.();
              setSaved(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          {saved ? "Saved" : "Save questions"}
        </Button>
      }
    >
      <p className="text-body text-sand-800">
        Up to three questions. Answers arrive with the request, so you can read before you approve.
      </p>

      {rows.map((row, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Input
            label={`Question ${index + 1}`}
            maxLength={500}
            value={row.question}
            onChange={(e) => update(index, { question: e.target.value })}
          />
          <Checkbox
            label="Required"
            checked={!!row.isRequired}
            onChange={(v) => update(index, { isRequired: v })}
          />
        </div>
      ))}
    </Panel>
  );
}
