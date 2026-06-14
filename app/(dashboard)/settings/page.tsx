"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { uploadAvatar } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const schema = z.object({
  display_name: z.string().min(1, "Name is required"),
});
type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          reset({ display_name: data.display_name ?? "" });
          setAvatarUrl(data.avatar_url);
        }
      });
    });
  }, [reset]);

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/user/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: data.display_name }),
    });
    if (res.ok) toast.success("Profile updated");
    else toast.error("Failed to update profile");
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file, userId);
      setAvatarUrl(url);
      await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: url }),
      });
      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  }

  const initials = avatarUrl ? "" : (userId?.[0]?.toUpperCase() ?? "?");

  return (
    <div className="max-w-md space-y-8">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile</h3>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <Label
            htmlFor="avatar-upload"
            className="cursor-pointer text-sm text-blue-600 hover:underline"
          >
            {uploading ? "Uploading…" : "Change avatar"}
          </Label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="display_name">Display name</Label>
            <Input id="display_name" {...register("display_name")} />
            {errors.display_name && (
              <p className="text-sm text-destructive">{errors.display_name.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
