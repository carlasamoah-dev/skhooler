"use client";

import { useEffect, useState } from "react";

import { cancelEvent, createEvent, fetchEvents, fetchEventsForMonth, rsvpEvent, updateEvent } from "@/lib/api";
import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";
import { useUiStore } from "@/store/useUiStore";
import { Button, Skeleton } from "@/components/ui";
import EventDialog from "./EventDialog";
import EventFilter from "./EventFilter";
import EventList from "./EventList";
import MonthGrid from "./MonthGrid";

const TIME_ZONE = "Europe/London";

export default function CalendarClient() {
  const can = useCan();
  const { tiers, membership } = useGroupStore();
  const { eventDialog, openEventDialog, closeEventDialog } = useUiStore();

  const [filter, setFilter] = useState("upcoming");
  const [listed, setListed] = useState(null);
  const [monthEvents, setMonthEvents] = useState([]);
  const [error, setError] = useState(null);

  // The clock is read once so the grid's "today" and the upcoming filter agree.
  const [today] = useState(() => new Date());
  const mayManage = can("event:create");

  // Bumped after a write so the effect below refetches.
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchEvents({ filter }), fetchEventsForMonth()]).then(([list, month]) => {
      if (cancelled) return;
      setListed(list.items);
      setMonthEvents(month.items);
    });
    return () => {
      cancelled = true;
    };
  }, [filter, reloadToken]);

  const onRsvp = async (event, status) => {
    const before = { myRsvp: event.myRsvp, attendeeCount: event.attendeeCount };
    const optimistic = {
      myRsvp: status,
      attendeeCount:
        event.attendeeCount +
        (status === "GOING" && before.myRsvp !== "GOING" ? 1 : before.myRsvp === "GOING" && status !== "GOING" ? -1 : 0),
    };

    const apply = (patch) =>
      setListed((items) => items.map((e) => (e.id === event.id ? { ...e, ...patch } : e)));

    setError(null);
    apply(optimistic);
    try {
      apply(await rsvpEvent(event.id, status));
    } catch (e) {
      apply(before);
      setError(e?.message ?? "Could not save your RSVP.");
    }
  };

  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(today);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <div>
          <h2>{monthLabel}</h2>
          <p className="text-meta text-sand-700">
            {`London time · ${monthEvents.length} event${monthEvents.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <EventFilter value={filter} onChange={setFilter} />
          {mayManage ? <Button onClick={() => openEventDialog(null)}>Add event</Button> : null}
        </div>
      </div>

      {error ? (
        <p role="alert" className="mb-4 text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">
          {error}
        </p>
      ) : null}

      <MonthGrid
        month={today}
        events={monthEvents}
        timeZone={TIME_ZONE}
        today={today}
        onSelectEvent={mayManage ? (event) => openEventDialog(event.id) : undefined}
      />

      <div className="mt-4">
        {listed === null ? (
          <div className="flex flex-col gap-4">
            <Skeleton variant="row" count={3} />
          </div>
        ) : (
          <EventList
            events={listed}
            tiers={tiers}
            myTierId={membership?.tier?.id ?? membership?.tier ?? null}
            canRsvpAll={mayManage}
            onRsvp={onRsvp}
            filter={filter}
          />
        )}
      </div>

      {eventDialog.open ? (
        <EventDialog
          open
          event={monthEvents.find((e) => e.id === eventDialog.eventId) ?? null}
          tiers={tiers}
          timeZone={TIME_ZONE}
          onClose={closeEventDialog}
          onSubmit={async (payload) => {
            if (eventDialog.eventId) await updateEvent(eventDialog.eventId, payload);
            else await createEvent(payload);
            setReloadToken((t) => t + 1);
          }}
        />
      ) : null}
    </>
  );
}
