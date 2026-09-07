"use client";

import { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, Link as LinkIcon, Video, BarChart2, Smile, Upload } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import { useComposerStore } from "@/store/useComposerStore";
import { useGroupStore } from "@/store/useGroupStore";
import { Button } from "@/components/ui";

/** Nested Modal for adding a Link */
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

        <div className="flex justify-end gap-3 mt-8">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <Button 
            onClick={() => onAdd(url)}
            disabled={!url.trim()}
          >
            Link
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Nested Modal for adding a Video */
function AddVideoModal({ onClose, onAdd }) {
  const [url, setUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      // Simulate upload delay
      await new Promise((r) => setTimeout(r, 1500));
      setIsUploading(false);
      onAdd(file.name); // Mock adding the video file name as URL
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
            placeholder="YouTube, Loom, Vimeo, or Wistia link"
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
              <Upload className="w-6 h-6 text-zinc-500 mb-2" />
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
            onClick={() => onAdd(url)}
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
function PollEditor({ pollOptions, setPollOptions, onRemove }) {
  const updateOption = (index, val) => {
    const newOptions = [...pollOptions];
    newOptions[index] = val;
    setPollOptions(newOptions);
  };

  const removeOption = (index) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const addOption = () => setPollOptions([...pollOptions, ""]);

  return (
    <div className="border border-zinc-200 rounded-lg p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-zinc-900">Poll</h4>
        <button className="text-sm text-zinc-500 hover:text-zinc-700" onClick={onRemove}>Remove</button>
      </div>

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
              <button className="p-2 text-zinc-400 hover:text-zinc-600" onClick={() => removeOption(i)}>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button className="btn btn-ghost border border-divider" onClick={addOption}>
          Add Option
        </button>
      </div>
    </div>
  );
}

export default function ComposerModal() {
  const { isOpen, closeModal } = useComposerStore();
  const { categories } = useGroupStore();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  
  // Attachments & Features
  const [link, setLink] = useState(null);
  const [video, setVideo] = useState(null);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", "", ""]);
  const [files, setFiles] = useState([]);
  
  // Modals state
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // reset form
      setTitle("");
      setContent("");
      setLink(null);
      setVideo(null);
      setShowPoll(false);
      setPollOptions(["", "", ""]);
      setFiles([]);
      setShowEmojiPicker(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const insertText = (text) => {
    const cursor = textareaRef.current?.selectionStart || content.length;
    const textBefore = content.substring(0, cursor);
    const textAfter = content.substring(cursor);
    setContent(textBefore + text + textAfter);
    // Move cursor focus if possible (omitted for brevity, basic concat works)
  };

  const handlePost = async () => {
    // In a real app, you'd dispatch to API. For now, mock it to feed store.
    const { addPost } = require("@/store/useFeedStore").useFeedStore.getState();
    const { user } = require("@/store/useSessionStore").useSessionStore.getState();

    addPost({
      title: title.trim(),
      content: content.trim(),
      category: categories.find((c) => c.id === categoryId) || categories[0],
      author: user || { firstName: "You", lastName: "", avatarUrl: null },
      videoUrl: video,
      files: files.map(f => f.name),
      poll: showPoll ? pollOptions.filter(Boolean) : null,
      isPinned: false
    });

    closeModal();
  };

  const onEmojiClick = (emojiData) => {
    insertText(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploadingFile(true);
      const newFiles = Array.from(e.target.files);
      // Simulate upload delay
      await new Promise((r) => setTimeout(r, 1500));
      setFiles((prev) => [...prev, ...newFiles]);
      setIsUploadingFile(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 sm:p-4 backdrop-blur-sm" onClick={closeModal}>
        <div 
          className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col max-w-[700px] overflow-hidden" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
            <h2 className="text-xl font-bold text-zinc-900">Write Post</h2>
            <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors" onClick={closeModal}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            <div className="mb-4">
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                className="bg-zinc-100 border-none text-zinc-900 font-medium rounded-lg px-4 py-2 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

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

            {/* Media Previews */}
            {files.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {files.map((file, i) => (
                  <div key={i} className="p-3 border border-zinc-200 rounded-lg flex items-center justify-between bg-zinc-50">
                    <div className="flex items-center gap-3 truncate">
                      <ImageIcon className="w-5 h-5 text-zinc-400 shrink-0" />
                      <span className="text-zinc-700 truncate">{file.name}</span>
                    </div>
                    <button className="text-zinc-400 hover:text-alert ml-2 shrink-0" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {video && (
              <div className="mt-4 p-4 border border-zinc-200 rounded-lg flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-3 truncate">
                  <Video className="w-5 h-5 text-zinc-400 shrink-0" />
                  <span className="text-zinc-700 truncate">{video}</span>
                </div>
                <button className="text-zinc-400 hover:text-alert ml-2 shrink-0" onClick={() => setVideo(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {showPoll && (
              <PollEditor 
                pollOptions={pollOptions} 
                setPollOptions={setPollOptions} 
                onRemove={() => setShowPoll(false)} 
              />
            )}
          </div>

          {/* Footer Toolbar */}
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0">
            <div className="flex items-center gap-1 relative">
              
              {/* Emojis */}
              <button 
                className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors" 
                title="Add emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-5 h-5" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-[60]">
                  <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={false} />
                </div>
              )}

              {/* Attachments */}
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                disabled={isUploadingFile}
              />
              <button 
                className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors flex items-center justify-center" 
                title="Add image or file"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile}
              >
                {isUploadingFile ? (
                  <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </button>

              <button className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors" title="Add link" onClick={() => setLinkModalOpen(true)}>
                <LinkIcon className="w-5 h-5" />
              </button>

              <button className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors" title="Add video" onClick={() => setVideoModalOpen(true)}>
                <Video className="w-5 h-5" />
              </button>

              <button 
                className={`p-2.5 rounded-lg transition-colors ${showPoll ? 'text-zinc-900 bg-zinc-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'}`} 
                title="Add poll" 
                onClick={() => setShowPoll(!showPoll)}
              >
                <BarChart2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 font-semibold text-zinc-500 hover:text-zinc-900 transition-colors" onClick={closeModal}>
                Cancel
              </button>
              <Button onClick={handlePost} disabled={!content.trim() && !title.trim()}>
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isLinkModalOpen && (
        <AddLinkModal 
          onClose={() => setLinkModalOpen(false)} 
          onAdd={(url) => { insertText(url); setLinkModalOpen(false); }} 
        />
      )}

      {isVideoModalOpen && (
        <AddVideoModal 
          onClose={() => setVideoModalOpen(false)} 
          onAdd={(url) => { setVideo(url); setVideoModalOpen(false); }} 
        />
      )}
    </>
  );
}
