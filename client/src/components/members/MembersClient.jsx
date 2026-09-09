"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCheck } from "lucide-react";

import {
  approveJoinRequest,
  declineJoinRequest,
  fetchCourses,
  fetchGeography,
  fetchJoinRequests,
  fetchMembers,
} from "@/lib/api";
import { formatCount } from "@/lib/format";
import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";
import { useUiStore } from "@/store/useUiStore";
import { Card, EmptyState, Skeleton } from "@/components/ui";
import JoinRequestCard from "./JoinRequestCard";
import MemberRoster from "./MemberRoster";
import MemberTabs, { TABS } from "./MemberTabs";
import MembershipDialog from "./MembershipDialog";
import TopCountriesCard from "./TopCountriesCard";

// The map pulls in the topology and a projection, neither of which can run on
// the server, so it loads only when its tab is opened.
const MemberMap = dynamic(() => import("./MemberMap"), {
  ssr: false,
  loading: () => <div className="w-full h-[440px] rounded-inner bg-sand-100 animate-pulse" aria-hidden="true" />,
});

export default function MembersClient() {
  const can = useCan();
  const router = useRouter();
  const params = useSearchParams();
  const { slug, tiers } = useGroupStore();
  const { memberDialog, openMemberDialog, closeMemberDialog } = useUiStore();

  const urlTab = params.get("tab");
  const roleParam = params.get("role");
  const tab = TABS.some((t) => t.value === urlTab) ? urlTab : roleParam || "all";

  const [roster, setRoster] = useState(null);
  const [requests, setRequests] = useState([]);
  const [geography, setGeography] = useState(null);
  const [courses, setCourses] = useState([]);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  const mayApprove = can("member:approve");

  useEffect(() => {
    let cancelled = false;
    const role = ["admins", "mods", "members"].includes(tab) ? tab : "all";
    fetchMembers({ role }).then((r) => !cancelled && setRoster(r));
    return () => {
      cancelled = true;
    };
  }, [tab, reloadToken]);

  useEffect(() => {
    let cancelled = false;
    fetchCourses().then((c) => !cancelled && setCourses(c));
    if (mayApprove) fetchJoinRequests().then((r) => !cancelled && setRequests(r.items));
    return () => {
      cancelled = true;
    };
  }, [mayApprove, reloadToken]);

  useEffect(() => {
    if (tab !== "map" || geography) return undefined;
    let cancelled = false;
    fetchGeography().then((g) => !cancelled && setGeography(g));
    return () => {
      cancelled = true;
    };
  }, [tab, geography]);

  // Roles filter through ?role=; the two panel tabs use ?tab=.
  const selectTab = (next) => {
    const query = ["admins", "mods", "members"].includes(next)
      ? `?role=${next}`
      : next === "all"
        ? ""
        : `?tab=${next}`;
    router.push(`/${slug}/members${query}`);
  };

  const counts = roster?.counts ?? {};
  const decide = async (requestId, approve) => {
    setRequests((list) => list.filter((r) => r.id !== requestId));
    if (approve) await approveJoinRequest(requestId);
    else await declineJoinRequest(requestId);
    reload();
  };

  const openMember = roster?.items.find((m) => m.id === memberDialog.memberId) ?? null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <div>
          <h2>Members</h2>
          <p className="text-meta text-sand-700">
            {`${formatCount(counts.all ?? 0)} members · ${counts.pendingRequests ?? 0} requests`}
          </p>
        </div>
        {can("member:approve") ? (
          <Link href={`/${slug}/settings/invites`} className="btn btn-primary ml-auto no-underline">
            Invite people
          </Link>
        ) : null}
      </div>

      <MemberTabs value={tab} counts={counts} onChange={selectTab} />

      <div className="mt-5">
        {tab === "map" ? (
          !geography ? (
            <Skeleton variant="card" className="h-[440px]" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-4">
              <Card padding={22} radius="panel" className="p-[22px]">
                <h4>Where your members are</h4>
                <p className="text-meta text-sand-700">
                  {`${Object.keys(geography.countries).length - 1} countries · hover a country for detail`}
                </p>
                <div className="mt-4">
                  <MemberMap geography={geography} />
                </div>
              </Card>
              <TopCountriesCard geography={geography} />
            </div>
          )
        ) : tab === "pending" ? (
          requests.length === 0 ? (
            <EmptyState icon={UserCheck} title="No pending requests" body="New requests will appear here." />
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map((request) => (
                <JoinRequestCard
                  key={request.id}
                  request={request}
                  onApprove={(id) => decide(id, true)}
                  onDecline={(id) => decide(id, false)}
                />
              ))}
            </div>
          )
        ) : (
          <MemberRoster
            members={roster?.items ?? []}
            loading={!roster}
            onOpenMembership={openMemberDialog}
          />
        )}
      </div>

      <MembershipDialog
        key={memberDialog.memberId}
        open={memberDialog.open}
        member={openMember}
        tiers={tiers}
        courses={courses}
        onClose={closeMemberDialog}
        onChanged={reload}
      />
    </>
  );
}
