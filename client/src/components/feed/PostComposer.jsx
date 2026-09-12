"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Link2, Lock, MousePointerClick, Paperclip, SquareChartGantt, Video } from "lucide-react";

import { createPost } from "@/lib/api";
import { formatCount } from "@/lib/format";
import { useCan } from "@/lib/permissions";
import { useGroupStore } from "@/store/useGroupStore";
import { Button, Card, Checkbox, Input, Kicker, Select, Textarea } from "@/components/ui";

const ATTACHMENTS = [
  { icon: Paperclip, label: "Attach file" },
  { icon: Link2, label: "Link" },
  { icon: Video, label: "Video" },
  { icon: SquareChartGantt, label: "Poll" },
  { icon: MousePointerClick, label: "Action button" },
];

export default function PostComposer() {
  const router = useRouter();
  const can = useCan();
  const { slug, group, categories, user, membership } = useGroupStore();
  const [formError, setFormError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { categoryId: "", isPinned: "no", isEmailBroadcast: false } });

  const memberCount = group?.stats?.memberCount ?? 0;
  const role = (membership?.role ?? "").toLowerCase();

  // Members cannot create posts — show a clear message instead of the form.
  if (!can("post:create")) {
    return (
      <div className="max-w-[680px] mx-auto flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-sand-400" />
        </div>
        <h2 className="text-xl font-display font-extrabold text-ink mb-2">Members can&apos;t create posts</h2>
        <p className="text-sand-600 max-w-sm mb-6">
          Only Moderators, Admins, and the Owner can publish posts in this community.
        </p>
        <Link href={`/${slug}/community`} className="btn btn-primary no-underline">
          Back to Feed
        </Link>
      </div>
    );
  }

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      const post = await createPost(slug, {
        title: values.title,
        content: values.content,
        categoryId: values.categoryId || null,
        isPinned: values.isPinned === "yes",
        isEmailBroadcast: !!values.isEmailBroadcast,
      });
      router.push(`/${slug}/posts/${post.id}`);
    } catch (error) {
      setFormError(error.message ?? "Could not publish that post.");
    }
  };

  return (
    <div className="mx-auto max-w-[860px] flex flex-col gap-4">
      <Link href={`/${slug}/community`} className="btn btn-ghost self-start no-underline">
        <ArrowLeft className="lucide w-4 h-4" aria-hidden="true" />
        Cancel
      </Link>

      <Card padding={32} radius="overlay" as="form" onSubmit={handleSubmit(onSubmit)} className="px-9">
        <Kicker>{`Posting as ${user?.firstName} ${user?.lastName} · ${role === "owner" || role === "admin" ? "owners and admins only" : role}`}</Kicker>

        {formError ? (
          <p role="alert" className="mt-4 text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">
            {formError}
          </p>
        ) : null}

        <div className="mt-4">
          <Input
            aria-label="Post title"
            placeholder="Title"
            className="min-h-14 font-display font-extrabold text-2xl"
            error={errors.title?.message}
            {...register("title", {
              required: "Give the post a title.",
              minLength: { value: 2, message: "Titles are at least 2 characters." },
              maxLength: { value: 255, message: "Titles are at most 255 characters." },
            })}
          />
        </div>

        <Textarea
          aria-label="Post body"
          placeholder="Write your post…"
          className="min-h-[190px] text-body-lg rounded-card"
          error={errors.content?.message}
          {...register("content", {
            required: "Write something before publishing.",
            maxLength: { value: 50_000, message: "That post is too long." },
          })}
        />

        <div className="flex flex-wrap gap-2">
          {ATTACHMENTS.map(({ icon: Icon, label }) => (
            <Button key={label} variant="secondary" size="sm" icon={Icon} disabled>
              {label}
            </Button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                label="Category"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "", label: "No category" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            )}
          />
          <Controller
            name="isPinned"
            control={control}
            render={({ field }) => (
              <Select
                label="Pin to the top of the feed"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
              />
            )}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Controller
            name="isEmailBroadcast"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={`Email this to all ${formatCount(memberCount)} members`}
                checked={!!field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Button type="submit" loading={isSubmitting} className="ml-auto">
            {isSubmitting ? "Publishing…" : "Publish post"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
