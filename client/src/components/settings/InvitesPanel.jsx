"use client";

import { useRef, useState } from "react";
import { Check, Copy, Mail, Upload } from "lucide-react";

import { emailInvites } from "@/lib/api";
import { Button, Input, Textarea } from "@/components/ui";
import Panel from "./Panel";

const MAX_EMAILS = 50;

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

/** Parse a CSV file and extract the first column (or any email-looking value). */
function parseEmailsFromCsv(text) {
  return text
    .split(/\r?\n/)
    .flatMap((line) => line.split(","))
    .map((cell) => cell.replace(/["']/g, "").trim())
    .filter((cell) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cell));
}

export default function InvitesPanel({ invites, onInvites }) {
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState("");
  const [emailStatus, setEmailStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [csvName, setCsvName] = useState(null);
  const csvRef = useRef(null);

  const addresses = emails
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  const tooMany = addresses.length > MAX_EMAILS;

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseEmailsFromCsv(ev.target.result);
      if (parsed.length === 0) {
        setEmailStatus("No valid email addresses found in that file.");
        return;
      }
      // Merge with any existing textarea emails, deduplicate.
      const existing = new Set(addresses);
      const merged = [...existing, ...parsed];
      setEmails(merged.slice(0, MAX_EMAILS).join("\n"));
      setEmailStatus(`${parsed.length} address${parsed.length === 1 ? "" : "es"} imported from ${file.name}.`);
    };
    reader.readAsText(file);
    // Reset file input so the same file can be re-selected.
    e.target.value = "";
  };

  const handleSend = async () => {
    setBusy(true);
    setEmailStatus(null);
    try {
      const { sent } = await emailInvites(addresses);
      setEmailStatus(`✓ Sent ${sent} invite${sent === 1 ? "" : "s"} successfully.`);
      setEmails("");
      setCsvName(null);
    } catch (error) {
      setEmailStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Share link */}
      <Panel title="Share link">
        <p className="text-ui text-sand-700 mb-3">
          Anyone with this link can request to join. Share it on social media or wherever your audience is.
        </p>
        <div className="bg-sand-100 rounded-inner px-5 py-4 flex flex-wrap items-center gap-3">
          <code className="text-ui break-all text-ink">{invites.shareLink}</code>
          <Button
            variant="secondary"
            className="ml-auto"
            icon={copied ? Check : Copy}
            onClick={async () => {
              setCopied(await copyText(invites.shareLink));
              setTimeout(() => setCopied(false), 2500);
            }}
          >
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </Panel>

      {/* Invite by email */}
      <Panel
        title="Invite by email"
        action={
          <Button
            loading={busy}
            disabled={addresses.length === 0 || tooMany || busy}
            icon={Mail}
            onClick={handleSend}
          >
            Send invites
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-ui text-sand-700">
            Type or paste email addresses (separated by commas, spaces, or new lines), or import a CSV file.
            Maximum {MAX_EMAILS} at a time.
          </p>

          <Textarea
            label={`Email addresses${addresses.length > 0 ? ` — ${addresses.length} added` : ""}`}
            rows={5}
            placeholder={"alice@example.com\nbob@example.com"}
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            error={tooMany ? `That's ${addresses.length} addresses — the maximum is ${MAX_EMAILS} at a time.` : undefined}
          />

          {/* CSV import */}
          <div>
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCsvUpload}
            />
            <button
              type="button"
              onClick={() => csvRef.current?.click()}
              className="btn btn-secondary text-[13px] gap-2"
            >
              <Upload className="w-4 h-4" />
              {csvName ? `Replace CSV (${csvName})` : "Import CSV"}
            </button>
            <p className="text-meta text-sand-600 mt-1.5">
              The first email-shaped column in each row will be imported.
            </p>
          </div>

          {emailStatus ? (
            <p
              role="status"
              className={`text-ui ${emailStatus.startsWith("✓") ? "text-sand-800" : "text-alert"}`}
            >
              {emailStatus}
            </p>
          ) : null}
        </div>
      </Panel>
    </>
  );
}
