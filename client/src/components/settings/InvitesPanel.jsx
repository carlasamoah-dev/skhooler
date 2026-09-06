"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { createInvite, emailInvites, revokeInvite } from "@/lib/api";
import { Button, Input, Textarea } from "@/components/ui";
import Panel from "./Panel";

const MAX_EMAILS = 50;

/** Clipboard access can be refused; fall back to a selection copy. */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand?.("copy") ?? false;
    field.remove();
    return ok;
  }
}

export default function InvitesPanel({ invites, onInvites }) {
  const [copied, setCopied] = useState(false);
  const [maxUses, setMaxUses] = useState("25");
  const [expiresInDays, setExpiresInDays] = useState("14");
  const [emails, setEmails] = useState("");
  const [emailStatus, setEmailStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const addresses = emails
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  const tooMany = addresses.length > MAX_EMAILS;

  return (
    <>
      <Panel title="Share link">
        <div className="bg-sand-100 rounded-inner px-5 py-4 flex flex-wrap items-center gap-3">
          <code className="text-ui break-all">{invites.shareLink}</code>
          <Button
            variant="secondary"
            className="ml-auto"
            icon={copied ? Check : Copy}
            onClick={async () => {
              setCopied(await copyText(invites.shareLink));
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      </Panel>

      <Panel
        title="Invite codes"
        action={
          <Button
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await createInvite({ maxUses, expiresInDays });
                await onInvites?.();
              } finally {
                setBusy(false);
              }
            }}
          >
            Create invite code
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Max uses"
            type="number"
            min="1"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />
          <Input
            label="Expires in (days)"
            type="number"
            min="1"
            max="365"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
          />
        </div>

        <h4 className="text-[17px]">Active codes</h4>
        <ul className="flex flex-col gap-2">
          {invites.items.map((invite) => (
            <li key={invite.id} className="bg-sand-100 rounded-inner px-5 py-4 flex flex-wrap items-center gap-3">
              <code className="font-display font-extrabold text-ui">{invite.code}</code>
              <p className="text-meta text-sand-700">
                {`${invite.useCount} of ${invite.maxUses} used · expires ${new Date(invite.expiresAt).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short" },
                )}`}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={async () => {
                  await revokeInvite(invite.id);
                  await onInvites?.();
                }}
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Invite by email"
        action={
          <Button
            variant="secondary"
            disabled={addresses.length === 0 || tooMany}
            onClick={async () => {
              try {
                const { sent } = await emailInvites(addresses);
                setEmailStatus(`Sent ${sent} invite${sent === 1 ? "" : "s"}.`);
                setEmails("");
              } catch (error) {
                setEmailStatus(error.message);
              }
            }}
          >
            Send invites
          </Button>
        }
      >
        <Textarea
          label={`Or invite by email — up to ${MAX_EMAILS} at a time`}
          rows={4}
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          error={tooMany ? `That is ${addresses.length} addresses. Fifty at a time is the maximum.` : undefined}
        />
        {emailStatus ? (
          <p role="status" className="text-ui text-sand-800">
            {emailStatus}
          </p>
        ) : null}
      </Panel>
    </>
  );
}
