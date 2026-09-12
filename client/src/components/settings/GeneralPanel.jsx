"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { updateGroup } from "@/lib/api";
import { Button, Checkbox, Input, RadioCard, Textarea } from "@/components/ui";
import Panel from "./Panel";

import { useRef } from "react";
import { uploadImage } from "@/lib/api";

import { useRouter } from "next/navigation";

export default function GeneralPanel({ group, onSaved }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(group.iconUrl);
  const iconRef = useRef(null);

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(group.coverUrl);
  const coverRef = useRef(null);

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

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const submit = async (values) => {
    try {
      // 1. Upload images if changed
      let newIconUrl = undefined;
      if (iconFile) {
        newIconUrl = await uploadImage(iconFile, "community-icons");
      }

      let newCoverUrl = undefined;
      if (coverFile) {
        newCoverUrl = await uploadImage(coverFile, "community-covers");
      }

      // 2. Save group
      const updated = await updateGroup(group.slug, {
        name: values.name,
        description: values.description,
        slug: values.slug,
        visibility: values.visibility,
        joinApproval: values.autoApprove ? "AUTOMATIC" : "MANUAL",
        autoWelcomeMessage: values.sendWelcome ? values.autoWelcomeMessage : null,
        ...(newIconUrl && { iconUrl: newIconUrl }),
        ...(newCoverUrl && { coverUrl: newCoverUrl }),
      });
      
      if (updated.slug !== group.slug) {
        // Force navigation to new slug
        router.push(`/${updated.slug}/settings/general`);
        return;
      }

      onSaved?.(updated);
      setSaved(true);
    } catch (err) {
      alert(err.message);
    }
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
            {iconPreview ? (
              <img src={iconPreview} alt="Icon" className="w-[104px] h-[104px] rounded-full object-cover" />
            ) : (
              <span
                aria-hidden="true"
                className="w-[104px] h-[104px] rounded-full bg-brand text-ground grid place-items-center font-display font-extrabold text-[34px]"
              >
                {group.name.slice(0, 1)}
              </span>
            )}
            <input type="file" ref={iconRef} hidden accept="image/*" onChange={handleIconChange} />
            <Button variant="secondary" onClick={() => iconRef.current?.click()} type="button">Change</Button>
          </div>
        </div>

        <div className="flex-1 min-w-[260px]">
          <p className="field-label">Cover</p>
          <div className="flex items-center gap-3">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="flex-1 aspect-[1084/300] rounded-inner object-cover" />
            ) : (
              <span
                aria-hidden="true"
                className="flex-1 aspect-[1084/300] rounded-inner bg-brand-300"
                style={{ filter: "saturate(.85) contrast(.95)" }}
              />
            )}
            <input type="file" ref={coverRef} hidden accept="image/*" onChange={handleCoverChange} />
            <Button variant="secondary" onClick={() => coverRef.current?.click()} type="button">Change</Button>
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
