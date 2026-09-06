"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { WEEKDAY_NAMES } from "@/lib/calendar";
import { Button, Dialog, Input, RadioCard, Select, Textarea } from "@/components/ui";

const WHERE = [
  { value: "ONLINE_LINK", label: "Online link" },
  { value: "PHYSICAL_ADDRESS", label: "Physical address" },
  { value: "RECORDED_SESSION", label: "Recorded session" },
];

const WEEKDAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function defaultsFor(event) {
  if (!event) {
    return {
      title: "",
      date: "",
      time: "18:00",
      duration: "60",
      description: "",
      locationType: "ONLINE_LINK",
      locationValue: "",
      repeats: "none",
      accessType: "ALL_MEMBERS",
      requiredTierId: "",
    };
  }
  const start = new Date(event.startDate);
  const minutes = event.endDate ? Math.round((new Date(event.endDate) - start) / 60000) : 60;
  return {
    title: event.title,
    date: start.toISOString().slice(0, 10),
    time: start.toISOString().slice(11, 16),
    duration: String(minutes),
    description: event.description ?? "",
    locationType: event.locationType ?? "ONLINE_LINK",
    locationValue: event.locationUrl ?? event.locationAddress ?? "",
    repeats: event.isRecurring ? "weekly" : "none",
    accessType: event.accessType ?? "ALL_MEMBERS",
    requiredTierId: event.requiredTierId ?? "",
  };
}

export default function EventDialog({ open, event, tiers = [], timeZone, onSubmit, onClose }) {
  const editing = !!event;
  const [formError, setFormError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultsFor(event) });

  const accessType = useWatch({ control, name: "accessType" });
  const date = useWatch({ control, name: "date" });
  const locationType = useWatch({ control, name: "locationType" });

  // "Weekly on Thursday" follows whatever day the chosen date falls on.
  const weekdayCode = date ? WEEKDAY_CODES[new Date(`${date}T12:00:00Z`).getUTCDay()] : null;
  const weeklyLabel = weekdayCode ? `Weekly on ${WEEKDAY_NAMES[weekdayCode]}` : "Weekly";

  const submit = async (values) => {
    setFormError(null);
    if (values.accessType === "TIER_LOCKED" && !values.requiredTierId) {
      setFormError("Pick the tier this event is for.");
      return;
    }

    const start = new Date(`${values.date}T${values.time}:00Z`);
    const end = new Date(start.getTime() + Number(values.duration) * 60000);

    try {
      await onSubmit?.({
        title: values.title,
        description: values.description || null,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        timezone: timeZone,
        locationType: values.locationType,
        locationUrl: values.locationType === "ONLINE_LINK" ? values.locationValue || null : null,
        locationAddress: values.locationType === "PHYSICAL_ADDRESS" ? values.locationValue || null : null,
        accessType: values.accessType,
        requiredTierId: values.accessType === "TIER_LOCKED" ? values.requiredTierId : null,
        isRecurring: values.repeats === "weekly",
        recurrenceRule: values.repeats === "weekly" ? `FREQ=WEEKLY;BYDAY=${weekdayCode}` : null,
      });
      onClose?.();
    } catch (error) {
      setFormError(error?.message ?? "Could not save that event.");
    }
  };

  if (!open) return null;

  return (
    <Dialog open onClose={onClose} width={700} title={editing ? "Edit event" : "New event"} className="p-8">
      <form onSubmit={handleSubmit(submit)} noValidate className="mt-5 flex flex-col gap-4">
        {formError ? (
          <p role="alert" className="text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">
            {formError}
          </p>
        ) : null}

        <Input
          label="Title"
          error={errors.title?.message}
          {...register("title", {
            required: "Give the event a title.",
            minLength: { value: 2, message: "Titles are at least 2 characters." },
          })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Date" type="date" error={errors.date?.message} {...register("date", { required: "Pick a date." })} />
          <Input label="Time" type="time" error={errors.time?.message} {...register("time", { required: "Pick a time." })} />
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <Select
                label="Duration"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "30", label: "30 minutes" },
                  { value: "60", label: "1 hour" },
                  { value: "90", label: "1.5 hours" },
                  { value: "120", label: "2 hours" },
                ]}
              />
            )}
          />
        </div>

        <Textarea label="Description" rows={4} {...register("description")} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="locationType"
            control={control}
            render={({ field }) => (
              <Select label="Where" value={field.value} onChange={field.onChange} options={WHERE} />
            )}
          />
          <Controller
            name="repeats"
            control={control}
            render={({ field }) => (
              <Select
                label="Repeats"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "none", label: "Does not repeat" },
                  { value: "weekly", label: weeklyLabel },
                ]}
              />
            )}
          />
        </div>

        <Input
          label={locationType === "PHYSICAL_ADDRESS" ? "Address" : "Link"}
          {...register("locationValue")}
        />

        <fieldset>
          <legend className="field-label">Access</legend>
          <Controller
            name="accessType"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RadioCard
                  name="accessType"
                  value="ALL_MEMBERS"
                  label="All members"
                  description="Everyone in the group can RSVP."
                  checked={field.value === "ALL_MEMBERS"}
                  onChange={field.onChange}
                />
                <RadioCard
                  name="accessType"
                  value="TIER_LOCKED"
                  label="One tier only"
                  description="Only members on the tier you pick."
                  checked={field.value === "TIER_LOCKED"}
                  onChange={field.onChange}
                />
              </div>
            )}
          />
        </fieldset>

        {accessType === "TIER_LOCKED" ? (
          <Controller
            name="requiredTierId"
            control={control}
            render={({ field }) => (
              <Select
                label="Tier"
                value={field.value}
                onChange={field.onChange}
                options={[{ value: "", label: "Pick a tier" }, ...tiers.map((t) => ({ value: t.id, label: t.name }))]}
              />
            )}
          />
        ) : null}

        <div className="mt-2 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {editing ? "Save event" : "Create event"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
