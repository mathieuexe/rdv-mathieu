import type { AppointmentCategory } from "@/types/domain";

interface CategoryEditorFormProps {
  action: (formData: FormData) => Promise<void>;
  category?: AppointmentCategory | null;
  title: string;
  returnPath: string;
  saved?: boolean;
  error?: string;
}

export function CategoryEditorForm({ action, category, title, returnPath, saved, error }: CategoryEditorFormProps) {
  const defaultWindow = category?.availabilityRules[0]?.windows[0];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Editeur</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Renseignez le titre, la description, la duree, les heures de disponibilite et le type de rendez-vous.
        </p>
      </div>

      <form action={action} className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <input type="hidden" name="categoryId" value={category?.id ?? ""} />
        <input type="hidden" name="returnPath" value={returnPath} />

        {saved ? (
          <div className="xl:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            La categorie a bien ete enregistree.
          </div>
        ) : null}

        {error ? (
          <div className="xl:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="space-y-5">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Titre</span>
            <input
              name="title"
              defaultValue={category?.title}
              required
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Description</span>
            <textarea
              name="description"
              rows={5}
              defaultValue={category?.description}
              required
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Durée (minutes)</span>
              <input
                name="durationMinutes"
                type="number"
                min={15}
                step={15}
                defaultValue={category?.durationMinutes ?? 30}
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Type</span>
              <select
                name="appointmentMode"
                defaultValue={category?.appointmentMode ?? "visioconference"}
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="telephone">Téléphonique</option>
                <option value="physique">Présentiel</option>
                <option value="visioconference">Visioconférence</option>
              </select>
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Slug</span>
              <input
                name="slug"
                defaultValue={category?.slug}
                placeholder="consultation-30min"
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Heure de debut</span>
              <input
                name="startTime"
                type="time"
                lang="fr-FR"
                step={900}
                defaultValue={defaultWindow?.start ?? "09:00"}
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />
              <p className="text-xs text-slate-500">Format français 24h : HH:MM</p>
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Heure de fin</span>
              <input
                name="endTime"
                type="time"
                lang="fr-FR"
                step={900}
                defaultValue={defaultWindow?.end ?? "18:00"}
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />
              <p className="text-xs text-slate-500">Format français 24h : HH:MM</p>
            </label>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5">
            <p className="text-sm font-semibold text-slate-900">Publication</p>
            <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" name="isOnline" defaultChecked={category?.isOnline ?? true} />
              <span>Catégorie visible sur le site public</span>
            </label>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5">
            <p className="text-sm font-semibold text-slate-900">Message personnalisé</p>
            <textarea
              name="customMessage"
              rows={6}
              defaultValue={category?.customMessage}
              placeholder="Instructions, congés, informations utiles..."
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_100%)] p-5 text-sm leading-7 text-slate-600">
            <p className="font-semibold text-slate-900">Disponibilites de la categorie</p>
            <p className="mt-3">
              Les heures enregistrees sont appliquees du lundi au vendredi. Vous pourrez les affiner ensuite si besoin.
            </p>
          </div>
        </div>

        <div className="xl:col-span-2">
          <button
            type="submit"
            className="inline-flex rounded-2xl bg-[linear-gradient(135deg,#4f46e5_0%,#2563eb_55%,#06b6d4_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.2)] transition hover:opacity-95"
          >
            Enregistrer la categorie
          </button>
        </div>
      </form>
    </section>
  );
}
