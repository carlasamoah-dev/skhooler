import { flagEmoji, formatCount } from "@/lib/format";
import { Card, ProgressBar } from "@/components/ui";

/** ISO-2 codes for the countries the seed can reach; the flag degrades to nothing. */
const CODES = {
  "United Kingdom": "GB",
  Ghana: "GH",
  Nigeria: "NG",
  "United States of America": "US",
  India: "IN",
  Kenya: "KE",
  "South Africa": "ZA",
  Germany: "DE",
  France: "FR",
  Canada: "CA",
};

export default function TopCountriesCard({ geography, rows = 6 }) {
  const sorted = Object.entries(geography.countries).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, rows);
  // Derived, never stored, so the figures always add up to the stated total.
  const elsewhere = geography.total - top.reduce((sum, [, count]) => sum + count, 0);
  const max = top[0]?.[1] ?? 1;

  return (
    <Card padding={22} radius="panel" className="p-[22px] self-start">
      <h4>Top countries</h4>

      <ul className="mt-4 flex flex-col gap-3">
        {top.map(([name, count]) => (
          <li key={name}>
            <div className="flex items-baseline gap-2 text-ui">
              <span aria-hidden="true">{flagEmoji(CODES[name])}</span>
              <span className="truncate">{name}</span>
              <span className="ml-auto font-display font-extrabold">{formatCount(count)}</span>
            </div>
            <ProgressBar percent={(count / max) * 100} height={8} className="mt-1.5" label={name} />
          </li>
        ))}
      </ul>

      <p className="mt-4 pt-4 border-t border-divider text-ui text-sand-800">
        {`Everywhere else · ${formatCount(elsewhere)} members`}
      </p>
    </Card>
  );
}
