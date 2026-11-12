import { PipelineBoard } from "@/components/admin/pipeline-board";
import { getPipelineCards } from "@/lib/pipeline";

export default async function PipelinePage() {
  const { cards, isReady } = await getPipelineCards();

  if (!isReady) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 pb-12">
        <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
          <p className="font-semibold">Une dernière étape est nécessaire.</p>
          <p className="mt-2">
            Le pipeline a besoin d&apos;une nouvelle table dans la base de données. Ouvrez l&apos;éditeur SQL de Supabase,
            collez le contenu du fichier <code className="rounded bg-amber-100 px-1">supabase/migrations/20261112100000_add_pipeline_cards.sql</code>{" "}
            puis exécutez-le. Rechargez ensuite cette page.
          </p>
        </div>
      </div>
    );
  }

  return <PipelineBoard initialCards={cards} />;
}
