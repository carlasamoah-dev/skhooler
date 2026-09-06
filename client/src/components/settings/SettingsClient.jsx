"use client";

import { useCallback, useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { fetchSettings } from "@/lib/api";
import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";
import { EmptyState, Skeleton } from "@/components/ui";
import CategoriesPanel from "./CategoriesPanel";
import GeneralPanel from "./GeneralPanel";
import InvitesPanel from "./InvitesPanel";
import JoinQuestionsPanel from "./JoinQuestionsPanel";
import NotificationsPanel from "./NotificationsPanel";
import PricingPanel from "./PricingPanel";
import SettingsRail, { TABS } from "./SettingsRail";

export default function SettingsClient({ tab }) {
  const can = useCan();
  const slug = useGroupStore((s) => s.slug);
  const [data, setData] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  // A settings write can change what the shell and the feed show — the group
  // name, the category order — so refresh the group context alongside.
  const reload = useCallback(() => {
    setReloadToken((t) => t + 1);
    useGroupStore.getState().hydrate(slug, { force: true });
  }, [slug]);
  const mayEdit = can("group:settings");

  useEffect(() => {
    if (!slug || !mayEdit) return undefined;
    let cancelled = false;
    fetchSettings(slug).then((d) => !cancelled && setData(d));
    return () => {
      cancelled = true;
    };
  }, [slug, mayEdit, reloadToken]);

  // Every panel here is the owner's.
  if (!mayEdit) {
    return (
      <EmptyState
        icon={Lock}
        title="Settings are for the group owner"
        body="Ask the owner if something here needs changing."
      />
    );
  }

  const active = TABS.some((t) => t.value === tab) ? tab : "general";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-5">
      <SettingsRail tab={active} slug={slug} />

      <div className="min-w-0 flex flex-col gap-4">
        {!data ? (
          <Skeleton variant="card" className="h-[420px]" />
        ) : active === "general" ? (
          <GeneralPanel group={data.group} onSaved={reload} />
        ) : active === "pricing" ? (
          <PricingPanel group={data.group} tiers={data.tiers} onTiers={reload} onSaved={reload} />
        ) : active === "categories" ? (
          <CategoriesPanel
            key={data.categories.map((c) => c.id).join()}
            categories={data.categories}
            onCategories={reload}
          />
        ) : active === "questions" ? (
          <JoinQuestionsPanel questions={data.questions} onSaved={reload} />
        ) : active === "notifications" ? (
          <NotificationsPanel preferences={data.preferences} onSaved={reload} />
        ) : (
          <InvitesPanel invites={data.invites} onInvites={reload} />
        )}
      </div>
    </div>
  );
}
