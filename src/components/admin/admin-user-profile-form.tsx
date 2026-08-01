"use client";

import { useActionState, useRef, useState } from "react";

import type { AdminUserActionState } from "@/app/admin/(dashboard)/actions";
import type { UserProfileRecord } from "@/types/domain";
import { PhoneInput } from "@/components/ui/phone-input";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Impossible de charger l'image."));
    image.src = src;
  });
}

async function resizeImageToJpegSquare(file: File, size: number) {
  const src = await readFileAsDataUrl(file);
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Le navigateur ne permet pas de traiter cette image.");
  }

  canvas.width = size;
  canvas.height = size;

  const minDimension = Math.min(image.width, image.height);
  const sourceX = (image.width - minDimension) / 2;
  const sourceY = (image.height - minDimension) / 2;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.drawImage(image, sourceX, sourceY, minDimension, minDimension, 0, 0, size, size);

  return canvas.toDataURL("image/jpeg", 0.86);
}

const initialState: AdminUserActionState = {
  status: "idle",
};

interface AdminUserProfileFormProps {
  user: UserProfileRecord;
  action: (state: AdminUserActionState, formData: FormData) => Promise<AdminUserActionState>;
}

export function AdminUserProfileForm({ user, action }: AdminUserProfileFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl ?? "");
  const [imageError, setImageError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setImageError("");
      const jpegDataUrl = await resizeImageToJpegSquare(file, 200);
      setAvatarPreview(jpegDataUrl);
    } catch (processingError) {
      setImageError(
        processingError instanceof Error ? processingError.message : "Impossible de traiter cette image.",
      );
    }
  }

  function clearImage() {
    setImageError("");
    setAvatarPreview("");
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="userId" value={user.userId} />
      <input type="hidden" name="avatarImageDataUrl" value={avatarPreview} />

      {imageError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {imageError}
        </div>
      )}

      <div className="flex items-center gap-6 mb-6">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-xl font-medium text-slate-400">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-slate-900">Photo de profil</p>
          <p className="text-xs text-slate-500">Format carré (recadrage automatique). JPEG recommandé.</p>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              Changer la photo
              <input 
                ref={avatarInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => void handleImageChange(e)}
              />
            </label>
            {avatarPreview && (
              <button
                type="button"
                onClick={clearImage}
                className="text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Prénom</span>
          <input
            name="firstName"
            defaultValue={user.firstName}
            disabled={pending}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Nom</span>
          <input
            name="lastName"
            defaultValue={user.lastName}
            disabled={pending}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        <span>Email</span>
        <input
          name="email"
          type="email"
          defaultValue={user.email}
          disabled={pending}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 outline-none transition focus:border-slate-950 focus:bg-white"
        />
      </label>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        <span>Téléphone</span>
        <PhoneInput
          name="phone"
          defaultValue={user.phone ?? ""}
          disabled={pending}
        />
      </label>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-rose-600" : "text-emerald-700"}`}>{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {pending ? "Enregistrement..." : "Enregistrer le dossier"}
      </button>
    </form>
  );
}
