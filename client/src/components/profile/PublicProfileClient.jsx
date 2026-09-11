"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Compass, User } from "lucide-react";
import { fetchUserProfile } from "@/lib/api";
import { Avatar, Card, Skeleton, EmptyState } from "@/components/ui";

export default function PublicProfileClient({ username }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchUserProfile(username)
      .then((data) => !cancelled && setProfile(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => { cancelled = true; };
  }, [username]);

  if (error) {
    return <div className="p-8 max-w-2xl mx-auto"><EmptyState icon={User} title="User not found" body={error} /></div>;
  }

  if (!profile) {
    return <div className="p-8 max-w-2xl mx-auto"><Skeleton variant="card" className="h-64" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <Card padding={0} className="overflow-hidden">
        {/* Cover / Header bg */}
        <div className="h-32 bg-sand-200"></div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="flex items-end gap-5">
              <div className="rounded-full p-1 bg-surface">
                <Avatar name={`${profile.firstName} ${profile.lastName}`} src={profile.avatarUrl} size={96} />
              </div>
              <div className="mb-2">
                <h1 className="text-2xl font-display font-extrabold text-ink leading-none">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-sand-600 font-medium mt-1">@{profile.username}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-[14px] text-sand-700 mb-8 pb-8 border-b border-divider">
            {profile.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sand-500" />
                {profile.location}
              </div>
            )}
            {profile.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sand-500" />
                <a href={`mailto:${profile.email}`} className="hover:text-ink transition-colors">{profile.email}</a>
              </div>
            )}
            
            {profile.socialLinks?.filter(link => link.isVisible).map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors flex items-center gap-1.5 capitalize font-medium">
                  <span className="w-4 h-4 rounded-full bg-sand-200 flex items-center justify-center text-[10px]">🔗</span>
                  {link.platform}
                </a>
              </div>
            ))}
          </div>

          {profile.bio && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-ink mb-2">About</h3>
              <p className="text-sand-700 whitespace-pre-line leading-relaxed">{profile.bio}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-ink mb-4">Communities by {profile.firstName}</h3>
            
            {profile.createdCommunities?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.createdCommunities.map((community) => (
                  <Link 
                    key={community.slug} 
                    href={`/${community.slug}/community`}
                    className="flex items-center gap-4 p-4 rounded-inner border border-divider hover:border-sand-400 hover:bg-sand-50 transition-all no-underline group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-brand text-ground flex items-center justify-center font-display font-bold text-xl overflow-hidden shrink-0">
                      {community.iconUrl ? (
                        <img src={community.iconUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        community.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink text-[15px] truncate group-hover:text-brand transition-colors">{community.name}</p>
                      <p className="text-[13px] text-sand-600 truncate">skhooler.com/{community.slug}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Compass} 
                title="No communities yet" 
                body={`${profile.firstName} hasn't created any communities yet.`}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
