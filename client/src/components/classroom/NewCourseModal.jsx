"use client";

import { useRef, useState } from "react";
import { X, BookOpen, Image, Loader2 } from "lucide-react";
import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";
import { RadioCard, Select } from "@/components/ui";
import { createCourse } from "@/lib/api";

export default function NewCourseModal({ open, onClose, onCreated, slug }) {
  const can = useCan();
  const { tiers } = useGroupStore();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [accessType, setAccessType] = useState("OPEN"); // OPEN | TIER_LOCKED | PRIVATE_GRANT
  const [requiredTierId, setRequiredTierId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); // "" | "uploading" | "creating"
  const [error, setError] = useState(null);

  const coverRef = useRef(null);

  const handleCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Give the course a title."); return; }
    if (!coverFile && !coverPreview) { setError("Please upload a cover image."); return; }
    if (accessType === "TIER_LOCKED" && !requiredTierId) { setError("Please select a required tier."); return; }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // 1. Upload cover image to Supabase Storage
      let coverUrl = null;
      if (coverFile) {
        setUploadStatus("uploading");
        const { uploadImage } = await import("@/lib/api");
        coverUrl = await uploadImage(coverFile, "course-covers");
      }
      
      // 2. Create the course with the real storage URL
      setUploadStatus("creating");
      const newCourse = await createCourse(slug, {
        title: title.trim(),
        description: description.trim() || null,
        coverUrl,
        accessType,
        requiredTierId: accessType === "TIER_LOCKED" ? requiredTierId : null,
      });
      
      onCreated?.(newCourse);
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to create course.");
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };


  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCoverPreview(null);
    setCoverFile(null);
    setAccessType("OPEN");
    setRequiredTierId("");
    setError(null);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-ink/45 overflow-y-auto p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="rise w-full max-w-[640px] my-auto bg-surface rounded-overlay shadow-lg flex flex-col max-h-[calc(100dvh-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0 shrink-0">
          <div>
            <h2 className="text-[22px]">New course</h2>
            <p className="text-sm text-sand-600 mt-0.5">Set up your course details and access permissions.</p>
          </div>
          <button type="button" onClick={handleClose} className="btn btn-icon btn-ghost -mr-2 -mt-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {error && (
            <p role="alert" className="text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">{error}</p>
          )}

          {/* Title & Description */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="field-label">Course title <span className="text-alert">*</span></label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Land Your First Remote Job"
                className="input"
              />
            </div>

            <div>
              <label className="field-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn? Who is it for?"
                rows={3}
                className="input"
              />
            </div>
          </div>

          {/* Access Control */}
          <fieldset>
            <legend className="field-label mb-2">Access rules</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioCard
                name="accessType"
                value="OPEN"
                label="Everyone"
                description="All group members."
                checked={accessType === "OPEN"}
                onChange={setAccessType}
              />
              <RadioCard
                name="accessType"
                value="TIER_LOCKED"
                label="Tier locked"
                description="Members on a specific tier."
                checked={accessType === "TIER_LOCKED"}
                onChange={setAccessType}
              />
              <RadioCard
                name="accessType"
                value="PRIVATE_GRANT"
                label="Private"
                description="Manual invite only."
                checked={accessType === "PRIVATE_GRANT"}
                onChange={setAccessType}
              />
            </div>
          </fieldset>

          {/* Required Tier Picker */}
          {accessType === "TIER_LOCKED" && (
            <div className="-mt-2">
              <Select
                label="Required tier"
                value={requiredTierId}
                onChange={setRequiredTierId}
                options={[{ value: "", label: "Pick a tier" }, ...tiers.map((t) => ({ value: t.id, label: t.name }))]}
              />
            </div>
          )}

          {/* Cover image */}
          <div>
            <label className="field-label mb-2">Cover image</label>
            <div
              onClick={() => coverRef.current?.click()}
              className="relative h-36 rounded-inner border-2 border-dashed border-divider bg-sand-100 flex flex-col items-center justify-center cursor-pointer hover:border-sand-400 transition-colors overflow-hidden"
            >
              <input type="file" accept="image/*" className="hidden" ref={coverRef} onChange={handleCover} />
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="" className="w-full h-full object-cover absolute inset-0" />
                  <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
                    <span className="text-ground text-sm font-semibold">Click to change</span>
                  </div>
                </>
              ) : (
                <>
                  <Image className="w-7 h-7 text-sand-400 mb-1.5" />
                  <span className="text-sm text-sand-600">Click to upload a cover image</span>
                  <span className="text-xs text-sand-500 mt-1">16:9 ratio recommended</span>
                </>
              )}
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 shrink-0 border-t border-divider flex items-center justify-end gap-3">
          <button type="button" onClick={handleClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            onClick={handleSubmit}
            className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed gap-2"
          >
          {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploadStatus === "uploading" ? "Uploading image..." : "Creating course..."}
              </>
            ) : (
              <><BookOpen className="w-4 h-4" /> Create course</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
