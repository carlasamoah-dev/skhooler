"use client";

import { useState } from "react";

import { savePreferences } from "@/lib/api";
import { Button, Checkbox } from "@/components/ui";
import Panel from "./Panel";

/** The four booleans the API exposes, in the order the design lists them. */
const ROWS = [
  { key: "emailNewPost", label: "Email me about new posts" },
  { key: "emailCommentReply", label: "Email me about comments and replies" },
  { key: "emailEventReminder", label: "Email me event reminders" },
  { key: "inAppAll", label: "Show notifications in the app" },
];

export default function NotificationsPanel({ preferences, onSaved }) {
  const [values, setValues] = useState(preferences);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <Panel
      title="Notifications"
      action={
        <Button
          loading={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await savePreferences(values);
              await onSaved?.();
              setSaved(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          {saved ? "Saved" : "Save preferences"}
        </Button>
      }
    >
      {ROWS.map((row) => (
        <Checkbox
          key={row.key}
          wrapped
          label={row.label}
          checked={!!values[row.key]}
          onChange={(v) => {
            setValues((s) => ({ ...s, [row.key]: v }));
            setSaved(false);
          }}
        />
      ))}
    </Panel>
  );
}
