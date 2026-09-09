"use client";

import { useRef, useState, useEffect } from "react";
import { X, Settings, Image, Loader2 } from "lucide-react";
import { useGroupStore } from "@/store/useGroupStore";
import { RadioCard, Select } from "@/components/ui";
import { updateCourse } from "@/lib/api";

export default function CourseSettingsModal({ open, onClose, course, onSaved }) {
  const { tiers } = useGroupStore();

  // Form state
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");
  const [coverPreview, setCoverPreview] = useState(course?.coverUrl || null);
  const [coverFile, setCoverFile] = useState(null);
  const [accessType, setAccessType] = useState(course?.accessType || "OPEN"); 
  const [requiredTierId, setRequiredTierId] = useState(course?.requiredTierId || "");
  const [isPublished, setIsPublished] = useState(course?.isPublished || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const coverRef = useRef(null);

  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setDescription(course.description || "");
      setCoverPreview(course.coverUrl || null);
      setAccessType(course.accessType || "OPEN");
      setRequiredTierId(course.requiredTierId || "");
      setIsPublished(course.isPublished || false);
    }
  }, [course]);

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
    if (accessType === "TIER_LOCKED" && !requiredTierId) { setError("Please select a required tier."); return; }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const updated = await updateCourse(course.id, {
        title: title.trim(),
        description: description.trim(),
        coverUrl: coverPreview,
        accessType,
        requiredTierId: accessType === "TIER_LOCKED" ? requiredTierId : null,
        isPublished,
      });
      
      onSaved?.(updated);
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !course) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-ink/45 overflow-y-auto p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="rise w-full max-w-[640px] my-auto bg-surface rounded-overlay shadow-lg flex flex-col max-h-[calc(100dvh-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0 shrink-0">
          <div>
            <h2 className="text-[22px]">Course settings</h2>
            <p className="text-sm text-sand-600 mt-0.5">Update details, access rules, and publishing status.</p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-icon btn-ghost -mr-2 -mt-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {error && (
            <p role="alert" className="text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">{error}</p>
          )}

          {/* Publishing */}
          <div className="bg-sand-100 rounded-inner p-4 border border-divider flex items-center justify-between">
            <div>
              <h4 className="text-ink font-bold">Publish course</h4>
              <p className="text-sm text-sand-700">Make this course visible to authorized members.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              <div className="w-11 h-6 bg-sand-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>

          {/* Title & Description */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="field-label">Course title <span className="text-alert">*</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" />
            </div>
          </div>

          {/* Access Control */}
          <fieldset>
            <legend className="field-label mb-2">Access rules</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <RadioCard name="accessType" value="OPEN" label="Everyone" description="All group members." checked={accessType === "OPEN"} onChange={setAccessType} />
              <RadioCard name="accessType" value="TIER_LOCKED" label="Tier locked" description="Members on a specific tier." checked={accessType === "TIER_LOCKED"} onChange={setAccessType} />
              <RadioCard name="accessType" value="PRIVATE_GRANT" label="Private" description="Manual invite only." checked={accessType === "PRIVATE_GRANT"} onChange={setAccessType} />
            </div>
          </fieldset>

          {/* Required Tier Picker */}
          {accessType === "TIER_LOCKED" && (
            <div className="-mt-2">
              <Select label="Required tier" value={requiredTierId} onChange={setRequiredTierId} options={[{ value: "", label: "Pick a tier" }, ...tiers.map((t) => ({ value: t.id, label: t.name }))]} />
            </div>
          )}

          {/* Cover image */}
          <div>
            <label className="field-label mb-2">Cover image</label>
            <div onClick={() => coverRef.current?.click()} className="relative h-36 rounded-inner border-2 border-dashed border-divider bg-sand-100 flex flex-col items-center justify-center cursor-pointer hover:border-sand-400 transition-colors overflow-hidden">
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
                </>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 shrink-0 border-t border-divider flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={!title.trim() || isSubmitting} onClick={handleSubmit} className="btn btn-primary disabled:opacity-40 gap-2">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Settings className="w-4 h-4" /> Save settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}
