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

  const initialVideoUrls = group.galleryImages?.filter(url => 
    url.includes("youtube.com") || url.includes("vimeo.com")
  ) || [];
  
  const initialMedia = group.galleryImages?.filter(url => 
    !url.includes("youtube.com") && !url.includes("vimeo.com")
  ) || [];

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState(initialMedia);
  const galleryRef = useRef(null);

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
      requireJoinQuestions: !!group.requireJoinQuestions,
      sendWelcome: !!group.autoWelcomeMessage,
      autoWelcomeMessage: group.autoWelcomeMessage ?? "",
      videoUrls: initialVideoUrls.join("\n"),
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

  const handleAddGalleryFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setGalleryFiles(prev => [...prev, ...files]);
    
    const previews = files.map(f => URL.createObjectURL(f));
    setGalleryPreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveGalleryMedia = (index) => {
    // If it's a new file (Object URL), we need to remove it from galleryFiles too.
    // If it's an existing URL, it just removes it from previews.
    const url = galleryPreviews[index];
    if (url.startsWith("blob:")) {
      // Find the index in galleryFiles. This is tricky because we only have previews.
      // A simpler way is to just keep them synced by length if we append them at the end,
      // but since they might remove existing ones, we need a better mapping or just accept it's a bit lossy.
      // Let's just remove the file at the corresponding offset.
      const existingCount = galleryPreviews.filter(p => !p.startsWith("blob:")).length;
      const fileIndex = index - existingCount;
      if (fileIndex >= 0) {
        setGalleryFiles(prev => prev.filter((_, i) => i !== fileIndex));
      }
    }
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const submit = async (values) => {
    try {
      // 1. Upload images if changed
      const uploadPromises = [];
      
      if (iconFile) uploadPromises.push(uploadImage(iconFile, "community-icons").then(url => ({ type: "icon", url })));
      if (coverFile) uploadPromises.push(uploadImage(coverFile, "community-covers").then(url => ({ type: "cover", url })));
      
      // Upload new gallery files
      galleryFiles.forEach((file, index) => {
        uploadPromises.push(uploadImage(file, "community-covers").then(url => ({ type: "gallery", url, index })));
      });

      const uploadResults = await Promise.all(uploadPromises);

      let newIconUrl = undefined;
      let newCoverUrl = undefined;
      const uploadedGalleryUrls = [];

      uploadResults.forEach(res => {
        if (res.type === "icon") newIconUrl = res.url;
        if (res.type === "cover") newCoverUrl = res.url;
        if (res.type === "gallery") uploadedGalleryUrls.push(res.url);
      });

      // Retain existing gallery URLs that are not blobs
      const existingGalleryUrls = galleryPreviews.filter(p => !p.startsWith("blob:"));
      
      const parsedVideoUrls = values.videoUrls
        .split(/[\n,]+/)
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const finalGalleryImages = [...existingGalleryUrls, ...uploadedGalleryUrls, ...parsedVideoUrls];

      const updated = await updateGroup(group.slug, {
        name: values.name,
        description: values.description,
        slug: values.slug,
        visibility: values.visibility,
        joinApproval: values.autoApprove ? "AUTOMATIC" : "MANUAL",
        requireJoinQuestions: values.requireJoinQuestions,
        autoWelcomeMessage: values.sendWelcome ? values.autoWelcomeMessage : null,
        galleryImages: finalGalleryImages,
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

      <div>
        <p className="field-label">Gallery Media (Images / Videos)</p>
        <div className="flex flex-wrap gap-3 mb-2">
          {galleryPreviews.map((preview, idx) => (
            <div key={idx} className="relative w-24 h-24 rounded-xl border border-divider overflow-hidden group">
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => handleRemoveGalleryMedia(idx)}
                className="absolute top-1 right-1 bg-black/50 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
          <div
            onClick={() => galleryRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-divider rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-sand-400 bg-sand-100 transition-all text-sand-500 hover:text-sand-700"
          >
            <input type="file" accept="image/*,video/*" multiple className="hidden" ref={galleryRef} onChange={handleAddGalleryFiles} />
            <span className="text-xl font-bold mb-1">+</span>
            <span className="text-xs">Add</span>
          </div>
        </div>
        <p className="text-xs text-sand-500">Upload images or short videos.</p>
      </div>

      <Textarea label="Video URLs" rows={3} hint="Paste YouTube or Vimeo URLs (one per line)" {...register("videoUrls")} />


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
        name="requireJoinQuestions"
        control={control}
        render={({ field }) => (
          <Checkbox 
            wrapped 
            label="Join with Questions?" 
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
