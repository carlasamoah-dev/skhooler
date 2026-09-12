"use client";

import { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, Link as LinkIcon, Video, BarChart2, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import { createPost, updatePost, uploadImage } from "@/lib/api";
import { useComposerStore } from "@/store/useComposerStore";
import { useGroupStore } from "@/store/useGroupStore";
import { useFeedStore } from "@/store/useFeedStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Button, Checkbox } from "@/components/ui";

/** Nested Modal for adding a Link into the post body */
function AddLinkModal({ onClose, onAdd }) {
  const [url, setUrl] = useState("");
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[480px] p-6 m-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-zinc-900 mb-6">Add link</h3>
        <div className="relative mb-8">
          <label className="absolute -top-2.5 left-3 px-1 bg-white text-xs font-medium text-zinc-600">Enter a URL</label>
          <input
            autoFocus
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border border-zinc-900 rounded-md h-14 px-4 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <Button onClick={() => { onAdd(url.trim()); onClose(); }} disabled={!url.trim()}>Add Link</Button>
        </div>
      </div>
    </div>
  );
}

/** Nested Modal for adding a Video URL or uploading */
function AddVideoModal({ onClose, onAdd }) {
  const [url, setUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        const publicUrl = await uploadImage(file, "community-covers");
        if (publicUrl) onAdd(publicUrl);
        onClose();
      } catch (err) {
        console.error("Video upload failed", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[480px] p-6 m-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-zinc-900 mb-6">Add video</h3>
        
        <div className="flex items-center border border-zinc-900 rounded-md h-12 px-3 mb-6">
          <LinkIcon className="w-5 h-5 text-zinc-500 mr-2 shrink-0" />
          <input
            autoFocus
            type="url"
            placeholder="YouTube, Loom, Vimeo, or any video URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full text-zinc-900 focus:outline-none"
            disabled={isUploading}
          />
        </div>

        <div 
          className="border border-dashed border-zinc-400 rounded-xl flex flex-col items-center justify-center py-10 mb-8 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept="video/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-zinc-600 text-sm">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="w-6 h-6 text-zinc-500 mb-2 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <p className="text-zinc-600 text-sm">Drag and drop video here</p>
              <button className="text-zinc-500 text-sm underline hover:text-zinc-700">or select file</button>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button className="btn btn-ghost" onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <Button 
            onClick={() => { onAdd(url.trim()); onClose(); }}
            disabled={!url.trim() || isUploading}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Inline Poll Component */
function PollEditor({ question, setQuestion, pollOptions, setPollOptions, onRemove }) {
  const updateOption = (index, val) => {
    const next = [...pollOptions];
    next[index] = val;
    setPollOptions(next);
  };

  return (
    <div className="border border-zinc-200 rounded-lg p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-zinc-900">Poll</h4>
        <button className="text-sm text-zinc-500 hover:text-zinc-700" onClick={onRemove}>Remove</button>
      </div>
      <input
        type="text"
        placeholder="Ask a question…"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full border border-zinc-200 rounded-md h-10 px-3 text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 mb-3"
      />
      <div className="flex flex-col gap-3">
        {pollOptions.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              className="flex-1 border border-zinc-200 rounded-md h-10 px-3 text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
            {pollOptions.length > 2 && (
              <button className="p-2 text-zinc-400 hover:text-alert" onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="mt-4 btn btn-ghost border border-divider" onClick={() => setPollOptions([...pollOptions, ""])}>Add Option</button>
    </div>
  );
}

export default function ComposerModal() {
  const { isOpen, editPost, closeModal } = useComposerStore();
  const { slug, categories, membership } = useGroupStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Attachments & Features
  const [videoUrl, setVideoUrl] = useState(null);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [imageFiles, setImageFiles] = useState([]); // { file, preview }
  const [isEmailBroadcast, setIsEmailBroadcast] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Sub-modal state
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (editPost) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitle(editPost.title || "");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContent(editPost.content || "");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategoryId(editPost.categoryId || "");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVideoUrl(editPost.videoUrl || null);
        if (editPost.poll) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setShowPoll(true);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setPollQuestion(editPost.poll.question || "");
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setPollOptions(editPost.poll.options.map(o => o.text));
        }
      } else if (!categoryId && categories.length > 0) {
        // Pre-select first category if none chosen
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategoryId(categories[0].id);
      }
    } else {
      document.body.style.overflow = "";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategoryId(categories[0]?.id || "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVideoUrl(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPoll(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPollQuestion("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPollOptions(["", ""]);
      setImageFiles([]);
      setIsEmailBroadcast(false);
      setFormError(null);
      setShowEmojiPicker(false);
    }
  }, [isOpen, editPost, categories, categoryId]);

  if (!isOpen) return null;

  const insertEmoji = (emojiData) => {
    const el = textareaRef.current;
    if (!el) { setContent((c) => c + emojiData.emoji); return; }
    const start = el.selectionStart ?? content.length;
    setContent(content.slice(0, start) + emojiData.emoji + content.slice(start));
    setShowEmojiPicker(false);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsUploadingFile(true);
    const previews = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setImageFiles((prev) => [...prev, ...previews]);
    setIsUploadingFile(false);
  };

  const handlePost = async () => {
    if (!title.trim() && !content.trim()) return;
    setIsPosting(true);
    setFormError(null);
    try {
      // 1. Upload images
      let attachments = [];
      for (const { file } of imageFiles) {
        const url = await uploadImage(file, "community-icons");
        if (url) attachments.push({ name: file.name, url, size: file.size, type: file.type });
      }

      // 2. Build poll payload
      let poll = null;
      if (showPoll && pollQuestion.trim() && pollOptions.filter(Boolean).length >= 2) {
        poll = {
          question: pollQuestion.trim(),
          options: pollOptions.filter(Boolean),
          allowMultiple: false,
        };
      }

      const payload = {
        title: title.trim(),
        content: content.trim(),
        categoryId: categoryId || null,
        videoUrl: videoUrl || null,
        attachments: attachments.length > 0 ? attachments : null,
        poll,
        isPinned: false,
        isEmailBroadcast,
      };

      // 3. Create or Update post
      if (editPost) {
        // Strip out email broadcast and poll if editing since backend might not support updating polls
        const { poll: _, isEmailBroadcast: __, ...updatePayload } = payload;
        await updatePost(slug, editPost.id, updatePayload);
      } else {
        await createPost(slug, payload);
      }

      // 4. Refresh the feed from the server
      useFeedStore.getState().load();
      closeModal();
    } catch (err) {
      setFormError(err.message ?? "Could not publish post.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 sm:p-4 backdrop-blur-sm"
        onClick={closeModal}
      >
        <div
          className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col max-w-[700px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
            <h2 className="text-xl font-bold text-zinc-900">{editPost ? "Edit Post" : "Write Post"}</h2>
            <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors" onClick={closeModal}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            {/* Category selector */}
            {categories.length > 0 && (
              <div className="mb-4">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="bg-zinc-100 border-none text-zinc-900 font-medium rounded-lg px-4 py-2 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {formError && (
              <p className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">{formError}</p>
            )}

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold text-zinc-900 placeholder:text-zinc-300 border-none focus:ring-0 focus:outline-none p-0 mb-4"
            />

            <textarea
              ref={textareaRef}
              placeholder="Write something..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-[17px] leading-relaxed text-zinc-800 placeholder:text-zinc-400 border-none focus:ring-0 focus:outline-none resize-none min-h-[150px]"
            />

            {/* Image previews */}
            {imageFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {imageFiles.map(({ preview, file }, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden aspect-video bg-zinc-100">
                    <img src={preview} alt={file.name} className="w-full h-full object-cover" />
                    <button
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                      onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video URL preview */}
            {videoUrl && (
              <div className="mt-4 p-4 border border-zinc-200 rounded-lg flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-3 truncate">
                  <Video className="w-5 h-5 text-zinc-400 shrink-0" />
                  <span className="text-zinc-700 text-sm truncate">{videoUrl}</span>
                </div>
                <button className="text-zinc-400 hover:text-red-500 ml-2 shrink-0" onClick={() => setVideoUrl(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Poll editor */}
            {showPoll && (
              <PollEditor
                question={pollQuestion}
                setQuestion={setPollQuestion}
                pollOptions={pollOptions}
                setPollOptions={setPollOptions}
                onRemove={() => setShowPoll(false)}
              />
            )}
          </div>

          {/* Footer Toolbar */}
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0">
            <div className="flex items-center gap-1 relative">
              {/* Emoji */}
              <button
                className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors"
                title="Add emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-[60]">
                  <EmojiPicker onEmojiClick={insertEmoji} autoFocusSearch={false} />
                </div>
              )}

              {/* Image / file upload */}
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <button
                className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors"
                title="Add image"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile}
              >
                {isUploadingFile
                  ? <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  : <ImageIcon className="w-5 h-5" />}
              </button>

              {/* Link */}
              <button
                className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors"
                title="Add link"
                onClick={() => setLinkModalOpen(true)}
              >
                <LinkIcon className="w-5 h-5" />
              </button>

              {/* Video URL */}
              <button
                className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors"
                title="Add video link"
                onClick={() => setVideoModalOpen(true)}
              >
                <Video className="w-5 h-5" />
              </button>

              {/* Poll */}
              {!editPost && (
                <button
                  className={`p-2.5 rounded-lg transition-colors ${showPoll ? "text-zinc-900 bg-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200"}`}
                  title="Add poll"
                  onClick={() => setShowPoll(!showPoll)}
                >
                  <BarChart2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {!editPost && (
                <Checkbox
                  label="Email all members"
                  checked={isEmailBroadcast}
                  onChange={setIsEmailBroadcast}
                  className="whitespace-nowrap"
                />
              )}
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 font-semibold text-zinc-500 hover:text-zinc-900 transition-colors" onClick={closeModal}>
                  Cancel
                </button>
                <Button onClick={handlePost} loading={isPosting} disabled={!content.trim() && !title.trim()}>
                  {editPost ? "Save Changes" : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLinkModalOpen && (
        <AddLinkModal
          onClose={() => setLinkModalOpen(false)}
          onAdd={(url) => {
            // Insert the URL into the text content at cursor position
            const el = textareaRef.current;
            const start = el?.selectionStart ?? content.length;
            setContent(content.slice(0, start) + url + content.slice(start));
            setLinkModalOpen(false);
          }}
        />
      )}

      {isVideoModalOpen && (
        <AddVideoModal
          onClose={() => setVideoModalOpen(false)}
          onAdd={(url) => { setVideoUrl(url); setVideoModalOpen(false); }}
        />
      )}
    </>
  );
}
