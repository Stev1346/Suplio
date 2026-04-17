"use client";

import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageShell } from "@/components/ui/PageShell";
import {
  DjProfileResponse,
  getDjProfile,
  patchDjProfile,
  removeDjAvatar,
  uploadDjAvatar,
} from "@/lib/client/api/dj";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DjProfilePublicView } from "./DjProfilePublicView";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  commaTextToSocialLinks,
  socialLinksToCommaText,
} from "@/lib/client/dj-profile-form";
import { Trash2 } from "lucide-react";
import { AvatarCropModal } from "@/components/ui/AvatarCropModal";
import Image from "next/image";

const textareaClassName = cn(
  "min-h-[120px] w-full rounded-md bg-transparent px-2.5 py-2 text-base text-accent-95 shadow-xs transition-[color,box-shadow] outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "md:text-sm dark:bg-input/30",
);

export default function DjProfileScreen() {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [profile, setProfile] = useState<DjProfileResponse | null>(null);
  const [draft, setDraft] = useState<DjProfileResponse | null>(null);

  const [socialText, setSocialText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rawAvatarPreview, setRawAvatarPreview] = useState<string | null>(null);
  const [croppedAvatarFile, setCroppedAvatarFile] = useState<File | null>(null);
  const [croppedAvatarPreview, setCroppedAvatarPreview] = useState<
    string | null
  >(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [removeAvatarRequested, setRemoveAvatarRequested] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data, error } = await getDjProfile();
      if (cancelled) return;

      if (error || !data) {
        toast.error(error ?? "Could not load profile");
        setLoading(false);
        return;
      }

      setProfile(data);
      setDraft(data);
      setSocialText(socialLinksToCommaText(data.social_links));
      setContactEmail(data.contact_info?.email?.trim() ?? "");
      setContactPhone(data.contact_info?.phone?.trim() ?? "");
      setLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onAvatarInputChange(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRawAvatarPreview(url);
    setShowCropModal(true);
  }

  function onCropConfirm(blob: Blob) {
    const cropped = new File([blob], `avatar-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    setCroppedAvatarFile(cropped);
    setCroppedAvatarPreview((prev) => {
      if(prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(cropped);
    });

    setRemoveAvatarRequested(false);
    setShowCropModal(false);
  }

  function onCropCancel() {
    if (rawAvatarPreview) URL.revokeObjectURL(rawAvatarPreview);
    setRawAvatarPreview(null);
    setShowCropModal(false);
  }

  function onRecrop() {
    if (rawAvatarPreview) {
      setShowCropModal(true);
      return;
    }
    if (croppedAvatarPreview) {
      setRawAvatarPreview(croppedAvatarPreview);
      setShowCropModal(true);
    }
  }

  function onRemoveAvatar() {
    setCroppedAvatarFile(null);
    if (croppedAvatarPreview) URL.revokeObjectURL(croppedAvatarPreview);
    setCroppedAvatarPreview(null);

    if (rawAvatarPreview) URL.revokeObjectURL(rawAvatarPreview);
    setRawAvatarPreview(null);

    setRemoveAvatarRequested(true);
    setDraft((d) => (d ? { ...d, avatar_url: null } : d));
  }

  function resetAvatar() {
    setRemoveAvatarRequested(false);
    setCroppedAvatarFile(null);
    if (croppedAvatarPreview) URL.revokeObjectURL(croppedAvatarPreview);
    setCroppedAvatarPreview(null);
    if (rawAvatarPreview) URL.revokeObjectURL(rawAvatarPreview);
    setRawAvatarPreview(null);
    setShowCropModal(false);
  }

  function enterEdit() {
    if (!profile) return;

    resetAvatar();
    setDraft(profile);
    setSocialText(socialLinksToCommaText(profile.social_links));
    setContactEmail(profile.contact_info?.email?.trim() ?? "");
    setContactPhone(profile.contact_info?.phone?.trim() ?? "");
    setMode("edit");
  }

  async function onSave() {
    if (!draft) return;

    let social_links: Record<string, string> | null;
    try {
      social_links = commaTextToSocialLinks(socialText);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid social URLs");
      return;
    }

    const email = contactEmail.trim();
    const phone = contactPhone.trim();
    const contact_info =
      email || phone
        ? {
            ...(email ? { email } : {}),
            ...(phone ? { phone } : {}),
          }
        : null;

    setSaving(true);
    try {
      if (removeAvatarRequested) {
        const { error } = await removeDjAvatar();
        if (error) {
          toast.error(error);
          return;
        }
      } else if (croppedAvatarFile) {
        const { error } = await uploadDjAvatar(croppedAvatarFile);
        if (error) {
          toast.error(error);
          return;
        }
      }

      const { error } = await patchDjProfile({
        stage_name: draft.stage_name,
        bio: draft.bio,
        website: draft.website,
        social_links,
        contact_info,
      });
      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Profile saved");

      const { data: refreshed, error: refreshError } = await getDjProfile();
      if (refreshError || !refreshed) {
        toast.error(
          refreshError ?? "Profile saved, but failed to refresh profile",
        );
        return;
      }

      setProfile(refreshed);
      setDraft(refreshed);
      resetAvatar();
      setSocialText(socialLinksToCommaText(refreshed.social_links));
      setContactEmail(refreshed.contact_info?.email?.trim() ?? "");
      setContactPhone(refreshed.contact_info?.phone?.trim() ?? "");
      setMode("view");
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    if (profile) {
      setDraft(profile);
      setSocialText(socialLinksToCommaText(profile.social_links));
      setContactEmail(profile.contact_info?.email?.trim() ?? "");
      setContactPhone(profile.contact_info?.phone?.trim() ?? "");
    }
    resetAvatar();
    setMode("view");
  }

  if (loading || !profile || !draft) {
    return (
      <PageShell centralize>
        <LoadingSpinner />
      </PageShell>
    );
  }

  return (
    <PageShell centralize={false} className="px-4 py-10">
      <div className="mx-auto mt-4 w-full max-w-5xl">
        {mode === "view" ? (
          <div className="flex items-start justify-center gap-3">
            <DjProfilePublicView profile={profile} />
            <Button type="button" onClick={enterEdit} className="shrink-0">
              Edit Profile
            </Button>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-4 flex justify-end gap-2">
              <Button
                type="button"
                variant={"outline"}
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void onSave()}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>

            <div className="flex w-full flex-col gap-4">
              <label className="text-sm text-muted-80">
                Avatar
                <Input
                  disabled={saving}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="mt-1 block w-full text-sm text-accent-95 border-0 focus:border-2"
                  onChange={(e) =>
                    void onAvatarInputChange(e.target.files?.[0] ?? null)
                  }
                />
              </label>

              {(croppedAvatarPreview ||
                draft.avatar_url ||
                removeAvatarRequested) && (
                <div className="flex items-center gap-2">
                  <div className="relative h-20 w-20 shrink-0">
                    {croppedAvatarPreview || draft.avatar_url ? (
                      <Image
                        src={croppedAvatarPreview ?? draft.avatar_url ?? ""}
                        width={80}
                        height={80}
                        alt="Avatar preview"
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted-20 text-center text-xs text-muted-80">
                        Removed when you save
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onRecrop}
                      disabled={saving}
                    >
                      Re-crop
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onRemoveAvatar}
                      disabled={saving}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              )}

              <label className="text-sm text-muted-80">
                Stage name
                <Input
                  disabled={saving}
                  value={draft.stage_name}
                  className="text-accent-95 border-0 focus:border-2"
                  onChange={(e) =>
                    setDraft({ ...draft, stage_name: e.target.value })
                  }
                />
              </label>
              <label className="text-sm text-muted-80">
                Bio
                <textarea
                  disabled={saving}
                  className={textareaClassName}
                  value={draft.bio ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, bio: e.target.value || null })
                  }
                />
              </label>
              <label className="text-sm text-muted-80">
                Website
                <Input
                  disabled={saving}
                  value={draft.website ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, website: e.target.value || null })
                  }
                />
              </label>
              <label className="text-sm text-muted-80">
                Socials links (separated by comma)
                <Input
                  disabled={saving}
                  value={socialText}
                  onChange={(e) => setSocialText(e.target.value)}
                  placeholder="https://instagram.com/dj, https://soundcloud.com/dj"
                />
              </label>
              <label className="text-sm text-muted-80">
                Contact email
                <Input
                  disabled={saving}
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="dj@example.com"
                />
              </label>
              <label className="text-sm text-muted-80">
                Contact phone
                <Input
                  disabled={saving}
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {showCropModal && rawAvatarPreview && (
        <AvatarCropModal
          imageSrc={rawAvatarPreview}
          onCancel={onCropCancel}
          onConfirm={onCropConfirm}
        />
      )}
    </PageShell>
  );
}
