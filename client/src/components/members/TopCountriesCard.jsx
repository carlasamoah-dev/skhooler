import { flagEmoji, formatCount } from "@/lib/format";
import { Card, ProgressBar } from "@/components/ui";

export default function TopCountriesCard({ geography, rows = 6 }) {
  if (!geography) return null;

  const sorted = Object.entries(geography.countries || {}).sort((a, b) => b[1].count - a[1].count);
  const top = sorted.slice(0, rows);
  const totalMembers = geography.total || 0;
  // Derived, never stored, so the figures always add up to the stated total.
  const elsewhere = totalMembers - top.reduce((sum, [, data]) => sum + data.count, 0);
  const max = top[0]?.[1]?.count ?? 1;

  return (
    <Card padding={22} radius="panel" className="p-[22px] self-start">
      <h4>Top countries</h4>

      <ul className="mt-4 flex flex-col gap-3">
        {top.map(([code, data]) => (
          <li key={code}>
            <div className="flex items-baseline gap-2 text-ui">
              <span aria-hidden="true">{flagEmoji(code)}</span>
              <span className="truncate">{data.name}</span>
              <span className="ml-auto font-display font-extrabold">{formatCount(data.count)}</span>
            </div>
            <ProgressBar percent={(data.count / max) * 100} height={8} className="mt-1.5" label={data.name} />
          </li>
        ))}
      </ul>

      <p className="mt-4 pt-4 border-t border-divider text-ui text-sand-800">
        {`Everywhere else · ${formatCount(elsewhere)} members`}
      </p>
    </Card>
  );
}
