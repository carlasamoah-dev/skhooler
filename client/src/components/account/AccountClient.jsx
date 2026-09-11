"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { User, MapPin, Mail, Loader2, Camera, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { updateAccount } from "@/lib/api";
import { uploadImage } from "@/lib/api"; // wait, uploadImage might be exported from api.js! Let me double check... Actually it is!
import { Button, Card, Input } from "@/components/ui";

const SOCIAL_PLATFORMS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' }
];

export default function AccountClient() {
  const { user, setUser } = useSessionStore();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const avatarRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setUsername(user.username || "");
      setLocation(user.location || "");
      setBio(user.bio || "");
      setEmail(user.email || "");
      setAvatarPreview(user.avatarUrl || null);
      setSocialLinks(user.socialLinks || []);
    }
  }, [user]);

  if (!user) return null;

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village;
            const country = data.address.country;
            if (city && country) {
              setLocation(`${city}, ${country}`);
            } else {
              setLocation(data.display_name);
            }
          }
        } catch (err) {
          setError("Failed to resolve location address.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setError("Location permission denied or unavailable.");
        setIsLocating(false);
      }
    );
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'facebook', url: '', isVisible: true }]);
  };

  const updateSocialLink = (index, field, value) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    setError("");
    
    try {
      let finalAvatarUrl = user.avatarUrl;
      
      // Upload new avatar if selected
      if (avatarFile) {
        // dynamically import if needed, assuming uploadImage is in api.js
        const { uploadImage } = await import("@/lib/api");
        finalAvatarUrl = await uploadImage(avatarFile, "avatars");
      }
      
      const payload = {
        firstName,
        lastName,
        username,
        location,
        bio,
        email, // Note: backend might ignore email updates or require verification flow
        avatarUrl: finalAvatarUrl,
        socialLinks: socialLinks.filter(s => s.url.trim() !== '')
      };
      
      const updatedUser = await updateAccount(payload);
      
      setUser(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "An error occurred while saving your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/u/${username}` : `/u/${username}`;

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-display font-extrabold text-ink mb-6">Account Settings</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
          {error}
        </div>
      )}
      
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
                      {firstName?.charAt(0) || "U"}
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
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required disabled />
                <p className="text-xs text-sand-500 mt-1">Email cannot be changed here.</p>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="field-label mb-1.5">Username (URL)</label>
                <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="input" required minLength={3} />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="field-label mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location
                  <button type="button" onClick={handleDetectLocation} disabled={isLocating} className="ml-auto text-xs text-brand hover:underline font-medium">
                    {isLocating ? "Detecting..." : "Auto-detect"}
                  </button>
                </label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. London, UK" className="input" />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="field-label mb-1.5">Bio</label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Tell us a little about yourself..." 
                  className="input min-h-[100px] resize-y" 
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="border-t border-divider pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-ink">Social Links</h3>
                <Button type="button" variant="secondary" size="sm" onClick={addSocialLink} className="gap-1">
                  <Plus className="w-4 h-4" /> Add link
                </Button>
              </div>
              
              <div className="flex flex-col gap-4">
                {socialLinks.length === 0 && (
                  <p className="text-sm text-sand-500 italic">No social links added yet.</p>
                )}
                {socialLinks.map((link, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-sand-50 p-3 rounded-lg border border-divider">
                    <select 
                      value={link.platform} 
                      onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                      className="input sm:max-w-[140px]"
                    >
                      {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                    <input 
                      type="url" 
                      placeholder="https://" 
                      value={link.url} 
                      onChange={(e) => updateSocialLink(idx, 'url', e.target.value)} 
                      className="input flex-1"
                    />
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-start">
                      <label className="flex items-center gap-2 text-sm text-sand-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={link.isVisible} 
                          onChange={(e) => updateSocialLink(idx, 'isVisible', e.target.checked)}
                          className="rounded border-sand-300 text-brand focus:ring-brand"
                        />
                        Public
                      </label>
                      <button type="button" onClick={() => removeSocialLink(idx)} className="text-alert hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
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
