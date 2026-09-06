import { Card, ProgressBar } from "@/components/ui";

export default function SourcesCard({ sources = [], referral }) {
  return (
    <Card padding={24} radius="panel" className="p-[26px]">
      <h3 className="text-[19px]">Signup sources</h3>

      <ul className="mt-4 flex flex-col gap-3">
        {sources.map((source) => (
          <li key={source.label}>
            <div className="flex items-baseline gap-3 text-ui">
              <span>{source.label}</span>
              <span className="ml-auto font-display font-extrabold">{`${source.percent}%`}</span>
            </div>
            <ProgressBar percent={source.percent} height={12} className="mt-1.5" label={source.label} />
          </li>
        ))}
      </ul>

      {referral ? (
        <div className="mt-5 pt-5 border-t border-divider">
          <p className="text-ui text-sand-700">Referral payouts due</p>
          <p className="font-display font-extrabold text-[26px] mt-1">{`$${referral.payoutDue}`}</p>
          <p className="text-meta text-sand-700">
            {`${referral.referrerCount} members · paid on ${referral.payoutDay}`}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
