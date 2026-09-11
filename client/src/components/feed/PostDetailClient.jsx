"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquareOff } from "lucide-react";
import Linkify from "react-linkify";

import {
  createComment,
  deletePost,
  fetchComments,
  fetchPost,
  toggleCommentLike,
  togglePostComments,
  togglePostLike,
  togglePostPin,
  votePoll,
} from "@/lib/api";
import { formatCount } from "@/lib/format";
import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useFeedStore } from "@/store/useFeedStore";
import { Button, Card, Checkbox, Skeleton } from "@/components/ui";
import CommentComposer from "./CommentComposer";
import CommentThread from "./CommentThread";
import Poll from "./Poll";
import PostActionsMenu from "./PostActionsMenu";
import PostHeader from "./PostHeader";
import { useSocketStore } from "@/store/useSocketStore";

/** Detects a YouTube or Vimeo URL and returns the embeddable iframe URL. */
function getEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    // Loom
    if (u.hostname.includes("loom.com") && u.pathname.includes("/share/")) {
      const id = u.pathname.split("/").pop();
      if (id) return `https://www.loom.com/embed/${id}`;
    }
  } catch {
    // not a valid URL
  }
  return null;
}

function VideoBlock({ videoUrl }) {
  const embedUrl = getEmbedUrl(videoUrl);
  if (embedUrl) {
    return (
      <div className="mt-5 aspect-video w-full rounded-2xl overflow-hidden bg-black relative z-10">
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          title="Video"
        />
      </div>
    );
  }

  // If it's a Supabase storage URL (meaning it's an uploaded file) or ends with a video extension
  const isUploadedMedia = videoUrl.includes("supabase.co") || videoUrl.match(/\.(mp4|webm|ogg|mov)$/i);

  if (isUploadedMedia) {
    return (
      <div className="mt-5 aspect-video w-full rounded-2xl overflow-hidden bg-black relative z-10">
        <video src={videoUrl} controls className="w-full h-full" playsInline preload="metadata" />
      </div>
    );
  }

  return (
    <div className="mt-5 border border-divider rounded-2xl overflow-hidden bg-zinc-50 flex items-center justify-center p-6 relative z-10">
      <a href={videoUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline font-medium truncate max-w-full">
        {videoUrl}
      </a>
    </div>
  );
}

export default function PostDetailClient({ postId, inModal = false }) {
  const can = useCan();
  const slug = useGroupStore((s) => s.slug);
  const user = useSessionStore((s) => s.user);
  const [post, setPost] = useState(() => {
    if (postId === "new") return null;
    return useFeedStore.getState().posts.find(p => p.id === postId) || null;
  });
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!slug || !postId || postId === "new") return;
    let cancelled = false;
    fetchPost(slug, postId)
      .then((p) => {
        if (cancelled) return;
        setPost(current => {
          // Prevent regression if fetch raced with a local vote
          if (current?.userVotedOptionIds?.length > 0 && (!p.userVotedOptionIds || p.userVotedOptionIds.length === 0)) {
            return { ...p, userVotedOptionIds: current.userVotedOptionIds };
          }
          return p;
        });
      })
      .catch((e) => !cancelled && setError(e.message));
    fetchComments(slug, postId).then((c) => !cancelled && setComments(c.items));
    return () => { cancelled = true; };
  }, [postId, slug]);

  // Handle Socket Events for real-time updates
  useEffect(() => {
    import("@/store/useSocketStore").then(({ useSocketStore }) => {
      const { socket, isConnected } = useSocketStore.getState();
      if (!socket || !isConnected) return;

      const onPostUpdated = ({ postId: updatedId, patch, newComment }) => {
        if (updatedId !== postId) return;
        
        if (patch) {
          setPost((p) => p ? { ...p, ...patch } : p);
        }
        
        if (newComment) {
          setComments((list) => {
            if (list.find(c => c.id === newComment.id)) return list;
            return [...list, newComment];
          });
        }
      };

      const onUserTyping = ({ postId: typedPostId, parentCommentId, userId, name, isTyping }) => {
        if (typedPostId !== postId) return;
        
        // Don't show our own typing indicator
        const currentUser = useSessionStore.getState().user;
        if (currentUser?.id === userId) return;

        setTypingUsers((current) => {
          if (isTyping) {
            // Remove previous instance if switching threads
            const filtered = current.filter(u => u.userId !== userId);
            return [...filtered, { userId, name, parentCommentId }];
          } else {
            return current.filter(u => u.userId !== userId);
          }
        });
      };

      socket.on("post:updated", onPostUpdated);
      socket.on("user:typing", onUserTyping);

      return () => {
        socket.off("post:updated", onPostUpdated);
        socket.off("user:typing", onUserTyping);
      };
    });
  }, [postId]);

  if (error) {
    return (
      <div className="mx-auto max-w-[860px]">
        <h1>Post not found</h1>
        <p className="mt-2 text-body text-sand-800">{error}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-[860px] flex flex-col gap-4">
        <Skeleton variant="card" count={2} />
      </div>
    );
  }

  const like = async () => {
    const before = { hasLiked: post.hasLiked, likeCount: post.likeCount };
    const optimistic = { hasLiked: !post.hasLiked, likeCount: post.likeCount + (post.hasLiked ? -1 : 1) };
    
    setPost((p) => ({ ...p, ...optimistic }));
    useFeedStore.getState().updatePost(postId, optimistic);
    
    try {
      const result = await togglePostLike(slug, postId);
      setPost((p) => ({ ...p, ...result }));
      useFeedStore.getState().updatePost(postId, result);
    } catch {
      setPost((p) => ({ ...p, ...before }));
      useFeedStore.getState().updatePost(postId, before);
    }
  };

  const addComment = async (content, parentCommentId = null) => {
    const comment = await createComment(slug, postId, { content, parentCommentId });
    setComments((list) => {
      if (!parentCommentId) return [...list, comment];
      return list.map(c => {
        if (c.id === parentCommentId) {
          return { ...c, replies: [...(c.replies || []), comment] };
        }
        return c;
      });
    });
    setPost((p) => {
      const newCount = p.commentCount + 1;
      useFeedStore.getState().updatePost(postId, { commentCount: newCount });
      return { ...p, commentCount: newCount };
    });
  };

  const likeComment = async (commentId) => {
    setComments((list) =>
      list.map((c) =>
        c.id === commentId ? { ...c, hasLiked: !c.hasLiked, likeCount: c.likeCount + (c.hasLiked ? -1 : 1) } : c,
      ),
    );
    try {
      const result = await toggleCommentLike(slug, postId, commentId);
      setComments((list) => list.map((c) => (c.id === commentId ? { ...c, ...result } : c)));
    } catch {
      // revert is fine — the optimistic was close enough
    }
  };

  return (
    <div className="mx-auto max-w-[860px] flex flex-col gap-4">
      {!inModal && (
        <Link href={`/${slug}/community`} className="btn btn-ghost self-start no-underline">
          <ArrowLeft className="lucide w-4 h-4" aria-hidden="true" />
          Back to community
        </Link>
      )}

      <Card as="article" padding={32} radius="overlay" className="px-9">
        {/* Header row with author info + actions menu */}
        <div className="flex items-start justify-between gap-3">
          <PostHeader
            author={post.author}
            createdAt={post.createdAt}
            category={post.category}
            isPinned={post.isPinned}
            size={48}
            showRole
          />
          <PostActionsMenu
            post={post}
            inModal={inModal}
            onPostChanged={(patch) => setPost((p) => ({ ...p, ...patch }))}
          />
        </div>

        <h2 className="mt-5">{post.title}</h2>
        <div className="mt-3 text-body-lg max-w-[70ch] break-words">
          <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
            <a target="_blank" href={decoratedHref} key={key} className="text-blue-600 hover:underline">
              {decoratedText}
            </a>
          )}>
            {post.content}
          </Linkify>
        </div>

        {/* Images */}
        {Array.isArray(post.attachments) && post.attachments.filter(a => a.type?.startsWith("image")).length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-2">
            {post.attachments
              .filter((a) => a.type?.startsWith("image"))
              .map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noreferrer" className="rounded-inner overflow-hidden block aspect-video bg-zinc-100">
                  <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                </a>
              ))}
          </div>
        )}

        {/* Video embed */}
        {post.videoUrl && <VideoBlock videoUrl={post.videoUrl} />}

        {/* Poll */}
        {post.poll ? (
          <div className="mt-6">
            <Poll
              poll={{ ...post.poll, votedOptionIds: post.userVotedOptionIds ?? [] }}
              onVote={async (optionIds) => {
                const result = await votePoll(slug, postId, optionIds);
                
                // Update local detail state
                setPost(p => ({
                  ...p,
                  poll: result,
                  userVotedOptionIds: result.userVotedOptionIds || []
                }));

                // Update feed state so returning to feed shows accurate selection
                useFeedStore.getState().updatePost(postId, {
                  poll: result,
                  userVotedOptionIds: result.userVotedOptionIds || []
                });
                
                return result;
              }}
            />
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button variant="secondary" aria-pressed={post.hasLiked} onClick={like}>
            {`Like · ${formatCount(post.likeCount)}`}
          </Button>
          <span className="text-ui text-sand-700">{`${formatCount(post.commentCount)} comments`}</span>

          {can("post:pin") ? (
            <Checkbox
              className="ml-auto"
              label="Pinned to the top of the feed"
              checked={post.isPinned}
              onChange={async () => {
                setPost((p) => ({ ...p, isPinned: !p.isPinned }));
                useFeedStore.getState().updatePost(postId, { isPinned: !post.isPinned });
                try {
                  const result = await togglePostPin(slug, postId);
                  setPost((p) => ({ ...p, ...result }));
                  useFeedStore.getState().updatePost(postId, result);
                } catch {
                  setPost((p) => ({ ...p, isPinned: post.isPinned }));
                  useFeedStore.getState().updatePost(postId, { isPinned: post.isPinned });
                }
              }}
            />
          ) : null}
        </div>
      </Card>

      {/* Comments section */}
      <Card padding={32} radius="overlay" className="px-9 py-7">
        {post.commentsEnabled === false ? (
          <div className="flex items-center gap-3 text-sand-600 py-4">
            <MessageSquareOff className="w-5 h-5 text-sand-400 shrink-0" />
            <span className="text-[14px]">Comments have been turned off for this post.</span>
          </div>
        ) : (
          <>
            {can("comment:create") ? (
              <CommentComposer 
                user={user} 
                onSubmit={(content) => addComment(content)} 
                onTyping={(isTyping) => {
                  const groupId = useGroupStore.getState().group?.id;
                  const name = user ? `${user.firstName} ${user.lastName}` : "Someone";
                  useSocketStore.getState().emitTyping(groupId, postId, null, name, isTyping);
                }}
              />
            ) : null}
            
            {/* Show typing indicators for the main post */}
            {typingUsers.filter(u => !u.parentCommentId).length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-sand-500 animate-pulse">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-sand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-sand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-sand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
                {typingUsers.filter(u => !u.parentCommentId).map(u => u.name).join(", ")} {typingUsers.filter(u => !u.parentCommentId).length === 1 ? "is" : "are"} typing...
              </div>
            )}

            <div className="mt-5">
              <CommentThread 
                comments={comments} 
                user={user} 
                onLike={likeComment} 
                onReply={addComment} 
                typingUsers={typingUsers}
                postId={postId}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
