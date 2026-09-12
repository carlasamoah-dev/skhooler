"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, MessageSquare, ThumbsUp, BookOpen } from "lucide-react";
import { fetchMemberProfile, fetchPosts } from "@/lib/api";
import { flagEmoji, relativeTime, formatCount } from "@/lib/format";
import { useGroupStore } from "@/store/useGroupStore";
import { Avatar, Card, Skeleton, StatusDot } from "@/components/ui";
import PostCard from "@/components/feed/PostCard";

const ROLE_MAP = {
  OWNER:     { label: "Owner",     tone: "brand" },
  ADMIN:     { label: "Admin",     tone: "brand" },
  MODERATOR: { label: "Moderator", tone: "sage" },
  MEMBER:    { label: "Member",    tone: "neutral" },
};

export default function MemberProfileClient({ memberId }) {
  const { slug } = useGroupStore();
  const [member, setMember] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchMemberProfile(slug, memberId),
      fetchPosts(slug, {})
    ])
    .then(([m, r]) => {
      if (!cancelled) {
        setMember(m);
        setPosts(r.items.filter(p => p.author?.id === m.user.id).slice(0, 5));
      }
    })
    .catch((e) => { if (!cancelled) setError(e.message); });

    return () => { cancelled = true; };
  }, [slug, memberId]);

  if (error) {
    return (
      <div className="max-w-[780px] mx-auto py-10">
        <p className="text-alert font-medium">{error}</p>
        <Link href={`/${slug}/members`} className="btn btn-ghost mt-4 inline-flex no-underline">Back to members</Link>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-[780px] mx-auto flex flex-col gap-4 py-4">
        <Skeleton variant="card" />
        <Skeleton variant="row" count={3} />
      </div>
    );
  }

  const { user } = member;
  const name = `${user.firstName} ${user.lastName}`;
  const role = ROLE_MAP[member.role] ?? ROLE_MAP.MEMBER;
  const joinedDate = new Date(member.joinedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-[780px] mx-auto flex flex-col gap-5">
      {/* Back link */}
      <Link href={`/${slug}/members`} className="btn btn-ghost self-start no-underline -ml-1">
        <ArrowLeft className="lucide w-4 h-4" aria-hidden="true" />
        Back to members
      </Link>

      {/* Profile header card */}
      <Card padding={32} radius="panel" className="flex flex-col sm:flex-row items-start gap-6">
        <div className="relative shrink-0">
          <Avatar name={name} src={user.avatarUrl ?? undefined} size={80} />
          {member.isOnline && (
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-online border-2 border-white" aria-label="Online" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">{name}</h2>
            <StatusDot tone={role.tone} label={role.label} />
            {member.tier && (
              <span className="text-[11px] font-bold uppercase tracking-wider bg-sand-100 text-sand-700 px-2 py-0.5 rounded-full">
                {member.tier.name}
              </span>
            )}
          </div>

          {member.bio && (
            <p className="text-base text-sand-800 mb-3 max-w-prose">{member.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-sand-700">
            {(user.country || user.location) && (
              <span className="flex items-center gap-1.5">
                {user.country ? (
                  <>
                    <span>{flagEmoji(user.countryCode)}</span>
                    {user.country}
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {user.location}
                  </>
                )}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              Joined {joinedDate}
            </span>
            {member.lastActiveAt && (
              <span className="text-sand-600">
                Active {relativeTime(member.lastActiveAt)}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: MessageSquare, label: "Posts", value: member.postCount ?? 0 },
          { icon: ThumbsUp,      label: "Comments", value: member.commentCount ?? 0 },
          { icon: BookOpen,      label: "Joined via", value: member.joinedVia ?? "—" },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} padding={20} radius="card" className="flex flex-col items-center justify-center text-center gap-1.5">
            <Icon className="w-5 h-5 text-sand-600" />
            <p className="text-2xl font-extrabold text-ink">{typeof value === "number" ? formatCount(value) : value}</p>
            <p className="text-[12px] font-semibold text-sand-600 uppercase tracking-wide">{label}</p>
          </Card>
        ))}
      </div>

      {/* Their posts */}
      <div>
        <h3 className="text-lg font-bold text-ink mb-3">Posts by {user.firstName}</h3>
        {posts.length === 0 ? (
          <Card padding={32} radius="panel" className="text-center text-sand-700">
            No posts yet in this community.
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} href={`/${slug}/posts/${post.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
