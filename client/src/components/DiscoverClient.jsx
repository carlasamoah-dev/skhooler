"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Grid, TrendingUp, Palette, Music, DollarSign, Smile,
  Laptop, Heart, Trophy, Book, Users, Search, AlertCircle,
} from "lucide-react";
import { fetchDiscoverGroups } from "@/lib/api";
import { useSearchStore } from "@/store/useSearchStore";
import { useSessionStore } from "@/store/useSessionStore";

const CATEGORIES = [
  { id: "all",          label: "All Communities",    icon: Grid },
  { id: "trending",     label: "Trending",            icon: TrendingUp },
  { id: "tech",         label: "Technology",          icon: Laptop },
  { id: "money",        label: "Business & Finance",  icon: DollarSign },
  { id: "health",       label: "Health & Fitness",    icon: Heart },
  { id: "hobbies",      label: "Hobbies",             icon: Palette },
  { id: "music",        label: "Music",               icon: Music },
  { id: "spirituality", label: "Spirituality",        icon: Smile },
  { id: "sports",       label: "Sports",              icon: Trophy },
  { id: "self",         label: "Self Improvement",    icon: Book },
];

const PRICING_OPTIONS = [
  { id: "all",  label: "All" },
  { id: "FREE", label: "Free" },
  { id: "PAID", label: "Paid" },
];

function formatPrice(group) {
  if (group.pricingModel === "FREE") return "Free";
  if (group.price) {
    const interval = group.billingInterval === "YEARLY" ? "/yr" : "/mo";
    return `$${Number(group.price).toFixed(0)}${interval}`;
  }
  return "Paid";
}

function CommunityCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface rounded-xl border border-divider overflow-hidden animate-pulse">
      <div className="h-[160px] w-full bg-sand-100" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-sand-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-sand-100 rounded w-3/4" />
            <div className="h-3 bg-sand-100 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-sand-100 rounded w-full" />
          <div className="h-3 bg-sand-100 rounded w-5/6" />
        </div>
        <div className="mt-auto pt-4 border-t border-divider">
          <div className="h-3 bg-sand-100 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

function CommunityCard({ group }) {
  const ownerName = group.owner
    ? `${group.owner.firstName} ${group.owner.lastName}`
    : "";

  return (
    <Link
      href={`/${group.slug}`}
      className="group flex flex-col bg-surface rounded-xl border border-divider overflow-hidden hover:shadow-md hover:border-brand/30 transition-all duration-300"
    >
      {/* Cover */}
      <div className="h-[160px] w-full relative bg-sand-100 overflow-hidden">
        {group.coverUrl ? (
          <img
            src={group.coverUrl}
            alt={group.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand/10 to-brand/30 flex items-center justify-center">
            <span className="text-4xl font-extrabold text-brand/40">
              {group.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[12px] font-bold text-ink shadow-soft">
          {formatPrice(group)}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start gap-3 mb-3">
          {group.iconUrl ? (
            <img
              src={group.iconUrl}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-divider shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 border border-divider">
              <span className="text-sm font-bold text-brand">
                {group.name.charAt(0)}
              </span>
            </div>
          )}
          <h3 className="font-bold text-[15.5px] text-ink leading-tight group-hover:text-brand-700 transition-colors">
            {group.name}
          </h3>
        </div>

        {group.description && (
          <p className="text-[13.5px] text-sand-700 line-clamp-2 leading-relaxed mb-4">
            {group.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 text-[13px] text-sand-700 font-medium pt-4 border-t border-divider">
          <Users className="w-4 h-4 text-sand-700" />
          {group.memberCount?.toLocaleString() ?? 0} Members
        </div>
      </div>
    </Link>
  );
}

export default function DiscoverClient() {
  const router = useRouter();
  const { searchQuery } = useSearchStore();
  const { user, communities, status } = useSessionStore();

  const [activeTag, setActiveTag] = useState("all");
  const [activePricing, setActivePricing] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [groups, setGroups] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce ref for search
  const debounceRef = useRef(null);

  const load = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDiscoverGroups(params);
      setGroups(result?.groups ?? []);
      setTotalPages(result?.totalPages ?? 1);
      setTotal(result?.total ?? 0);
    } catch (err) {
      setError("Could not load communities. Make sure the backend is running.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever filters / search / page change (debounced for search)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load({
        q: searchQuery.trim() || undefined,
        tag: activeTag !== "all" ? activeTag : undefined,
        pricing: activePricing !== "all" ? activePricing : undefined,
        page: currentPage,
        limit: 9,
      });
    }, searchQuery ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, activeTag, activePricing, currentPage, load]);

  // Reset to page 1 when filters change
  const handleTagChange = (tag) => { setActiveTag(tag); setCurrentPage(1); };
  const handlePricingChange = (p) => { setActivePricing(p); setCurrentPage(1); };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">

      {/* Sidebar */}
      <aside className="w-full md:w-[240px] shrink-0 md:sticky md:top-24 md:self-start space-y-6">
        <div>
          <h2 className="text-xs font-bold text-sand-700 uppercase tracking-wider mb-3 px-3">
            Categories
          </h2>
          <nav className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTag === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleTagChange(cat.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14.5px] font-medium transition-all ${
                    isActive
                      ? "bg-brand text-ground shadow-soft"
                      : "text-sand-700 hover:bg-sand-100 hover:text-ink"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-ground/70" : "text-sand-700"}`} />
                  {cat.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-bold text-sand-700 uppercase tracking-wider mb-3 px-3">
            Pricing
          </h2>
          <div className="flex flex-col gap-1">
            {PRICING_OPTIONS.map((opt) => {
              const isActive = activePricing === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handlePricingChange(opt.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14.5px] font-medium transition-all ${
                    isActive
                      ? "bg-brand text-ground shadow-soft"
                      : "text-sand-700 hover:bg-sand-100 hover:text-ink"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-2">
            Explore Communities
          </h1>
          <p className="text-[16px] text-sand-700 max-w-2xl">
            Find your tribe. Join creators, builders, and learners in communities built for you.
          </p>
          {!loading && !error && (
            <p className="text-[13px] text-sand-500 mt-1">
              {total.toLocaleString()} {total === 1 ? "community" : "communities"} found
            </p>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 bg-brand-50 border border-brand/20 rounded-xl px-5 py-4 text-[14px] text-alert mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Grid — skeleton or real */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => <CommunityCardSkeleton key={i} />)}
          </div>
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((g) => <CommunityCard key={g.id} group={g} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-sand-700 bg-surface border border-dashed border-divider rounded-xl">
            <Search className="w-8 h-8 mx-auto mb-3 text-sand-400" />
            <p className="font-medium text-[15px]">No communities found.</p>
            <p className="text-[13px] mt-1 text-sand-500">Try adjusting your filters or search query.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-md text-[14px] font-medium text-sand-700 hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-[14px] font-semibold transition-all ${
                  currentPage === i + 1
                    ? "bg-brand text-ground"
                    : "text-sand-700 hover:bg-sand-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-md text-[14px] font-medium text-sand-700 hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
