"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { updateGroup } from "@/lib/api";
import { Button, Checkbox, Input, RadioCard, Textarea } from "@/components/ui";
import Panel from "./Panel";

export default function GeneralPanel({ group, onSaved }) {
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: group.name,
      description: group.description ?? "",
      slug: group.slug,
      visibility: group.visibility,
      autoApprove: group.joinApproval === "AUTOMATIC",
      sendWelcome: !!group.autoWelcomeMessage,
      autoWelcomeMessage: group.autoWelcomeMessage ?? "",
    },
  });

  const sendWelcome = useWatch({ control, name: "sendWelcome" });

  const submit = async (values) => {
    const updated = await updateGroup({
      name: values.name,
      description: values.description,
      slug: values.slug,
      visibility: values.visibility,
      joinApproval: values.autoApprove ? "AUTOMATIC" : "MANUAL",
      autoWelcomeMessage: values.sendWelcome ? values.autoWelcomeMessage : null,
    });
    onSaved?.(updated);
    setSaved(true);
  };

  return (
    <Panel
      title="General"
      onSubmit={handleSubmit(submit)}
      action={
        <Button type="submit" loading={isSubmitting}>
          {saved ? "Saved" : "Save changes"}
        </Button>
      }
    >
      <div className="flex flex-wrap gap-8">
        <div>
          <p className="field-label">Icon</p>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="w-[104px] h-[104px] rounded-full bg-brand text-ground grid place-items-center font-display font-extrabold text-[34px]"
            >
              {group.name.slice(0, 1)}
            </span>
            <Button variant="secondary">Change</Button>
          </div>
        </div>

        <div className="flex-1 min-w-[260px]">
          <p className="field-label">Cover</p>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex-1 aspect-[1084/300] rounded-inner bg-brand-300"
              style={{ filter: "saturate(.85) contrast(.95)" }}
            />
            <Button variant="secondary">Change</Button>
          </div>
        </div>
      </div>

      <Input label="Group name" error={errors.name?.message} {...register("name", { required: "Give the group a name." })} />
      <Textarea label="Description" rows={4} {...register("description")} />
      <Input label="Community URL" hint="skhooler.com/your-url" {...register("slug")} />

      <fieldset>
        <legend className="field-label">Visibility</legend>
        <Controller
          name="visibility"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RadioCard
                name="visibility"
                value="PUBLIC"
                label="Public"
                description="Anyone can see the About page and ask to join."
                checked={field.value === "PUBLIC"}
                onChange={field.onChange}
              />
              <RadioCard
                name="visibility"
                value="PRIVATE"
                label="Private"
                description="Only the name and description are shown to strangers."
                checked={field.value === "PRIVATE"}
                onChange={field.onChange}
              />
            </div>
          )}
        />
      </fieldset>

      <Controller
        name="autoApprove"
        control={control}
        render={({ field }) => (
          <Checkbox
            wrapped
            label="Approve requests automatically"
            checked={!!field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        name="sendWelcome"
        control={control}
        render={({ field }) => (
          <Checkbox wrapped label="Send a welcome message" checked={!!field.value} onChange={field.onChange} />
        )}
      />

      {sendWelcome ? (
        <Textarea label="Welcome message" rows={3} {...register("autoWelcomeMessage")} />
      ) : null}
    </Panel>
  );
}
