"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { fetchAnalyticsGrowth, fetchAnalyticsOverview, fetchAnalyticsSources } from "@/lib/api";
import { formatCount } from "@/lib/format";
import { useCan } from "@/lib/permissions";
import { Button, Skeleton } from "@/components/ui";
import SignupsChart from "./SignupsChart";
import SourcesCard from "./SourcesCard";
import StatCard from "./StatCard";

export default function DashboardClient() {
  const can = useCan();
  const showRevenue = can("analytics:revenue");
  const canViewDash = can("analytics:view");

  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [sources, setSources] = useState(null);
  const [loadingGrowth, setLoadingGrowth] = useState(false);

  useEffect(() => {
    if (!canViewDash) return;
    let cancelled = false;
    fetchAnalyticsOverview().then((o) => !cancelled && setOverview(o));
    fetchAnalyticsGrowth("week").then((g) => !cancelled && setGrowth(g));
    fetchAnalyticsSources().then((s) => !cancelled && setSources(s));
    return () => {
      cancelled = true;
    };
  }, [canViewDash]);

  // Members and Moderators cannot view the dashboard
  if (!canViewDash) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-sand-400" />
        </div>
        <h2 className="text-xl font-display font-extrabold text-ink mb-2">Dashboard is for Admins only</h2>
        <p className="text-sand-600 max-w-sm">
          Only Admins and the Owner can view community analytics.
        </p>
      </div>
    );
  }

  const changeInterval = async (interval) => {
    setLoadingGrowth(true);
    try {
      setGrowth(await fetchAnalyticsGrowth(interval));
    } finally {
      setLoadingGrowth(false);
    }
  };

  if (!overview || !growth || !sources) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton variant="row" count={2} />
        <Skeleton variant="card" />
      </div>
    );
  }

  // Revenue is the owner's alone; admins see the other three.
  const stats = [
    { value: formatCount(overview.memberCount), label: "Members", delta: `+${overview.memberDelta} this month` },
    showRevenue
      ? {
          value: `$${overview.monthlyRevenue.toLocaleString("en-GB")}`,
          label: "Monthly revenue",
          delta: `+${overview.revenueDeltaPercent}%`,
        }
      : null,
    {
      value: `${overview.engagementPercent}%`,
      label: "Engagement",
      delta: `${formatCount(overview.activeMembers)} active`,
    },
    {
      value: `${overview.retentionPercent}%`,
      label: "Retention",
      delta: `${overview.cancellingCount} members cancelling`,
    },
  ].filter(Boolean);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <div>
          <h2>Overview</h2>
          <p className="text-meta text-sand-700">Last 30 days</p>
        </div>
        <Button variant="secondary" className="ml-auto">
          Share invite link
        </Button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
        <SignupsChart
          points={growth.points}
          interval={growth.interval}
          onIntervalChange={changeInterval}
          loading={loadingGrowth}
        />
        {showRevenue ? <SourcesCard sources={sources.sources} referral={sources.referral} /> : (
          <SourcesCard sources={sources.sources} />
        )}
      </div>
    </>
  );
}
