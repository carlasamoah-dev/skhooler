import { Card } from "@/components/ui";

/** All four are identical: no filled variant. */
export default function StatCard({ value, label, delta }) {
  return (
    <Card padding={24} radius="card">
      <p className="font-display font-extrabold text-[38px] leading-none tracking-[-0.02em]">{value}</p>
      <p className="mt-2 text-ui text-sand-700">{label}</p>
      {delta ? <p className="mt-1 text-kicker font-bold text-sand-700">{delta}</p> : null}
    </Card>
  );
}
