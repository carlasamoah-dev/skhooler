"use client";

import { useRef, useState, useEffect } from "react";
import { X, Save, Video, FileText, Upload, Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button, Input } from "@/components/ui";

/** Simple chip for showing attached files */
function FileChip({ file, onRemove }) {
  const ext = file.name ? file.name.split(".").pop().toLowerCase() : "";
  const isVideo = ["mp4", "mov", "avi", "webm"].includes(ext);
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
  const Icon = isVideo ? Video : isImage ? ImageIcon : FileText;

  return (
    <div className="flex items-center gap-2 bg-sand-100 border border-divider rounded-lg px-3 py-1.5 text-[13px] text-ink">
      <Icon className="w-3.5 h-3.5 text-sand-600 shrink-0" />
      <span className="truncate max-w-[160px]">{file.name}</span>
      <button type="button" onClick={onRemove} className="ml-1 text-sand-500 hover:text-ink transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function LessonEditorModal({ open, onClose, lesson, onSaved, slug }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [attachments, setAttachments] = useState([]); // mix of File objects and {name,url,size,type} stored objects
  const [chapters, setChapters] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // "" | "uploading-video" | "uploading-attachments" | "saving"
  const [error, setError] = useState(null);
  
  const attachRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || "");
      setContent(lesson.content || "");
      setVideoUrl(lesson.videoUrl || "");
      setVideoFile(null);
      setVideoPreview(null);
      setTranscript(lesson.transcript || "");
      setAttachments(lesson.attachments || []);
      setChapters(
        (lesson.chapters || []).map((c) => ({
          // Backend stores { title, startSeconds }, editor uses { timestamp, title }
          timestamp: c.startSeconds !== undefined ? secondsToTimestamp(c.startSeconds) : (c.timestamp || "00:00"),
          title: c.title || c.label || "",
        }))
      );
      setIsPublished(lesson.isPublished || false);
      setIsFreePreview(lesson.isFreePreview || false);
      setError(null);
    }
  }, [lesson]);

  /** Convert "MM:SS" or "HH:MM:SS" string to integer seconds */
  function timestampToSeconds(ts) {
    const parts = ts.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  }

  /** Convert integer seconds to "MM:SS" */
  function secondsToTimestamp(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  const handleAttachments = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files].slice(0, 20));
    e.target.value = "";
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoUrl(""); // Clear the link if they choose to upload instead
    e.target.value = "";
  };

  const removeVideoFile = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const addChapter = () => {
    setChapters([...chapters, { timestamp: "00:00", title: "" }]);
  };

  const updateChapter = (index, field, value) => {
    const newChapters = [...chapters];
    newChapters[index][field] = value;
    setChapters(newChapters);
  };

  const removeChapter = (index) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const { uploadImage, updateLesson } = await import("@/lib/api");

      // 1. Upload video file if one was selected
      let finalVideoUrl = videoUrl.trim() || null;
      if (videoFile) {
        setSaveStatus("uploading-video");
        finalVideoUrl = await uploadImage(videoFile, "lesson-attachments");
      }

      // 2. Upload any new attachment files (File objects), keep existing stored ones
      setSaveStatus("uploading-attachments");
      const finalAttachments = await Promise.all(
        attachments.map(async (item) => {
          if (item instanceof File) {
            const url = await uploadImage(item, "lesson-attachments");
            return { name: item.name, url, size: item.size, type: item.type };
          }
          // Already a stored attachment object { name, url, size, type }
          return item;
        })
      );

      // 3. Save lesson to backend
      setSaveStatus("saving");
      const payload = {
        title: title.trim(),
        content: content.trim() || null,
        videoUrl: finalVideoUrl,
        transcript: transcript.trim() || null,
        chapters: chapters
          .filter((c) => c.title.trim() !== "")
          .map((c) => ({ title: c.title.trim(), startSeconds: timestampToSeconds(c.timestamp) })),
        attachments: finalAttachments,
        isPublished,
        isFreePreview,
      };

      const updatedLesson = await updateLesson(slug, lesson.id, payload);
      onSaved?.(updatedLesson);
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to save lesson.");
    } finally {
      setIsSaving(false);
      setSaveStatus("");
    }
  };


  if (!open || !lesson) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-ink/45 overflow-y-auto p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="rise w-full max-w-[800px] my-auto bg-surface rounded-overlay shadow-lg flex flex-col max-h-[calc(100dvh-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0 border-b border-divider">
          <div>
            <h2 className="text-[22px]">Edit Lesson</h2>
            <p className="text-sm text-sand-600 mt-0.5">Add rich content, videos, and attachments to this lesson.</p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-icon btn-ghost -mr-2 -mt-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form id="lesson-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">
          
          {error && (
            <p role="alert" className="text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">{error}</p>
          )}

          {/* Basics */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-ink">Basics</h3>
            <Input 
              label="Lesson title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />

            {/* Publish toggles */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                  <div className="w-10 h-5 bg-sand-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                </div>
                <span className="text-ui font-medium text-ink">Published</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={isFreePreview} onChange={(e) => setIsFreePreview(e.target.checked)} />
                  <div className="w-10 h-5 bg-sand-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sage"></div>
                </div>
                <span className="text-ui font-medium text-ink">Free preview</span>
                <span className="text-meta text-sand-600">(non-members can view)</span>
              </label>
            </div>
            
            <div>
              <label className="field-label mb-1.5">Rich Text Content</label>
              <p className="text-xs text-sand-600 mb-2">Supports markdown for text formatting, links, and code snippets.</p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="input font-mono text-[13px]"
                placeholder="Write lesson content here..."
              />
            </div>
          </div>

          {/* Video & Transcript */}
          <div className="flex flex-col gap-4 pt-6 border-t border-divider">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-5 h-5 text-ink" />
              <h3 className="text-lg font-bold text-ink">Video</h3>
            </div>
            
            <div className="bg-sand-100 border border-divider rounded-inner p-4">
              <label className="field-label mb-3">Primary Video</label>
              
              {videoPreview ? (
                <div className="flex items-center gap-4 bg-surface border border-divider rounded-lg p-3">
                  <div className="w-16 h-10 bg-black rounded flex items-center justify-center">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-ink truncate">{videoFile?.name || "Uploaded video"}</p>
                    <p className="text-[12px] text-brand font-medium">Ready to upload</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={removeVideoFile} className="text-alert">Remove</Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input type="file" accept="video/*" className="hidden" ref={videoRef} onChange={handleVideoUpload} />
                  <Button type="button" variant="secondary" icon={Upload} onClick={() => videoRef.current?.click()}>
                    Upload file
                  </Button>
                  <span className="text-sm text-sand-500 font-medium">OR</span>
                  <div className="flex-1 w-full">
                    <Input 
                      placeholder="Paste YouTube or Vimeo link"
                      value={videoUrl} 
                      onChange={(e) => setVideoUrl(e.target.value)} 
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="field-label mb-1.5">Written Transcript</label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                className="input text-sm"
                placeholder="Paste the full video transcript here..."
              />
            </div>

            {/* Chapters */}
            <div className="mt-2">
              <label className="field-label mb-2">Video Chapters</label>
              {chapters.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {chapters.map((chap, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input 
                        placeholder="00:00" 
                        value={chap.timestamp} 
                        onChange={(e) => updateChapter(idx, 'timestamp', e.target.value)}
                        className="w-24 font-mono text-center" 
                      />
                      <Input 
                        placeholder="Chapter title" 
                        value={chap.title} 
                        onChange={(e) => updateChapter(idx, 'title', e.target.value)}
                        className="flex-1" 
                      />
                      <button type="button" onClick={() => removeChapter(idx)} className="btn btn-icon btn-ghost text-alert shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button type="button" variant="secondary" size="sm" onClick={addChapter} icon={Plus}>Add chapter</Button>
            </div>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4 pt-6 border-t border-divider">
            <div>
              <h3 className="text-lg font-bold text-ink mb-1">Downloadable Resources</h3>
              <p className="text-[13px] text-sand-600 mb-4">
                Attach PDFs, Word docs, images, or any files students need for this lesson.
              </p>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachments.map((file, idx) => (
                    <FileChip key={idx} file={file} onRemove={() => removeAttachment(idx)} />
                  ))}
                </div>
              )}

              <input
                type="file"
                multiple
                accept="*/*"
                className="hidden"
                ref={attachRef}
                onChange={handleAttachments}
              />

              <Button
                type="button"
                variant="secondary"
                onClick={() => attachRef.current?.click()}
                disabled={attachments.length >= 20}
                icon={Upload}
              >
                {attachments.length === 0 ? "Upload files" : `Add more files (${attachments.length}/20)`}
              </Button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0 border-t border-divider flex items-center justify-end gap-3 bg-sand-100 rounded-b-overlay">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" form="lesson-form" disabled={!title.trim() || isSaving} icon={isSaving ? undefined : Save}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                {saveStatus === "uploading-video" ? "Uploading video..." :
                 saveStatus === "uploading-attachments" ? "Uploading files..." :
                 "Saving..."}
              </>
            ) : "Save Lesson"}
          </Button>
        </div>
      </div>
    </div>
  );
}
