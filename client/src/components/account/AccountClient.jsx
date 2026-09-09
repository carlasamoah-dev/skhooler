"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { User, MapPin, Mail, Loader2, Camera, Link as LinkIcon } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { Button, Card, Input } from "@/components/ui";

export default function AccountClient() {
  const { user, setUser } = useSessionStore();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const avatarRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      setLocation(user.location || "");
      setEmail(user.email || "");
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  if (!user) return null;

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    
    // Mock save delay
    await new Promise((r) => setTimeout(r, 1000));
    
    // Update local store state to reflect changes globally
    setUser({
      ...user,
      firstName,
      lastName,
      username,
      location,
      email,
      avatarUrl: avatarPreview
    });
    
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/u/${username}` : `/u/${username}`;

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-display font-extrabold text-ink mb-6">Account Settings</h1>
      
      <Card padding={0} className="overflow-hidden">
        <form onSubmit={handleSave} className="flex flex-col">
          
          <div className="p-8 border-b border-divider flex flex-col gap-8">
            
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full bg-sand-200 border-2 border-surface overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand text-ground font-display font-bold text-3xl">
                      {firstName?.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-surface border border-divider rounded-full flex items-center justify-center text-ink hover:bg-sand-100 shadow-sm transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input type="file" accept="image/*" className="hidden" ref={avatarRef} onChange={handleAvatar} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Profile Picture</h3>
                <p className="text-sm text-sand-600 mt-1">Upload a new picture to easily identify yourself in communities.</p>
              </div>
            </div>

            {/* Profile URL Preview */}
            <div className="bg-sand-100 rounded-lg p-4 border border-divider flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-sand-600 uppercase tracking-wider mb-1">Your Public Profile</p>
                <div className="flex items-center gap-2 text-ink">
                  <LinkIcon className="w-4 h-4 text-sand-500 shrink-0" />
                  <Link href={`/u/${username}`} className="text-sm font-medium hover:underline truncate" target="_blank">
                    {profileUrl}
                  </Link>
                </div>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => window.open(`/u/${username}`, '_blank')}>
                View
              </Button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="col-span-1">
                <label className="field-label mb-1.5 flex items-center gap-2"><User className="w-4 h-4" /> First name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input" required />
              </div>
              <div className="col-span-1">
                <label className="field-label mb-1.5">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" required />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="field-label mb-1.5 flex items-center gap-2"><Mail className="w-4 h-4" /> Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="field-label mb-1.5">Username (URL)</label>
                <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="input" required />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="field-label mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. London, UK" className="input" />
              </div>
            </div>

          </div>
          
          <div className="bg-sand-100 px-8 py-4 flex items-center justify-between">
            {success ? (
              <p className="text-sm font-bold text-sage-600">Profile updated successfully!</p>
            ) : (
              <div />
            )}
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
