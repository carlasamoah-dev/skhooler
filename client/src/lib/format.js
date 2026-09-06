/** Display helpers shared across the app. */

/** "Tee Addo" -> "TA". Falls back to the first two letters of a single word. */
export function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const TINTS = [
  "bg-brand-200 text-brand-800",
  "bg-sage-200 text-sage-900",
  "bg-sage-300 text-sage-900",
  "bg-sand-300 text-sand-900",
];

/** Deterministic tint for a name, so an avatar keeps its colour across renders. */
export function avatarTint(name) {
  const s = String(name || "");
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

/** 1148 -> "1.1k". Counts below 1000 are shown in full. */
export function formatCount(n) {
  const value = Number(n) || 0;
  if (Math.abs(value) < 1000) return String(value);
  const k = value / 1000;
  return `${k >= 10 ? Math.round(k) : Math.round(k * 10) / 10}k`;
}

const UNITS = [
  ["y", 31536000],
  ["mo", 2592000],
  ["d", 86400],
  ["h", 3600],
  ["m", 60],
];

/** "4h ago". Anything under a minute reads as "just now". */
export function relativeTime(iso, now = Date.now()) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  for (const [suffix, size] of UNITS) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${suffix} ago`;
  }
  return "just now";
}

/** 1122 -> "18:42"; hours are only shown once there are any. */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** ISO-2 country code -> regional indicator emoji. Always render the code beside it. */
export function flagEmoji(countryCode) {
  const code = String(countryCode || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
